"use client";

import { useState } from "react";
import { createProject } from "@/app/actions/project.actions";

export default function ProjectForm({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await createProject({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      createdById: currentUserId,
    });

    if (result.success) {
      alert("Project created successfully!");
      e.currentTarget.reset();
    } else {
      alert("Error creating project.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-xl"
    >
      <h2 className="text-xl font-semibold mb-4 text-black">
        Create New Project
      </h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project Name
        </label>
        <input
          required
          name="name"
          type="text"
          placeholder="e.g., Nexus Redesign"
          className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 outline-none text-black"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          rows={3}
          placeholder="High-level goals for this project..."
          className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 outline-none text-black"
        ></textarea>
      </div>

      <button
        disabled={loading}
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Creating..." : "Initialize Project"}
      </button>
    </form>
  );
}
