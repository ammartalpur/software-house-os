import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/db";
import TesterBoard from "@/components/tester/TesterBoard";

export default async function TesterDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser || !["TESTER", "ADMIN"].includes(dbUser.role)) {
    redirect("/");
  }

  // Fetch all tasks ready for testing globally
const tasksToTest = await prisma.task.findMany({
  where: {
    tags: {
      has: "completed", 
    },
  },
  select: {
    id: true,
    title: true,
    description: true,
    priority: true,
    tags: true,
    assignedTo: { select: { name: true } },

    history: {
      orderBy: { timestamp: "desc" },
      take: 3,
      select: {
        action: true,
        timestamp: true,
        user: { select: { name: true, role: true } },
      },
    },
  },
  orderBy: { updatedAt: "desc" },
});

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">QA Testing Board</h1>
          <p className="text-gray-500 mt-1">
            Review completed tasks, verify features, and approve or reject them.
          </p>
        </div>

        <TesterBoard tasks={tasksToTest} testerId={dbUser.id} />
      </div>
    </div>
  );
}
