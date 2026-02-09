"use client";

import { useState } from "react";
import {
  X,
  Warehouse as WarehouseIcon,
  MapPin,
  Users,
  Truck,
  Package,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { WarehouseStatus, DeliveryPlatform, type Warehouse } from "@/lib/types";
import { useApp } from "@/lib/context";

interface WarehouseFormModalProps {
  onClose: () => void;
  onSave: (data: Omit<Warehouse, "id" | "occupancy" | "lastAudit">) => void;
}

export function WarehouseFormModal({
  onClose,
  onSave,
}: WarehouseFormModalProps) {
  const { users } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    region: "" as "Kenya" | "Nigeria" | "",
    capacity: "",
    managerId: "",
    status: WarehouseStatus.ACTIVE,
    deliveryPlatform: "" as DeliveryPlatform | "",
  });

  // Get managers/admins for assignment
  const managers = users.filter(
    (u) =>
      u.role === "Admin" ||
      u.role === "Manager" ||
      u.role === "Supply Chain Lead",
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Warehouse name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.region) newErrors.region = "Region is required";
    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      newErrors.capacity = "Valid capacity is required";
    }
    if (!formData.managerId) newErrors.managerId = "Manager is required";
    if (!formData.deliveryPlatform)
      newErrors.deliveryPlatform = "Delivery platform is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const selectedManager = users.find((u) => u.id === formData.managerId);

    onSave({
      name: formData.name.trim(),
      location: formData.location.trim(),
      region: formData.region as "Kenya" | "Nigeria",
      capacity: parseInt(formData.capacity),
      manager: selectedManager?.name || "",
      managerId: formData.managerId,
      status: formData.status,
      deliveryPlatform: formData.deliveryPlatform as DeliveryPlatform,
    });

    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    // Auto-set delivery platform based on region
    if (field === "region") {
      const platform =
        value === "Kenya"
          ? DeliveryPlatform.LETA_AI
          : value === "Nigeria"
            ? DeliveryPlatform.RENDA_WMS
            : ("" as DeliveryPlatform | "");
      setFormData((prev) => ({
        ...prev,
        region: value as "Kenya" | "Nigeria" | "",
        deliveryPlatform: platform,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

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
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <WarehouseIcon size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Add Warehouse
              </h2>
              <p className="text-sm text-slate-500">
                Create a new warehouse location
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
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <WarehouseIcon
                  size={14}
                  className="inline mr-1.5 text-slate-400"
                />
                Warehouse Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                  errors.name ? "border-red-300 bg-red-50" : "border-slate-200"
                }`}
                placeholder="e.g., Nairobi Main Warehouse"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> {errors.name}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <MapPin size={14} className="inline mr-1.5 text-slate-400" />
                Location / Address *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                  errors.location
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200"
                }`}
                placeholder="e.g., Industrial Area, Nairobi"
              />
              {errors.location && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertTriangle size={12} /> {errors.location}
                </p>
              )}
            </div>

            {/* Region & Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Region *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleChange("region", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white ${
                    errors.region
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                >
                  <option value="">Select region</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Nigeria">Nigeria</option>
                </select>
                {errors.region && (
                  <p className="text-xs text-red-500 mt-1">{errors.region}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Package size={14} className="inline mr-1.5 text-slate-400" />
                  Capacity (units) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                    errors.capacity
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                  placeholder="10000"
                />
                {errors.capacity && (
                  <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
                )}
              </div>
            </div>

            {/* Manager */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Users size={14} className="inline mr-1.5 text-slate-400" />
                Warehouse Manager *
              </label>
              <select
                value={formData.managerId}
                onChange={(e) => handleChange("managerId", e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white ${
                  errors.managerId
                    ? "border-red-300 bg-red-50"
                    : "border-slate-200"
                }`}
              >
                <option value="">Select manager</option>
                {managers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.name} ({manager.role})
                  </option>
                ))}
              </select>
              {errors.managerId && (
                <p className="text-xs text-red-500 mt-1">{errors.managerId}</p>
              )}
            </div>

            {/* Delivery Platform & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Truck size={14} className="inline mr-1.5 text-slate-400" />
                  Delivery Platform *
                </label>
                <select
                  value={formData.deliveryPlatform}
                  onChange={(e) =>
                    handleChange("deliveryPlatform", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white ${
                    errors.deliveryPlatform
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                >
                  <option value="">Select platform</option>
                  <option value={DeliveryPlatform.LETA_AI}>
                    Leta AI (Kenya)
                  </option>
                  <option value={DeliveryPlatform.RENDA_WMS}>
                    Renda WMS (Nigeria)
                  </option>
                  <option value={DeliveryPlatform.NONE}>None</option>
                </select>
                {errors.deliveryPlatform && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.deliveryPlatform}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleChange("status", e.target.value as WarehouseStatus)
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white"
                >
                  <option value={WarehouseStatus.ACTIVE}>Active</option>
                  <option value={WarehouseStatus.MAINTENANCE}>
                    Maintenance
                  </option>
                  <option value={WarehouseStatus.FULL}>Full</option>
                </select>
              </div>
            </div>

            {/* Info Box */}
            {formData.region && (
              <div
                className={`p-4 rounded-xl border ${
                  formData.region === "Kenya"
                    ? "bg-cyan-50 border-cyan-200"
                    : "bg-purple-50 border-purple-200"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    formData.region === "Kenya"
                      ? "text-cyan-800"
                      : "text-purple-800"
                  }`}
                >
                  {formData.region === "Kenya"
                    ? "🇰🇪 Kenya warehouses use Leta AI for deliveries"
                    : "🇳🇬 Nigeria warehouses use Renda WMS for deliveries"}
                </p>
              </div>
            )}
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
            className="px-5 py-2.5 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check size={16} />
                Create Warehouse
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
