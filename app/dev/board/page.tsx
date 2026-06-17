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

  const myTasks = await prisma.task.findMany({
    where: { assignedToId: dbUser.id },
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
      tags: true,
      projectId: true,
      createdAt: true, // NEW: Needed for calendar "Given Date"
      deadline: true, // NEW: Needed for calendar "Deadline Date"
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
    <div className="min-h-screen bg-gray-100 p-4 lg:p-8">
      <div className="max-w-400 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Developer Workspace
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your active tasks and upcoming deadlines.
          </p>
        </div>

        <DevTaskBoard tasks={myTasks} devId={dbUser.id} />
      </div>
    </div>
  );
}
