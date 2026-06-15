import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/db";
import ClientSummaryDashboard from "@/components/pm/ClientSummaryDashboard";

export default async function ClientSummaryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Verify role permission (PM or ADMIN only)
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser || (dbUser.role !== "PM" && dbUser.role !== "ADMIN")) {
    redirect("/");
  }

  // 1. Fetch all projects with their full relational graph
  const projectsData = await prisma.project.findMany({
    include: {
      createdBy: { select: { name: true } },
      tasks: {
        include: {
          assignedTo: { select: { name: true, role: true } },
          createdBy: { select: { name: true, role: true } },
          history: {
            orderBy: { timestamp: "desc" },
            include: { user: { select: { name: true, role: true } } },
          },
        },
        orderBy: { deadline: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 2. Fetch a global master feed of recent actions across the entire agency
  const globalActivityFeed = await prisma.taskHistory.findMany({
    take: 15,
    orderBy: { timestamp: "desc" },
    include: {
      task: { select: { title: true, projectId: true } },
      user: { select: { name: true, role: true } },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 border-b border-gray-200 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Client Summary Matrix
            </h1>
            <p className="text-gray-500 mt-1">
              Agency-wide visibility into project delivery metrics, global
              developer updates, and task histories.
            </p>
          </div>
          <div className="text-sm bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <span className="text-gray-500">Viewer Profile:</span>{" "}
            <span className="font-semibold text-blue-600 uppercase">
              {dbUser.role}
            </span>
          </div>
        </div>

        <ClientSummaryDashboard
          initialProjects={projectsData}
          globalActivity={globalActivityFeed}
        />
      </div>
    </div>
  );
}
