"use client";

import { useState } from "react";
import { assignTaskToDev } from "@/app/actions/task.actions";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  deadline: Date | null;
  assignedToId: string | null;
  assignedTo: { name: string } | null;
  createdBy: { name: string; role: string };
}

interface Dev {
  id: string;
  name: string;
}

interface AssignTaskListProps {
  tasks: Task[];
  devs: Dev[];
  teamLeadId: string;
}

export default function AssignTaskList({
  tasks,
  devs,
  teamLeadId,
}: AssignTaskListProps) {
  const [taskList, setTaskList] = useState(tasks);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAssign = async (taskId: string, devId: string) => {
    if (!devId) return;
    setLoadingId(taskId);

    const result = await assignTaskToDev(taskId, devId, teamLeadId);

    if (result.success) {
      // INSTEAD of removing the task, we update its state in the list
      setTaskList((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const devName = devs.find((d) => d.id === devId)?.name || "Unknown";
            return {
              ...t,
              assignedToId: devId,
              assignedTo: { name: devName },
              tags: ["working on"], // Instantly update the UI tag
            };
          }
          return t;
        }),
      );
    } else {
      alert("Failed to assign task.");
    }
    setLoadingId(null);
  };

  if (taskList.length === 0) {
    return (
      <div className="text-gray-500 italic p-4 bg-white rounded-lg border">
        No tasks found for your team.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-200px overflow-y-auto pr-2">
      {taskList.map((task) => (
        <div
          key={task.id}
          className="p-5 bg-white shadow-sm rounded-lg border border-gray-200 flex flex-col gap-3"
        >
          {/* Top Row: Title, Priority, Status */}
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-gray-900 text-lg">
              {task.title}
            </h3>
            <div className="flex gap-2">
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {task.priority}
              </span>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  task.tags.includes("assigned")
                    ? "bg-amber-100 text-amber-800"
                    : task.tags.includes("working on")
                      ? "bg-blue-100 text-blue-800"
                      : task.tags.includes("completed")
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {task.tags[0].toUpperCase()}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600">{task.description}</p>

          {/* Metadata Row: Creator and Deadline */}
          <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-100 pt-3">
            <div>
              <span className="font-medium text-gray-700">Created by: </span>
              {task.createdBy.name}{" "}
              <span className="text-gray-400">({task.createdBy.role})</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Deadline: </span>
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString()
                : "No deadline"}
            </div>
          </div>

          {/* Bottom Row: Assignment Controls */}
          <div className="bg-gray-50 -mx-5 -mb-5 p-3 px-5 mt-1 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {task.assignedToId
                ? `Assigned to: ${task.assignedTo?.name}`
                : "Needs Assignment"}
            </span>

            <div className="flex items-center gap-2">
              <select
                disabled={loadingId === task.id}
                value={task.assignedToId || ""}
                onChange={(e) => handleAssign(task.id, e.target.value)}
                className="border border-gray-300 rounded-md p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-black"
              >
                <option value="" disabled>
                  Assign a Dev...
                </option>
                {devs.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.name}
                  </option>
                ))}
              </select>
              {loadingId === task.id && (
                <span className="text-xs text-gray-400">Saving...</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
