"use client";

import { useTransition } from "react";
import { deleteProject } from "@/app/actions/project.actions";

export default function DeleteProjectButton({
  projectId,
}: {
  projectId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    // 1. Ask for confirmation before catastrophic deletion
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This will PERMANENTLY delete all associated tasks, history, and data. This cannot be undone.",
    );

    if (confirmed) {
      // 2. Execute the server action with a loading state
      startTransition(async () => {
        const result = await deleteProject(projectId);
        if (!result.success) {
          alert(result.error);
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete Project"}
    </button>
  );
}
