import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/db";
import TaskForm from "@/components/task/TaskForm";

export default async function PMTasksPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

const dbUser = await prisma.user.findUnique({
  where: { id: userId },
  select: { role: true },
});

// 1. Define exactly who is allowed on this page
const allowedRoles = ["ADMIN", "PM" , "TEAM_LEAD"];

// 2. If they don't exist OR their role is not in the list, kick them to the home page
if (!dbUser || !allowedRoles.includes(dbUser.role)) {
  redirect("/");
}

  // Fetch all eligible Team Leads
  const teamLeads = await prisma.user.findMany({
    where: { role: "TEAM_LEAD" },
    select: { id: true, name: true },
  });

  // NEW: Fetch all active projects for the dropdown
const projects = await prisma.project.findMany({
  where: { status: "ACTIVE" },
  select: { id: true, name: true },
});

 

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Task Creation Workspace
          </h1>
          <p className="text-gray-500 mt-1">
            Create new tasks and assign them to your Team Leads.
          </p>
        </div>

        {/* Pass the projects to the form */}
        <TaskForm
          currentUserId={userId}
          currentUserRole="PM"
          teamLeads={teamLeads}
          projects={projects}
        />

        {teamLeads.length === 0 && (
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200">
            <strong>Note:</strong> You currently have no users with the{" "}
            <code>TEAM_LEAD</code> role.
          </div>
        )}

        {projects.length === 0 && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded border border-red-200">
            <strong>Warning:</strong> You have no active projects. Please go to
            the PM Dashboard to create a project first.
          </div>
        )}
      </div>
    </div>
  );
}
