"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Calendar,
  X,
  Settings,
  Bell,
  UserPlus,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useApp } from "@/lib/context";
import {
  UserRole,
  type User as UserType,
  type UserPreferences,
} from "@/lib/types";
import { InviteUserModal } from "@/components/ui/UserInviteForm";

// Role Badge
function RoleBadge({ role }: { role: UserRole }) {
  const configs: Record<UserRole, { color: string; icon: React.ReactNode }> = {
    [UserRole.ADMIN]: {
      color: "bg-red-100 text-red-700 border-red-200",
      icon: <Shield size={12} />,
    },
    [UserRole.SUPPLY_CHAIN_LEAD]: {
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: <Shield size={12} />,
    },
    [UserRole.SUPPLY_CHAIN]: {
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <User size={12} />,
    },
    [UserRole.MANAGER]: {
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <Shield size={12} />,
    },
    [UserRole.EMPLOYEE]: {
      color: "bg-slate-100 text-slate-700 border-slate-200",
      icon: <User size={12} />,
    },
  };

  const config = configs[role];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.color}`}
    >
      {config.icon}
      {role.replace(/_/g, " ")}
    </span>
  );
}

// Status Badge
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
        isActive
          ? "bg-green-100 text-green-700 border-green-200"
          : "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

// User Detail Modal
function UserDetailModal({
  user,
  onClose,
  onUpdatePreferences,
  onToggleStatus,
}: {
  user: UserType;
  onClose: () => void;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onToggleStatus: () => void;
}) {
  const { currentUser } = useApp();
  const [preferences, setPreferences] = useState(user.preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const canEdit = currentUser.role === UserRole.ADMIN;

  const handlePreferenceChange = (
    key: keyof UserPreferences,
    value: boolean | string,
  ) => {
    setPreferences({ ...preferences, [key]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdatePreferences(preferences);
    setHasChanges(false);
  };

  // Generate avatar color from user name
  const getAvatarColor = (name: string) => {
    const colors = [
      "#3b82f6",
      "#10b981",
      "#8b5cf6",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ backgroundColor: getAvatarColor(user.name) }}
            >
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
              <RoleBadge role={user.role} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {/* Contact Info */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="font-medium text-slate-800">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                  <Phone size={16} className="text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="font-medium text-slate-800">{user.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                <Calendar size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Member Since</p>
                  <p className="font-medium text-slate-800">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Account Status
            </h3>
            <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <StatusBadge isActive={user.isActive} />
                <span className="text-sm text-slate-600">
                  {user.isActive
                    ? "User can access the system"
                    : "User is currently disabled"}
                </span>
              </div>
              {canEdit && user.id !== currentUser.id && (
                <button
                  onClick={onToggleStatus}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    user.isActive
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Preferences
            </h3>
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell size={18} className="text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-800">
                      Email Notifications
                    </p>
                    <p className="text-xs text-slate-500">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.emailNotifications}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "emailNotifications",
                        e.target.checked,
                      )
                    }
                    disabled={!canEdit && user.id !== currentUser.id}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-blue"></div>
                </label>
              </div>

              {/* SMS Notifications */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-800">
                      SMS Notifications
                    </p>
                    <p className="text-xs text-slate-500">
                      Receive updates via SMS
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.smsNotifications}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "smsNotifications",
                        e.target.checked,
                      )
                    }
                    disabled={!canEdit && user.id !== currentUser.id}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-blue"></div>
                </label>
              </div>

              {/* Dashboard Layout */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Settings size={18} className="text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-800">
                      Dashboard Layout
                    </p>
                    <p className="text-xs text-slate-500">
                      Preferred dashboard view
                    </p>
                  </div>
                </div>
                <select
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  value={preferences.dashboardLayout}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "dashboardLayout",
                      e.target.value as "compact" | "detailed",
                    )
                  }
                  disabled={!canEdit && user.id !== currentUser.id}
                >
                  <option value="compact">Compact</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>

              {/* Language */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Settings size={18} className="text-slate-400" />
                  <div>
                    <p className="font-medium text-slate-800">Language</p>
                    <p className="text-xs text-slate-500">Preferred language</p>
                  </div>
                </div>
                <select
                  className="w-full mt-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                  value={preferences.language}
                  onChange={(e) =>
                    handlePreferenceChange(
                      "language",
                      e.target.value as "en" | "fr",
                    )
                  }
                  disabled={!canEdit && user.id !== currentUser.id}
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
          {hasChanges && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600"
            >
              Save Changes
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
          >
            {hasChanges ? "Cancel" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

// User Row
function UserRow({ user, onClick }: { user: UserType; onClick: () => void }) {
  // Generate avatar color from user name
  const getAvatarColor = (name: string) => {
    const colors = [
      "#3b82f6",
      "#10b981",
      "#8b5cf6",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <tr
      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: getAvatarColor(user.name) }}
          >
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-400">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-slate-600">{user.department}</p>
      </td>
      <td className="px-4 py-4">
        <StatusBadge isActive={user.isActive} />
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-slate-600">
          {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </td>
    </tr>
  );
}

export default function UsersPage() {
  const {
    users,
    currentUser,
    handleUpdateUserPreferences,
    handleToggleUserStatus,
    handleInviteUser,
  } = useApp();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && user.isActive) ||
      (statusFilter === "INACTIVE" && !user.isActive);
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const adminUsers = users.filter((u) => u.role === UserRole.ADMIN).length;
  const scUsers = users.filter(
    (u) =>
      u.role === UserRole.SUPPLY_CHAIN || u.role === UserRole.SUPPLY_CHAIN_LEAD,
  ).length;

  return (
    <>
      <Header title="Users" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              User Management
            </h2>
            <p className="text-sm text-slate-500">
              Manage user accounts, roles, and preferences
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <UserPlus size={18} />
            Invite User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <User size={20} className="text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalUsers}</p>
            <p className="text-xs text-slate-400">Total Users</p>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
            <p className="text-xs text-slate-400">Active Users</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield size={20} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{adminUsers}</p>
            <p className="text-xs text-slate-400">Administrators</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <User size={20} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{scUsers}</p>
            <p className="text-xs text-slate-400">Supply Chain</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              {Object.values(UserRole).map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onClick={() => setSelectedUser(user)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No users found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdatePreferences={(prefs) => {
            handleUpdateUserPreferences(selectedUser.id, prefs);
            setSelectedUser({
              ...selectedUser,
              preferences: { ...selectedUser.preferences, ...prefs },
            });
          }}
          onToggleStatus={() => {
            handleToggleUserStatus(selectedUser.id);
            setSelectedUser({
              ...selectedUser,
              isActive: !selectedUser.isActive,
            });
          }}
        />
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <InviteUserModal
          onClose={() => setShowInviteModal(false)}
          onInvite={(data) => {
            handleInviteUser(data);
          }}
        />
      )}
    </>
  );
}
