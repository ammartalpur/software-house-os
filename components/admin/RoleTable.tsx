"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { updateUserRole } from "@/app/actions/user.actions";

// We define a simple interface for the user data we need
interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}



export default function RoleTable({
  initialUsers,
}: {
  initialUsers: UserData[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setLoadingId(userId);

    // Call the Server Action
    const result = await updateUserRole(userId, newRole);

    if (result.success) {
      // Update the UI instantly
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
    } else {
      alert("Error updating role. Please try again.");
    }

    setLoadingId(null);
  };

  const roles: UserRole[] = ["ADMIN", "PM", "TEAM_LEAD", "DEV", "TESTER"];

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
            <th className="p-4 font-medium">Name</th>
            <th className="p-4 font-medium">Email</th>
            <th className="p-4 font-medium">Current Role</th>
            <th className="p-4 font-medium">Change Role</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 text-sm">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-medium text-gray-900">{user.name}</td>
              <td className="p-4 text-gray-500">{user.email}</td>
              <td className="p-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold tracking-wide">
                  {user.role}
                </span>
              </td>
              <td className="p-4">
                <select
                  disabled={loadingId === user.id}
                  value={user.role}
                  onChange={(e) =>
                    handleRoleChange(user.id, e.target.value as UserRole)
                  }
                  className="border border-gray-300 rounded p-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50 outline-none"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {loadingId === user.id && (
                  <span className="ml-2 text-xs text-gray-400">Saving...</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <div className="p-8 text-center text-gray-500">No users found.</div>
      )}
    </div>
  );
}
