"use server";

import prisma from "@/app/lib/db";
import { revalidatePath } from "next/cache";

interface CreateProjectParams {
  name: string;
  description?: string;
  createdById: string;
}

// 1. Action to create a new project
export async function createProject(data: CreateProjectParams) {
  try {
    const newProject = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description || null,
        createdBy: {
          connect: { id: data.createdById }, // Using the strict connect syntax we fixed earlier!
        },
      },
    });

    // Refresh the PM dashboard so the new project appears instantly
    revalidatePath("/pm");
    return { success: true, project: newProject };
  } catch (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project." };
  }
}

// 2. Action to fetch all projects (for dropdowns and dashboards)
export async function getAllProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, projects };
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return { success: false, projects: [], error: "Failed to load projects." };
  }
}

export async function deleteProject(projectId: string) {
  try {
    // Because of onDelete: Cascade in your schema, this automatically
    // deletes all tasks and task histories linked to this project!
    await prisma.project.delete({
      where: { id: projectId },
    });

    // Refresh the PM dashboard to show the updated list
    revalidatePath("/pm");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete project:", error);
    return { success: false, error: "Failed to delete project." };
  }
}