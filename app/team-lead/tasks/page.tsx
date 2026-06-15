import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/db"; 
import TaskForm from "@/components/task/TaskForm";
import AssignTaskList from "@/components/task/AssignTaskList";

export default async function TeamLeadTasksPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 1. Check role in DB
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (
    !dbUser ||
    (dbUser.role !== "TEAM_LEAD" &&
      dbUser.role !== "PM" &&
      dbUser.role !== "ADMIN")
  ) {
    redirect("/");
  }

  // 2. Fetch Devs and Testers
  const devs = await prisma.user.findMany({
    where: { role: { in: ["DEV", "TESTER"] } },
    select: { id: true, name: true },
  });

  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
  });

  // 3. Fetch ALL tasks managed by this Team Lead, ordered by Deadline
  const teamTasks = await prisma.task.findMany({
    where: {
      teamLeadId: dbUser.id,
      // We removed "assignedToId: null" so we get everything!
    },
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      tags: true,
      deadline: true,
      assignedToId: true,
      // Include the name of the dev it is assigned to
      assignedTo: { select: { name: true } },
      // Include who created it (PM or Team Lead)
      createdBy: { select: { name: true, role: true } },
    },
    orderBy: {
      // 'asc' puts the closest dates at the top. 'nulls: last' puts tasks with no deadline at the bottom.
      deadline: { sort: "asc", nulls: "last" },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: The Full Task Board */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Team Board</h2>
            <p className="text-gray-500 mt-1">
              Monitor and assign all tasks. Sorted by nearest deadline.
            </p>
          </div>

          <AssignTaskList
            tasks={teamTasks}
            devs={devs}
            teamLeadId={dbUser.id}
          />
        </div>

        {/* Right Column: Create brand new tasks directly */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Create New Task
            </h2>
            <p className="text-gray-500 mt-1">
              Generate your own tasks for the team.
            </p>
          </div>
          <TaskForm
            currentUserId={dbUser.id}
            currentUserRole="TEAM_LEAD"
            devs={devs}
            projects={projects}
          />
        </div>
      </div>
    </div>
  );
}
