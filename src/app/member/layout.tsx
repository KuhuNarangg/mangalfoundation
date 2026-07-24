import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyJwtToken } from "@/lib/jwt";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const payload = await verifyJwtToken(token);
  if (!payload || payload.role !== "member") {
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow pt-24">{children}</main>
      <Footer />
    </div>
  );
}
