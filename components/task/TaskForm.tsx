"use client";

import { useState } from "react";
import { createTask } from "@/app/actions/task.actions";
import { PriorityLevel } from "@prisma/client";
import Link from "next/link";

interface UserOption {
  id: string;
  name: string | null;
}

interface TaskFormProps {
  currentUserId: string;
  currentUserRole: string; // "PM" or "TEAM_LEAD"
  teamLeads?: UserOption[];
  devs?: UserOption[];
  projects?: { id: string; name: string }[]; // The new Projects array
}

export default function TaskForm({
  currentUserId,
  currentUserRole,
  teamLeads = [],
  devs = [],
  projects = [],
}: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const isTeamLead = currentUserRole === "TEAM_LEAD";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const deadlineValue = formData.get("deadline") as string;

    // Safely extract IDs and convert empty strings to null
    const teamLeadInput = formData.get("teamLeadId") as string;
    const assignedToInput = formData.get("assignedToId") as string;

    // If a PM is creating it, they pick the lead. If a Lead is creating it, they ARE the lead.
    const teamLeadId = isTeamLead ? currentUserId : teamLeadInput;

    // If we are a team lead AND we actually selected a dev, use the ID. Otherwise, null.
  const assignedToId =
    isTeamLead && assignedToInput !== "" ? assignedToInput : undefined;

    const result = await createTask({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      projectId: formData.get("projectId") as string, // Now capturing from the dropdown
      createdById: currentUserId,
      teamLeadId: teamLeadId,
      assignedToId: assignedToId,
      priority: formData.get("priority") as PriorityLevel,
      deadline: deadlineValue ? new Date(deadlineValue) : undefined,
    });

    if (result.success) {
      alert(
        isTeamLead
          ? "Task created and assigned!"
          : "Task created and sent to Team Lead!",
      );
      e.currentTarget.reset();
    } else {
      alert("Error creating task.");
    }

    setLoading(false);
  };

 return (
   <form
     onSubmit={handleSubmit}
     className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl"
   >
     <h2 className="text-xl font-semibold mb-6 text-black">Create New Task</h2>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
       <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
           Task Title
         </label>
         <input
           required
           name="title"
           type="text"
           className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 outline-none text-black"
         />
       </div>

       {/* NEW: The Dropdown for Projects instead of a text input */}
       <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
           Select Project
         </label>
         <select
           required
           name="projectId"
           className="w-full border border-gray-300 rounded p-2 bg-white focus:ring-blue-500 outline-none text-black"
         >
           <option value="">Choose a project...</option>
           {projects.map((project) => (
             <option key={project.id} value={project.id}>
               {project.name}
             </option>
           ))}
         </select>
       </div>
     </div>

     <div className="mb-4">
       <label className="block text-sm font-medium text-gray-700 mb-1">
         Description
       </label>
       <textarea
         required
         name="description"
         rows={4}
         className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 outline-none text-black"
       ></textarea>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
       {/* Dynamic Assignment Dropdown based on Role */}
       {!isTeamLead ? (
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             Assign Team Lead
           </label>
           <select
             required
             name="teamLeadId"
             className="w-full border border-gray-300 rounded p-2 bg-white focus:ring-blue-500 outline-none text-black"
           >
             <option value="">Select Lead...</option>
             {teamLeads.map((lead) => (
               <option key={lead.id} value={lead.id}>
                 {lead.name || "Unknown"}
               </option>
             ))}
           </select>
         </div>
       ) : (
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             Assign Developer
           </label>
           <select
             required
             name="assignedToId"
             className="w-full border border-gray-300 rounded p-2 bg-white focus:ring-blue-500 outline-none text-black"
           >
             <option value="">Select Dev...</option>
             {devs.map((dev) => (
               <option key={dev.id} value={dev.id}>
                 {dev.name || "Unknown"}
               </option>
             ))}
           </select>
         </div>
       )}

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
           Priority
         </label>
         <select
           name="priority"
           defaultValue="NORMAL"
           className="w-full border border-gray-300 rounded p-2 bg-white focus:ring-blue-500 outline-none text-black"
         >
           <option value="LOW">Low</option>
           <option value="NORMAL">Normal</option>
           <option value="HIGH">High</option>
         </select>
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
           Deadline
         </label>
         <input
           name="deadline"
           type="date"
           className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 outline-none text-black"
         />
       </div>
     </div>

     <div className="flex gap-4 pt-2">
       {!isTeamLead && (
         <Link
           href="/pm"
           className="w-1/3 flex items-center justify-center bg-gray-100 text-gray-700 py-2 rounded font-medium hover:bg-gray-200 transition-colors"
         >
           Go To PM Dashboard
         </Link>
       )}

       <button
         disabled={loading}
         type="submit"
         className={`${
           !isTeamLead ? "w-2/3" : "w-full"
         } bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors`}
       >
         {loading ? "Creating..." : "Create Task"}
       </button>
     </div>
   </form>
 );
}
