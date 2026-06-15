"use client";

import { useState } from "react";

interface UserMeta {
  name: string;
  role: string;
}

interface HistoryItem {
  id: string;
  action: string;
  timestamp: Date;
  user: UserMeta | null;
}

interface TaskWithRelations {
  id: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  projectId: string;
  assignedTo: UserMeta | null;
  createdBy: UserMeta;
  history: HistoryItem[];
}

interface ProjectWithTasks {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdBy: { name: string };
  tasks: TaskWithRelations[];
}

interface GlobalActivityItem {
  id: string;
  action: string;
  timestamp: Date;
  task: { title: true; projectId: string };
  user: UserMeta | null;
}

interface DashboardProps {
  initialProjects: ProjectWithTasks[];
  globalActivity: any[];
}

export default function ClientSummaryDashboard({
  initialProjects,
  globalActivity,
}: DashboardProps) {
  const [activeProjectId, setActiveProjectId] = useState<string>(
    initialProjects[0]?.id || "",
  );
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Calculate live agency metrics dynamically
  const totalProjects = initialProjects.length;
  const allTasks = initialProjects.flatMap((p) => p.tasks);
  const tasksInQA = allTasks.filter((t) => t.tags.includes("completed")).length;
  const tasksDelivered = allTasks.filter((t) =>
    t.tags.includes("tested"),
  ).length;

  const selectedProject = initialProjects.find((p) => p.id === activeProjectId);

  return (
    <div className="space-y-8">
      {/* 1. Macro Metric KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider block">
            Managed Projects
          </span>
          <span className="text-4xl font-extrabold text-gray-900 mt-2 block">
            {totalProjects}
          </span>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider block">
            Features In QA Testing
          </span>
          <span className="text-4xl font-extrabold text-amber-600 mt-2 block">
            {tasksInQA}
          </span>
        </div>
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider block">
            Features Verified & Delivered
          </span>
          <span className="text-4xl font-extrabold text-green-600 mt-2 block">
            {tasksDelivered}
          </span>
        </div>
      </div>

      {/* 2. Global Operational Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">
            Global Activity Feed
          </h2>
          <p className="text-xs text-gray-500">
            Real-time chronicle of modifications made across all agency
            accounts.
          </p>
        </div>
        <div className="p-6 max-h-62.5 overflow-y-auto space-y-4">
          {globalActivity.map((log) => (
            <div
              key={log.id}
              className="text-sm border-l-2 border-blue-500 pl-4 py-1 flex flex-col md:flex-row md:justify-between md:items-center gap-2"
            >
              <div>
                <span className="font-semibold text-gray-900">
                  {log.user?.name || "System"}
                </span>{" "}
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border">
                  {log.user?.role || "SYSTEM"}
                </span>{" "}
                <span className="text-gray-600">executed action on</span>{" "}
                <span className="font-medium text-gray-800">
                  "{log.task?.title}"
                </span>
                : <span className="italic text-gray-700">"{log.action}"</span>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Granular Project Task Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Project Workspace Inspector
            </h2>
            <p className="text-xs text-gray-500">
              Select a project scope below to review granular task cards.
            </p>
          </div>
          <select
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-black"
          >
            {initialProjects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name} ({proj.status})
              </option>
            ))}
          </select>
        </div>

        {selectedProject ? (
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2 text-sm text-blue-900">
              <span className="font-bold">Project Manager Owner:</span>{" "}
              {selectedProject.createdBy?.name || "Unassigned"}
              {selectedProject.description && (
                <p className="mt-2 text-blue-800 italic">
                  "{selectedProject.description}"
                </p>
              )}
            </div>

            {selectedProject.tasks.length === 0 ? (
              <p className="text-center py-8 text-gray-400 italic text-sm">
                No tasks currently mapped to this project scope.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedProject.tasks.map((task) => {
                  const isExpanded = expandedTaskId === task.id;
                  return (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm"
                    >
                      {/* Task Row Header */}
                      <div
                        onClick={() =>
                          setExpandedTaskId(isExpanded ? null : task.id)
                        }
                        className="p-4 flex items-center justify-between gap-4 hover:bg-gray-50 cursor-pointer select-none transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {task.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            Assigned Dev:{" "}
                            <span className="font-medium text-gray-700">
                              {task.assignedTo?.name || "Unassigned"}
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded uppercase border ${
                              task.priority === "HIGH"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : task.priority === "NORMAL"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                              task.tags.includes("tested")
                                ? "bg-green-100 text-green-800"
                                : task.tags.includes("completed")
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {task.tags[0] || "ASSIGNED"}
                          </span>
                          <span className="text-gray-400 font-mono text-sm">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Granular Section */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-4 text-sm animate-fadeIn">
                          <div>
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                              Functional Description
                            </h5>
                            <p className="text-gray-700 whitespace-pre-wrap bg-white border border-gray-200 p-3 rounded-lg shadow-inner">
                              {task.description}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                              Relational Activity Ledger
                            </h5>
                            <div className="space-y-3 pl-3 border-l-2 border-gray-200">
                              {task.history.map((hist) => (
                                <div key={hist.id} className="text-xs">
                                  <span className="font-semibold text-gray-800">
                                    {hist.user?.name || "System"}
                                  </span>{" "}
                                  <span className="text-gray-400 font-normal">
                                    ({hist.user?.role || "SYSTEM"})
                                  </span>
                                  :{" "}
                                  <span className="text-gray-600 italic">
                                    "{hist.action}"
                                  </span>
                                  <p className="text-[10px] text-gray-400 mt-0.5">
                                    {new Date(hist.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <p className="p-6 text-center text-gray-400">
            Initialize a project structure to inspect workspace arrays.
          </p>
        )}
      </div>
    </div>
  );
}
