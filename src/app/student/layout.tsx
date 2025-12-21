import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-emerald-600 text-white p-4 flex justify-between">
        <span className="font-bold">Student Feedback Portal</span>
        <span>{session.user.username} (Div {session.user.division})</span>
      </nav>
      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}