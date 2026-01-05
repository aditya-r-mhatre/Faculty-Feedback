import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import ChangePasswordLink from "@/components/ChangePasswordLink";

export default async function HODLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "HOD") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-indigo-700 text-white p-4 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-bold">HOD Analytics Portal</h1>
        <div className="mr-2 flex items-center gap-2">
          <ChangePasswordLink />
          <LogoutButton />
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}