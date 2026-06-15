"use client";

import { useState } from "react";
import { updateTaskStatus } from "@/app/actions/task.actions";

// Match this to the data fetched in the Server Page
interface HistoryRecord {
  action: string;
  timestamp: Date; // Changed from createdAt
  user: { name: string; role: string };
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  assignedTo: { name: string } | null;
  history: HistoryRecord[]; // Changed from historyRecords
}

export default function TesterBoard({
  tasks,
  testerId,
}: {
  tasks: Task[];
  testerId: string;
}) {
  const [taskList, setTaskList] = useState(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal State for Fail/Reject
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [bugReport, setBugReport] = useState("");

  // --- Handlers ---
  const handlePass = async () => {
    if (!activeTask) return;
    setLoading(true);

    // Update status to 'tested' and leave a success note
    const result = await updateTaskStatus(
      activeTask.id,
      "tested",
      testerId,
      "QA Passed. Ready for final PM review or Client delivery.",
    );

    if (result.success) {
      setTaskList((prev) => prev.filter((t) => t.id !== activeTask.id));
      setActiveTask(null);
    }
    setLoading(false);
  };

  const handleFail = async () => {
    if (!activeTask || !bugReport.trim()) return;
    setLoading(true);

    // Send back to the dev ('working on') and attach the bug report
    const result = await updateTaskStatus(
      activeTask.id,
      "working on", // Reverts it to the Developer's middle column
      testerId,
      `QA Failed - Bug Report: ${bugReport}`,
    );

    if (result.success) {
      setTaskList((prev) => prev.filter((t) => t.id !== activeTask.id));
      setActiveTask(null);
      setRejectModalOpen(false);
      setBugReport("");
    }
    setLoading(false);
  };

  if (taskList.length === 0) {
    return (
      <div className="bg-white p-12 text-center rounded-lg border border-gray-200 text-gray-500 shadow-sm">
        <span className="text-4xl mb-4 block">🎉</span>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Inbox Zero!</h3>
        <p>There are no tasks waiting for QA testing right now.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[750px]">
      {/* LEFT PANEL: The Queue (1/3 width) */}
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-bold text-gray-700">
            Ready for Testing ({taskList.length})
          </h2>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {taskList.map((task) => (
            <button
              key={task.id}
              onClick={() => setActiveTask(task)}
              className={`w-full text-left p-4 rounded-md border transition-all ${
                activeTask?.id === task.id
                  ? "bg-blue-50 border-blue-300 ring-1 ring-blue-300"
                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <h3 className="font-semibold text-gray-900 truncate">
                {task.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Dev:{" "}
                <span className="font-medium text-gray-700">
                  {task.assignedTo?.name || "Unknown"}
                </span>
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL: Focus Zone (2/3 width) */}
      <div className="w-full md:w-2/3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {activeTask ? (
          <>
            {/* Task Details Header */}
            <div className="p-8 border-b border-gray-200 flex-1 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeTask.title}
                </h2>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded">
                  {activeTask.priority}
                </span>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Original Instructions
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {activeTask.description}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Recent Activity
                </h4>
                <div className="space-y-4 border-l-2 border-gray-100 pl-4">
                  {activeTask.history?.map((record, i) => (
                    <div key={i} className="text-sm mb-3">
                      <span className="font-semibold text-gray-900">
                        {record.user?.name || "System"}
                      </span>{" "}
                      {record.user?.role && (
                        <span className="text-xs text-gray-400 border border-gray-200 rounded px-1 ml-1">
                          {record.user.role}
                        </span>
                      )}
                      <p className="text-gray-600 mt-1">{record.action}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(record.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex gap-4 justify-end">
              <button
                onClick={() => setRejectModalOpen(true)}
                className="px-6 py-2 bg-white border border-red-200 text-red-600 font-medium rounded hover:bg-red-50 transition-colors"
              >
                Fail (Report Bug)
              </button>
              <button
                onClick={handlePass}
                disabled={loading}
                className="px-8 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Processing..." : "Approve & Pass"}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a task from the queue to begin testing.</p>
          </div>
        )}
      </div>

      {/* REJECT MODAL */}
      {rejectModalOpen && activeTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Report Bug</h3>
            <p className="text-sm text-gray-500 mb-4">
              Describe the issue clearly. This task will be sent back to{" "}
              <strong>{activeTask.assignedTo?.name}</strong>.
            </p>

            <textarea
              autoFocus
              rows={5}
              value={bugReport}
              onChange={(e) => setBugReport(e.target.value)}
              placeholder="e.g., The form crashes when entering negative numbers..."
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-red-500 outline-none mb-4 resize-none text-black"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!bugReport.trim() || loading}
                onClick={handleFail}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Send Back to Developer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
