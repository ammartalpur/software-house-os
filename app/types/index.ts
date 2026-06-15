// src/types/index.ts

// 1. User Roles
export type UserRole = "ADMIN" | "PM" | "TEAM_LEAD" | "DEV" | "TESTER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// 2. Task Tags (Strict strings to prevent typos in the UI)
export type TaskTag =
  | "assigned"
  | "working on"
  | "completed"
  | "tested"
  | "bug"
  | "transfer_pending";

export type PriorityLevel = "LOW" | "NORMAL" | "HIGH";
export type CreatorSource = "PM_CHOICE" | "CLIENT_CHOICE" | "GENERAL";

// 3. The Main Task Interface
export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;

  // Ownership
  createdBy: string;
  creatorSource: CreatorSource;
  teamLeadId: string;
  assignedTo: string | null; // Null if TL hasn't assigned it to a Dev yet

  // State
  tags: TaskTag[];
  priority: PriorityLevel;
  deadline: Date | null;

  // Future proofing
  attachments: string[] | null;

  createdAt: Date;
  updatedAt: Date;
}

// 4. Task History Audit Log
export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  action: string; // e.g., "Tagged as bug", "Transferred to Ammar"
  timestamp: Date;
}
