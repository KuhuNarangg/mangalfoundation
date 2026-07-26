import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Campaign from "@/models/Campaign";
import User from "@/models/User";
import Donation from "@/models/Donation";
import EmailLog from "@/models/EmailLog";
import { requireAdmin } from "@/lib/auth";
import { sendCampaignEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { getClientIp, getUserAgent } from "@/lib/request-meta";

export async function GET(req: Request) {
  const { response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10) || 25));
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const campaigns = await Campaign.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Campaign.countDocuments();

    return NextResponse.json({
      success: true,
      data: campaigns,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { session, response } = await requireAdmin(["super_admin", "admin"]);
  if (response) return response;

  try {
    const body = await req.json();
    const { title, message, linkUrl, linkText, audience, specificEmails } = body;

    if (!title || !message || !audience) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    let targetEmails: string[] = [];

    if (audience === "all_users") {
      const users = await User.find({}, "email");
      targetEmails = users.map(u => u.email);
    } else if (audience === "past_donors") {
      // Find distinct emails in successful donations
      targetEmails = await Donation.distinct("email", { paymentStatus: "success" });
    } else if (audience === "specific_users") {
      if (!specificEmails || !Array.isArray(specificEmails) || specificEmails.length === 0) {
        return NextResponse.json({ error: "No specific users selected" }, { status: 400 });
      }
      targetEmails = specificEmails;
    } else {
      return NextResponse.json({ error: "Invalid audience selected" }, { status: 400 });
    }

    // Filter out invalid or duplicate emails
    const uniqueEmails = [...new Set(targetEmails)].filter(e => e && e.includes("@"));

    if (uniqueEmails.length === 0) {
      return NextResponse.json({ error: "No recipients found for the selected audience" }, { status: 400 });
    }

    // Create Campaign Record
    const campaign = await Campaign.create({
      title,
      message,
      linkUrl,
      linkText,
      audience,
      recipientsCount: uniqueEmails.length,
      sentBy: session.username,
    });

    // Send emails (In a production environment, this should ideally be handed off to a queue/background worker like BullMQ, but for this app we'll await a Promise.all or batched loop)
    // We will batch them to avoid overwhelming the SMTP server instantly
    const BATCH_SIZE = 10;
    
    // Fire and forget so we don't block the API response for minutes if there are thousands of users
    // This is safe in serverless as long as the host supports it (like Vercel functions running until timeout, or standalone Node.js which this is)
    (async () => {
      for (let i = 0; i < uniqueEmails.length; i += BATCH_SIZE) {
        const batch = uniqueEmails.slice(i, i + BATCH_SIZE);
        await Promise.all(
          batch.map(async (email) => {
            const sent = await sendCampaignEmail(email, title, message, linkUrl, linkText);
            await EmailLog.create({
              recipient: email,
              type: "Campaign",
              subject: title,
              status: sent ? "Sent" : "Failed",
              error: sent ? "" : "SMTP failure",
            });
          })
        );
        // tiny delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    })().catch(err => console.error("Background campaign error:", err));

    await logAudit({
      action: "campaign.send",
      actorId: session.id,
      actorUsername: session.username,
      targetType: "Campaign",
      targetId: campaign._id.toString(),
      message: `Sent campaign "${title}" to ${uniqueEmails.length} recipients`,
      ip: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    return NextResponse.json({ 
      success: true, 
      message: `Campaign initiated. Sending to ${uniqueEmails.length} recipients.` 
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
