import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/db";
import ProjectForm from "@/components/project/ProjectForm";
import DeleteProjectButton from "@/components/project/DeleteProjectButton"; 
import Link from "next/link";

export default async function PMDashboard() {
  // 1. Get the current logged-in user
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // 2. Security Check: Ensure they are a PM or Admin
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser || (dbUser.role !== "PM" && dbUser.role !== "ADMIN")) {
    redirect("/");
  }

  // 3. Fetch all existing projects
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { tasks: true }, // This counts how many tasks are inside each project
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Form */}
        <div className="lg:col-span-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">PM Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Manage your software house projects.
            </p>
          </div>
          <ProjectForm currentUserId={dbUser.id} />
        </div>

        {/* Right Column: Project List */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Active Projects
            </h2>
            <Link
              href="/pm/tasks"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              Go to Task Manager &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {projects.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No projects found. Create your first project to get started.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    {/* Added items-start and justify-between so the button sits on the right */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-gray-500 text-sm mt-1">
                            {project.description}
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-gray-500">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {project.status}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {project._count.tasks} Tasks
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono">
                            ID: {project.id.split("-")[0]}{" "}
                            {/* Shortened the ID visually */}
                          </span>
                        </div>
                      </div>

                      {/* --- THE DELETE BUTTON --- */}
                      <div className="shrink-0">
                        <DeleteProjectButton projectId={project.id} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
