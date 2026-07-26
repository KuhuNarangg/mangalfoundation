import { redirect } from "next/navigation";
import { getPublicSession } from "@/lib/public-auth";
import connectToDatabase from "@/lib/mongodb";
import Donation from "@/models/Donation";
import User from "@/models/User";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getPublicSession();
  
  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();
  const rawDonations = await Donation.find({ email: session.email })
    .sort({ createdAt: -1 })
    .populate("categoryId", "title")
    .lean();

  // Convert ObjectIds to strings so they can be passed to the Client Component
  const donations = rawDonations.map((d: any) => ({
    _id: d._id.toString(),
    amount: d.amount,
    receiptNumber: d.receiptNumber,
    paymentStatus: d.paymentStatus,
    createdAt: d.createdAt.toISOString(),
    categoryTitle: d.categoryId?.title || "General Donation",
  }));

  const totalDonated = donations
    .filter((d) => d.paymentStatus === "success")
    .reduce((sum, d) => sum + d.amount, 0);

  // Fetch user to get roles and member details
  const user = await User.findOne({ email: session.email }).lean();
  let userDetails = null;
  if (user) {
    userDetails = {
      name: user.name || "",
      roles: user.roles || ["user"],
      memberId: user.memberId || "",
      designation: user.designation || "",
      bloodGroup: user.bloodGroup || "",
      joiningDate: user.joiningDate ? user.joiningDate.toISOString() : "",
    };
  }

  return (
    <main className="min-h-screen bg-beige-light flex flex-col">
      <Navbar />
      <div className="flex-grow max-w-6xl w-full mx-auto px-4 py-32">
        <div className="mb-10">
          <h1 className="font-heading text-4xl text-charcoal mb-2">Welcome Back{userDetails?.name ? `, ${userDetails.name}` : ""}!</h1>
          <p className="text-charcoal-light">
            You are logged in as <span className="font-medium text-charcoal">{session.email}</span>
          </p>
        </div>
        
        <DashboardClient initialDonations={donations} totalDonated={totalDonated} user={userDetails} />
      </div>
      <Footer />
    </main>
  );
}
