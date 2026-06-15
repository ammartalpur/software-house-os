// src/app/dev/board/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/db";
import DevTaskBoard from "@/components/task/DevTaskBoard";

export default async function DeveloperBoardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser || !["DEV", "TESTER"].includes(dbUser.role)) {
    redirect("/");
  }

  // Fetch all tasks assigned to this developer
  // Fetch all tasks assigned to this developer
  const myTasks = await prisma.task.findMany({
    where: { assignedToId: dbUser.id },
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      tags: true,
      projectId: true,
      history: {
        orderBy: { timestamp: "desc" },
        take: 1,
        select: {
          action: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Developer Workspace
          </h1>
          <p className="text-gray-500 mt-1">
            Drag and drop tasks to update their status.
          </p>
        </div>

        <DevTaskBoard tasks={myTasks} devId={dbUser.id} />
      </div>
    </div>
  );
}
