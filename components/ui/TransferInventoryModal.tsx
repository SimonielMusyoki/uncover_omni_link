"use client";

import { useState } from "react";
import {
  X,
  ArrowRight,
  Package,
  Warehouse,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Product, Warehouse as WarehouseType } from "@/lib/types";
import { useApp } from "@/lib/context";

interface TransferInventoryModalProps {
  product: Product;
  onClose: () => void;
  onTransfer: (
    productId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    quantity: number,
  ) => void;
}

export function TransferInventoryModal({
  product,
  onClose,
  onTransfer,
}: TransferInventoryModalProps) {
  const { warehouses } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentWarehouse = warehouses.find((w) => w.id === product.warehouseId);

  const [formData, setFormData] = useState({
    fromWarehouseId: product.warehouseId || "",
    toWarehouseId: "",
    quantity: "1",
  });

  const availableDestinations = warehouses.filter(
    (w) => w.id !== formData.fromWarehouseId,
  );

  const maxQuantity = product.availableStock;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fromWarehouseId) {
      newErrors.fromWarehouseId = "Source warehouse is required";
    }
    if (!formData.toWarehouseId) {
      newErrors.toWarehouseId = "Destination warehouse is required";
    }
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      newErrors.toWarehouseId = "Destination must be different from source";
    }

    const qty = parseInt(formData.quantity);
    if (!formData.quantity || qty <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    } else if (qty > maxQuantity) {
      newErrors.quantity = `Maximum available quantity is ${maxQuantity}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    onTransfer(
      product.id,
      formData.fromWarehouseId,
      formData.toWarehouseId,
      parseInt(formData.quantity),
    );

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

  const fromWarehouse = warehouses.find(
    (w) => w.id === formData.fromWarehouseId,
  );
  const toWarehouse = warehouses.find((w) => w.id === formData.toWarehouseId);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Transfer Inventory
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Move stock between warehouses
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Product Info */}
        <div className="px-6 pt-6">
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
              <Package size={24} className="text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">{product.name}</p>
              <p className="text-xs text-slate-400">{product.sku}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">
                {product.availableStock}
              </p>
              <p className="text-xs text-slate-400">Available</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Warehouse Selection */}
            <div className="grid grid-cols-[1fr,auto,1fr] gap-3 items-end">
              {/* From Warehouse */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  From Warehouse
                </label>
                <select
                  value={formData.fromWarehouseId}
                  onChange={(e) =>
                    handleChange("fromWarehouseId", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white ${
                    errors.fromWarehouseId
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                >
                  <option value="">Select source</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
                {errors.fromWarehouseId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.fromWarehouseId}
                  </p>
                )}
              </div>

              {/* Arrow */}
              <div className="pb-6">
                <div className="w-10 h-10 bg-action-blue/10 rounded-full flex items-center justify-center">
                  <ArrowRight size={20} className="text-action-blue" />
                </div>
              </div>

              {/* To Warehouse */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  To Warehouse
                </label>
                <select
                  value={formData.toWarehouseId}
                  onChange={(e) =>
                    handleChange("toWarehouseId", e.target.value)
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white ${
                    errors.toWarehouseId
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                >
                  <option value="">Select destination</option>
                  {availableDestinations.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
                {errors.toWarehouseId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.toWarehouseId}
                  </p>
                )}
              </div>
            </div>

            {/* Transfer Preview */}
            {fromWarehouse && toWarehouse && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-blue-600 mb-1">From</p>
                    <p className="font-semibold text-blue-800 text-sm">
                      {fromWarehouse.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      {fromWarehouse.region}
                    </p>
                  </div>
                  <ArrowRight size={20} className="text-blue-400" />
                  <div className="flex-1 text-center">
                    <p className="text-xs text-blue-600 mb-1">To</p>
                    <p className="font-semibold text-blue-800 text-sm">
                      {toWarehouse.name}
                    </p>
                    <p className="text-xs text-blue-600">
                      {toWarehouse.region}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Quantity to Transfer
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", e.target.value)}
                  className={`flex-1 px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                    errors.quantity
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    handleChange("quantity", maxQuantity.toString())
                  }
                  className="px-3 py-2.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Max ({maxQuantity})
                </button>
              </div>
              {errors.quantity && (
                <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>
              )}
            </div>

            {/* Cross-region warning */}
            {fromWarehouse &&
              toWarehouse &&
              fromWarehouse.region !== toWarehouse.region && (
                <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <AlertTriangle
                    size={20}
                    className="text-amber-600 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="font-semibold text-amber-800 text-sm">
                      Cross-Region Transfer
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      This transfer is between {fromWarehouse.region} and{" "}
                      {toWarehouse.region}. Additional shipping costs and time
                      may apply.
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || maxQuantity === 0}
              className="px-5 py-2.5 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Transfer Stock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
