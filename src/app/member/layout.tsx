import { redirect } from "next/navigation";
import { getPublicSession } from "@/lib/public-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { MemberSidebar } from "@/components/member/MemberSidebar";
import { MemberHeader } from "@/components/member/MemberHeader";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPublicSession();

  if (!session) {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await User.findById(session.id).select("name email roles memberId profilePicture").lean();

  if (!user || (!user.roles.includes("member") && !user.roles.includes("volunteer"))) {
    redirect("/login");
  }

  // Convert ObjectId to string for client component
  const safeUser = {
    ...user,
    _id: user._id.toString(),
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <MemberSidebar user={safeUser} />
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <MemberHeader user={safeUser} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
