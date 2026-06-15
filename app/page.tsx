import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/app/lib/db";

export default async function RootHomePage() {
  const { userId } = await auth();

  // 1. Unauthenticated users go straight to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Fetch the user profile using the direct ID query
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  // Fallback if the webhook hasn't finished processing the database record yet
  if (!dbUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 animate-pulse">
            Setting up your workspace...
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Please refresh in a moment if this persists.
          </p>
        </div>
      </div>
    );
  }

  // 3. Evaluate User Roles and Redirect Immediately for non-Admins
  if (dbUser.role === "PM") {
    redirect("/team-lead/tasks"); // Direct handoff to the Task Management interface
  }

  if (dbUser.role === "TEAM_LEAD") {
    redirect("/team-lead/tasks");
  }

  if (dbUser.role === "DEV") {
    redirect("/dev/board");
  }

  if (dbUser.role === "TESTER") {
    redirect("/tester/board");
  }

  // 4. If the user passes all blocks, they are an ADMIN. Render the Central Control Hub.
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Software House OS
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Welcome back, Administrator. Select an operational sector to manage.
          </p>
        </div>

        {/* 3-Button Administration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Section 1: User Management */}
          <Link
            href="/admin/users"
            className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]"
          >
            <div>
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform origin-left">
                👤
              </span>
              <h3 className="text-xl font-bold text-gray-900">
                User Directory
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Manage accounts, promote team roles, and adjust permissions.
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600 mt-4 block group-hover:translate-x-1 transition-transform">
              Manage Users &rarr;
            </span>
          </Link>

          {/* Section 2: Task Management */}
          <Link
            href="/team-lead/tasks"
            className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]"
          >
            <div>
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform origin-left">
                📋
              </span>
              <h3 className="text-xl font-bold text-gray-900">
                Task Management
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Review pipelines, create operational tickets, and trace
                handoffs.
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600 mt-4 block group-hover:translate-x-1 transition-transform">
              Manage Tasks &rarr;
            </span>
          </Link>

          {/* Section 3: Project Management */}
          <Link
            href="/pm/client-summary"
            className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]"
          >
            <div>
              <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform origin-left">
                🚀
              </span>
              <h3 className="text-xl font-bold text-gray-900">
                Project Operations
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Track client metrics, audit overall velocity, and check live
                statuses.
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600 mt-4 block group-hover:translate-x-1 transition-transform">
              Manage Projects &rarr;
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
