// src/actions/task.actions.ts
"use server"; // This tells Next.js this code MUST run securely on the server

import prisma from "@/app/lib/db";
import { PriorityLevel, CreatorSource } from "@prisma/client";
import { connect } from "next/dist/client/dev/noop-turbopack-hmr";

// 1. Define what data we expect when creating a task
interface CreateTaskParams {
  title: string;
  description: string;
  projectId: string;
  createdById: string;
  teamLeadId: string;
  assignedToId?: string;
  creatorSource?: CreatorSource;
  priority?: PriorityLevel;
  deadline?: Date;
}

// 2. The function to create the task
export async function createTask(data: CreateTaskParams) {
  try {
    const newTask = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
     
        // 1. Explicitly CONNECT the relations instead of just passing strings
        project: {
          connect: {id: data.projectId}
        },
        createdBy: {
          connect: { id: data.createdById },
        },
        teamLead: {
          connect: { id: data.teamLeadId },
        },

        // 2. Only connect assignedTo if a developer was actually selected
        assignedTo: data.assignedToId
          ? { connect: { id: data.assignedToId } }
          : undefined,

        creatorSource: data.creatorSource || "PM_CHOICE",
        priority: data.priority || "NORMAL",
        deadline: data.deadline || null,
        tags: ["assigned"],
      },
    });

    // Dynamic history log based on who created it
    const historyAction = data.assignedToId
      ? "Task created and assigned directly to Developer"
      : "Task created and sent to Team Lead";

    // 3. Use connect syntax for the history log as well
    await prisma.taskHistory.create({
      data: {
        task: { connect: { id: newTask.id } },
        user: { connect: { id: data.createdById } },
        action: historyAction,
      },
    });

    return { success: true, task: newTask };
  } catch (error) {
    console.error("Failed to create task:", error);
    return { success: false, error: "Failed to create task" };
  }
}


// Add this to src/actions/task.actions.ts

export async function assignTaskToDev(taskId: string, devId: string, teamLeadId: string) {
  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignedTo: { connect: { id: devId } },
        // Remove the 'assigned' tag (which meant pending) and add 'working on'
        tags: ['working on'], 
      },
    });

    // Log the assignment in history
    await prisma.taskHistory.create({
      data: {
        task: { connect: { id: taskId } },
        user: { connect: { id: teamLeadId } },
        action: "Task assigned to Developer",
      },
    });

    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Failed to assign task:", error);
    return { success: false, error: "Failed to assign task" };
  }
}


export async function updateTaskStatus(taskId: string, newTag: string, userId: string, comment?: string) {
  try {
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { tags: [newTag] }, 
    });

    const historyAction = comment 
      ? `Task marked as ${newTag}. Note: ${comment}` 
      : `Moved task to ${newTag}`;

    await prisma.taskHistory.create({
      data: {
        task: { connect: { id: taskId } },
        user: { connect: { id: userId } },
        action: historyAction,
      },
    });

    return { success: true, task: updatedTask };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Failed to update status" };
  }
}