// src/actions/user.actions.ts
"use server";

import prisma from "@/app/lib/db";
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
interface CreateUserParams {
  name: string;
  email: string;
  role: UserRole;
}

// 1. Action to create a new user account (Admin Only feature)
export async function createUser(data: CreateUserParams) {
  try {
    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });
    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("Failed to create user:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        error: "An account with this email already exists.",
      };
    }
    return { success: false, error: "Failed to create user account." };
  }
}

// 2. Action to change a user's role (e.g., promoting a Dev to a Team Lead)
export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    revalidatePath("/admin/users");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Failed to update role:", error);
    return { success: false, error: "Failed to update user role." };
  }
}

// 3. Action to fetch all users (To display on the Admin Dashboard)
export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: "Failed to load users." };
  }
}
