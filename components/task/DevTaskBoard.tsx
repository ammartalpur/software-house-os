"use client";

import { useState } from "react";
import { updateTaskStatus } from "@/app/actions/task.actions";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  projectId: string;
  history?: { action: string }[];
}

export default function DevTaskBoard({
  tasks,
  devId,
}: {
  tasks: Task[];
  devId: string;
}) {
  const [taskList, setTaskList] = useState(tasks);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    // Check if task is already in this column
    const task = taskList.find((t) => t.id === taskId);
    if (task?.tags[0] === newStatus) return;

    if (newStatus === "completed") {
      // Open the modal to get completion details instead of instantly saving
      setActiveTaskId(taskId);
      setCompletionModalOpen(true);
    } else {
      // Instantly move it to 'working on' or back to 'assigned'
      await moveTask(taskId, newStatus);
    }
  };

  // --- API Call Helper ---
  const moveTask = async (
    taskId: string,
    newStatus: string,
    taskComment?: string,
  ) => {
    setLoading(true);

    // Optimistic UI update for immediate feedback
    setTaskList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, tags: [newStatus] } : t)),
    );

    const result = await updateTaskStatus(
      taskId,
      newStatus,
      devId,
      taskComment,
    );

    if (!result.success) {
      alert("Failed to update task. Reverting.");
      window.location.reload(); // Revert on failure
    }

    setLoading(false);
    setCompletionModalOpen(false);
    setComment("");
  };


const renderColumn = (title: string, tagId: string, bgClass: string) => {
    const columnTasks = taskList.filter(t => t.tags[0] === tagId);

    return (
      <div
        className={`flex flex-col rounded-lg p-4 min-h-150 ${bgClass} border border-gray-200`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, tagId)}
      >
        <div className="flex justify-between items-center mb-4 px-1">
          <h2 className="font-bold text-gray-700">{title}</h2>
          <span className="bg-white text-gray-600 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {columnTasks.length}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {columnTasks.map((task) => {
            // Extract the latest history action safely
            const latestHistory = task.history?.[0]?.action || "";

            // FIX 1: Use .includes() instead of .startsWith()
            const isBugged = latestHistory.includes("QA Failed");

            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                className={`bg-white p-4 rounded-md shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                  isBugged && tagId === "working on"
                    ? "border-red-500 ring-1 ring-red-500"
                    : "border-gray-200 hover:border-blue-400"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 leading-tight">
                    {task.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                  {task.description}
                </p>

                {/* FIX 2: Cleaner text extraction for the red box */}
                {isBugged && tagId === "working on" && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs font-bold text-red-800 mb-1">
                      🚨 Tester Feedback:
                    </p>
                    <p className="text-xs text-red-700 font-medium">
                      {/* This splits the string at "Bug Report: " and only shows what the tester typed after it */}
                      {latestHistory.split("Bug Report: ")[1] ||
                        "Please check history for details."}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs mt-2">
                  <span
                    className={`font-bold px-2 py-1 rounded ${
                      task.priority === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : task.priority === "NORMAL"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span className="font-mono text-gray-400">
                    {task.projectId.split("-")[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {loading && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-pulse text-sm">
          Syncing with server...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderColumn("Assigned to You", "assigned", "bg-gray-50")}
        {renderColumn("Working On", "working on", "bg-blue-50")}
        {renderColumn("Ready for Testing", "completed", "bg-green-50")}
      </div>

      {/* Completion Modal */}
      {completionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Complete Task
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Please provide details or PR links for the tester.
            </p>

            <textarea
              autoFocus
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., Fixed the bug in the nav bar. PR #42."
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500 outline-none mb-4 resize-none text-black"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCompletionModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!comment.trim() || loading}
                onClick={() =>
                  activeTaskId && moveTask(activeTaskId, "completed", comment)
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Submit & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
