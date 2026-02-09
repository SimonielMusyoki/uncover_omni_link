"use client";

import { useState } from "react";
import {
  X,
  UserPlus,
  Mail,
  Phone,
  Building,
  Shield,
  Loader2,
  Check,
  AlertTriangle,
  Send,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { UserRole, type User, type UserPreferences } from "@/lib/types";
import { useApp } from "@/lib/context";

interface InviteUserModalProps {
  onClose: () => void;
  onInvite: (
    data: Omit<
      User,
      "id" | "createdAt" | "lastLogin" | "isActive" | "preferences" | "avatar"
    >,
  ) => void;
}

export function InviteUserModal({ onClose, onInvite }: InviteUserModalProps) {
  const { users, warehouses } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "" as UserRole | "",
    department: "",
    managerId: "",
    warehouseId: "",
  });

  // Get managers for assignment
  const managers = users.filter(
    (u) =>
      u.role === "Admin" ||
      u.role === "Manager" ||
      u.role === "Supply Chain Lead",
  );

  const departments = [
    "Supply Chain",
    "Operations",
    "Finance",
    "Marketing",
    "Sales",
    "Customer Service",
    "Human Resources",
    "IT",
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    } else if (
      users.some((u) => u.email.toLowerCase() === formData.email.toLowerCase())
    ) {
      newErrors.email = "A user with this email already exists";
    }
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.department) newErrors.department = "Department is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const selectedManager = users.find((u) => u.id === formData.managerId);
    const selectedWarehouse = warehouses.find(
      (w) => w.id === formData.warehouseId,
    );

    onInvite({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim() || undefined,
      role: formData.role as UserRole,
      department: formData.department,
      managerId: formData.managerId || undefined,
      managerName: selectedManager?.name,
      warehouseId: formData.warehouseId || undefined,
      warehouseName: selectedWarehouse?.name,
    });

    // Generate mock invite link
    const token = Math.random().toString(36).substring(2, 15);
    setInviteLink(`https://uncover-scm.com/invite/${token}`);
    setInviteSent(true);
    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Success state
  if (inviteSent) {
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Invitation Sent!
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              An invitation email has been sent to{" "}
              <span className="font-semibold">{formData.email}</span>
            </p>

            {/* Invite Link */}
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-400 mb-2">
                Or share this invite link:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className={`p-2 rounded-lg transition-colors ${
                    linkCopied
                      ? "bg-green-100 text-green-600"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {linkCopied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setInviteSent(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    role: "",
                    department: "",
                    managerId: "",
                    warehouseId: "",
                  });
                }}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Invite Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <UserPlus size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Invite User</h2>
              <p className="text-sm text-slate-500">
                Add a new team member to the system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          <div className="space-y-5">
            {/* Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                    errors.name
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Mail size={14} className="inline mr-1.5 text-slate-400" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                    errors.email
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                  placeholder="john@uncoverskincare.com"
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Phone size={14} className="inline mr-1.5 text-slate-400" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
                placeholder="+254 700 000 000"
              />
            </div>

            {/* Role & Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Shield size={14} className="inline mr-1.5 text-slate-400" />
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white ${
                    errors.role
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                >
                  <option value="">Select role</option>
                  {Object.values(UserRole).map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-xs text-red-500 mt-1">{errors.role}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Building
                    size={14}
                    className="inline mr-1.5 text-slate-400"
                  />
                  Department *
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white ${
                    errors.department
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {errors.department && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.department}
                  </p>
                )}
              </div>
            </div>

            {/* Manager */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Reports To
              </label>
              <select
                value={formData.managerId}
                onChange={(e) => handleChange("managerId", e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white"
              >
                <option value="">No manager (optional)</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Warehouse Assignment */}
            {(formData.role === UserRole.SUPPLY_CHAIN ||
              formData.role === UserRole.SUPPLY_CHAIN_LEAD) && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Assigned Warehouse
                </label>
                <select
                  value={formData.warehouseId}
                  onChange={(e) => handleChange("warehouseId", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white"
                >
                  <option value="">No warehouse (optional)</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} ({warehouse.region})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800 font-medium mb-1">
                📧 Invitation Email
              </p>
              <p className="text-xs text-blue-600">
                An email will be sent to the user with instructions to set up
                their account and password. They will have 7 days to accept the
                invitation.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Invitation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
