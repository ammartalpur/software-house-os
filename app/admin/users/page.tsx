import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/db";
import RoleTable from "@/components/admin/RoleTable";

export default async function AdminUsersPage() {
  // 1. Get the Clerk User ID
  const { userId } = await auth();

  // 2. If no active session exists, send to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  // 3. Fetch the user's role from YOUR Prisma database
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }, 
  });

  // 4. If they don't exist in the DB, or aren't an ADMIN, kick them directly home
  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/"); 
  }

  // 3. Fetch all users from the database safely
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  // 4. Render the UI
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">
            Assign roles to your team members.
          </p>
        </div>

        {/* Pass the data to our interactive Client Component */}
        <RoleTable initialUsers={users} />
      </div>
    </div>
  );
}
