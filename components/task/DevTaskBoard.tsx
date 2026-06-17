"use client";

import { useState } from "react";
import { updateTaskStatus } from "@/app/actions/task.actions";
import { isSameDay, format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  projectId: string;
  createdAt: Date;
  deadline?: Date | null;
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

  // NEW: Calendar State
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  // Modal State
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (!taskId) return;

    const task = taskList.find((t) => t.id === taskId);
    if (task?.tags[0] === newStatus) return;

    if (newStatus === "completed") {
      setActiveTaskId(taskId);
      setCompletionModalOpen(true);
    } else {
      await moveTask(taskId, newStatus);
    }
  };

  const moveTask = async (
    taskId: string,
    newStatus: string,
    taskComment?: string,
  ) => {
    setLoading(true);
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
      window.location.reload();
    }

    setLoading(false);
    setCompletionModalOpen(false);
    setComment("");
  };

  const renderColumn = (title: string, tagId: string, bgClass: string) => {
    const columnTasks = taskList.filter((t) => t.tags[0] === tagId);

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
            const latestHistory = task.history?.[0]?.action || "";
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

                {isBugged && tagId === "working on" && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs font-bold text-red-800 mb-1">
                      🚨 Tester Feedback:
                    </p>
                    <p className="text-xs text-red-700 font-medium">
                      {latestHistory.split("Bug Report: ")[1] ||
                        "Please check history for details."}
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs mt-2">
                  <div className="flex gap-2">
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
                    {task.deadline && (
                      <span className="font-medium bg-red-50 text-red-600 px-2 py-1 rounded flex items-center gap-1 border border-red-100">
                        ⏱{" "}
                        {new Date(task.deadline).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
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

  // --- CALENDAR DATA PREPARATION ---

  // 1. Custom Day Renderer (v9+ Syntax) using DayButton
  const CustomDayButton = (props: any) => {
    // In v9, the date object is inside `props.day.date`
    const { day, modifiers, ...buttonProps } = props;
    const date = day.date;

    const hasDeadline = taskList.some(
      (t) => t.deadline && isSameDay(new Date(t.deadline), date),
    );
    const hasGiven = taskList.some(
      (t) => t.createdAt && isSameDay(new Date(t.createdAt), date),
    );

    return (
      <button
        {...buttonProps}
        className={`${buttonProps.className || ""} relative flex flex-col items-center justify-center p-1 w-full h-full`}
      >
        {/* Render the actual day number */}
        <span>{date.getDate()}</span>

        {/* Render our custom task indicator dots */}
        <div className="absolute bottom-0 flex gap-1">
          {hasGiven && (
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          )}
          {hasDeadline && (
            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
          )}
        </div>
      </button>
    );
  };

  // 2. Filter tasks based on the selected date in the calendar
  const selectedDateTasks = taskList.filter((task) => {
    if (!selectedDate) return false;
    const isGiven =
      task.createdAt && isSameDay(new Date(task.createdAt), selectedDate);
    const isDeadline =
      task.deadline && isSameDay(new Date(task.deadline), selectedDate);
    return isGiven || isDeadline;
  });

  return (
    <>
      {/* Global override to style the react-day-picker to match Tailwind Blue */}
      <style jsx global>{`
        .rdp {
          --rdp-accent-color: #2563eb;
          --rdp-background-color: #eff6ff;
          margin: 0;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .rdp-day_selected,
        .rdp-day_selected:focus-visible,
        .rdp-day_selected:hover {
          color: white;
          background-color: #2563eb;
        }
      `}</style>

      {loading && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow-lg z-50 animate-pulse text-sm">
          Syncing with server...
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderColumn("Assigned to You", "assigned", "bg-gray-50")}
          {renderColumn("Working On", "working on", "bg-blue-50")}
          {renderColumn("Ready for Testing", "completed", "bg-green-50")}
        </div>

        <div className="w-full xl:w-96 flex flex-col gap-6 shrink-0">
          {/* LIBRARY CALENDAR */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 overflow-hidden text-black">
            <div className="flex gap-4 mb-2 justify-center text-xs text-gray-500 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Given
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Deadline
              </div>
            </div>

          <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              showOutsideDays
              components={{ DayButton: CustomDayButton }} 
            />
          </div>

          {/* DYNAMIC SELECTED DATE DETAILS */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex-1">
            <h3 className="font-bold text-gray-900 mb-4 flex justify-between items-center border-b pb-2">
              <span>
                {selectedDate
                  ? format(selectedDate, "MMM do, yyyy")
                  : "Upcoming"}
              </span>
              <button
                onClick={() => setSelectedDate(undefined)}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear
              </button>
            </h3>

            <div className="flex flex-col gap-3">
              {/* If a date is clicked and has tasks: */}
              {selectedDate && selectedDateTasks.length > 0 ? (
                selectedDateTasks.map((task) => {
                  const isDueToday =
                    task.deadline &&
                    isSameDay(new Date(task.deadline), selectedDate);
                  return (
                    <div
                      key={`agenda-${task.id}`}
                      className={`p-3 rounded border ${isDueToday ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"}`}
                    >
                      <div className="flex justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {task.title}
                        </p>
                        <span
                          className={`text-xs font-bold ${isDueToday ? "text-red-600" : "text-blue-600"}`}
                        >
                          {isDueToday ? "DUE TODAY" : "ASSIGNED"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 capitalize line-clamp-1">
                        Status: {task.tags[0]}
                      </p>
                    </div>
                  );
                })
              ) : selectedDate ? (
                /* If a date is clicked but has NO tasks: */
                <p className="text-sm text-gray-400 italic text-center py-8">
                  No events on this day.
                </p>
              ) : (
                /* If NO date is clicked (Default fallback agenda view): */
                taskList
                  .filter(
                    (t) =>
                      t.deadline &&
                      t.tags[0] !== "completed" &&
                      t.tags[0] !== "tested",
                  )
                  .sort(
                    (a, b) =>
                      new Date(a.deadline!).getTime() -
                      new Date(b.deadline!).getTime(),
                  )
                  .slice(0, 5)
                  .map((task) => (
                    <div
                      key={`agenda-${task.id}`}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {task.tags[0]}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-red-600">
                          {new Date(task.deadline!).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {completionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Complete Task
            </h3>
            <textarea
              autoFocus
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., Fixed the bug in the nav bar. PR #42."
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-green-500 outline-none mb-4 resize-none text-black mt-2"
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
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
