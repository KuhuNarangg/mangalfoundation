import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import "@/models/Category";
import "@/models/Package";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatINR, formatDate } from "@/lib/format";
import { paymentMethodLabel } from "@/lib/receipt";
import { siteConfig } from "@/lib/site";
import { ReceiptActions } from "./ReceiptActions";

export const dynamic = "force-dynamic";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  await connectToDatabase();
  const d: any = await Donation.findById(id)
    .populate("categoryId", "title")
    .populate("packageId", "title")
    .lean();

  if (!d || d.paymentStatus !== "success") notFound();

  const rows: [string, string][] = [
    ["Receipt No.", d.receiptNumber || "—"],
    ["Date", formatDate(d.createdAt)],
    ["Donor", d.isAnonymous ? "Anonymous Donor (Gupt Daan)" : d.donorName],
    ["Category", d.categoryId?.title || "General Donation"],
    ...(d.packageId?.title ? ([["Package", d.packageId.title]] as [string, string][]) : []),
    ["Payment Method", paymentMethodLabel(d)],
    ...(d.razorpayPaymentId
      ? ([["Transaction ID", d.razorpayPaymentId]] as [string, string][])
      : []),
    ...(d.pan ? ([["PAN", String(d.pan).toUpperCase()]] as [string, string][]) : []),
    ...(d.gst ? ([["GST", String(d.gst).toUpperCase()]] as [string, string][]) : []),
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg print:shadow-none overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white p-8 flex items-center gap-4 print:bg-white print:text-black print:border-b">
          <div className="bg-white rounded-lg p-1.5 flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="Mangal Guruji Foundation"
              width={64}
              height={64}
              className="h-16 w-16 object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{siteConfig.name}</h1>
            <p className="text-sm opacity-90">{siteConfig.tagline}</p>
            {siteConfig.email && (
              <p className="text-xs opacity-80 mt-1">{siteConfig.email}</p>
            )}
          </div>
        </div>

        <div className="px-8 pt-6">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-lg font-bold uppercase tracking-widest text-gray-700">
              Donation Receipt
            </h2>
            <span className="text-3xl font-bold text-emerald-600">
              {formatINR(d.amount)}
            </span>
          </div>
        </div>

        <div className="px-8 py-6">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-gray-100 last:border-0">
                  <td className="py-2.5 text-gray-500 align-top">{k}</td>
                  <td className="py-2.5 text-gray-900 font-medium text-right break-words">
                    {v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 pb-6">
          <div className="bg-gray-50 rounded-lg p-5 text-center">
            <p className="text-gray-700 text-sm leading-relaxed">
              Thank you for your generous contribution. Your support directly
              empowers our initiatives in food, clothing, women empowerment, and
              temple renovation.
            </p>
            <p className="mt-3 font-heading text-lg font-semibold text-gray-900">
              With gratitude, {siteConfig.name}
            </p>
          </div>

          {/* 80G tax-exemption — automatically shown once the foundation sets its
              80G registration number (env: NEXT_PUBLIC_80G_NUMBER). No code change needed. */}
          {process.env.NEXT_PUBLIC_80G_NUMBER && (
            <p className="text-xs text-gray-500 mt-4 text-center">
              This donation is eligible for tax exemption under Section 80G.
              Registration No: {process.env.NEXT_PUBLIC_80G_NUMBER}
            </p>
          )}

          <p className="text-[11px] text-gray-400 mt-4 text-center">
            This is a computer-generated receipt and does not require a signature.
          </p>
        </div>

        <ReceiptActions />
      </div>
    </div>
  );
}
