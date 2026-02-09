"use client";

import { useState, useMemo } from "react";
import {
  ArrowRight,
  Package,
  Warehouse,
  Search,
  Check,
  X,
  Plus,
  Minus,
  AlertTriangle,
  Loader2,
  ArrowLeftRight,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useApp } from "@/lib/context";
import { StockStatus, type Product } from "@/lib/types";

interface TransferItem {
  productId: string;
  quantity: number;
}

function StockStatusBadge({ status }: { status: StockStatus }) {
  const configs: Record<StockStatus, { color: string; label: string }> = {
    [StockStatus.IN_STOCK]: {
      color: "bg-green-100 text-green-700 border-green-200",
      label: "In Stock",
    },
    [StockStatus.LOW_STOCK]: {
      color: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Low Stock",
    },
    [StockStatus.OUT_OF_STOCK]: {
      color: "bg-red-100 text-red-700 border-red-200",
      label: "Out of Stock",
    },
  };

  const config = configs[status];

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${config.color}`}
    >
      {config.label}
    </span>
  );
}

export default function TransfersPage() {
  const { products, warehouses, handleBulkTransferInventory } = useApp();

  const [fromWarehouseId, setFromWarehouseId] = useState<string>("");
  const [toWarehouseId, setToWarehouseId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [transferItems, setTransferItems] = useState<TransferItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const availableProducts = useMemo(() => {
    if (!fromWarehouseId) return [];
    return products.filter(
      (p) =>
        p.warehouseId === fromWarehouseId &&
        p.availableStock > 0 &&
        (searchTerm === "" ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [products, fromWarehouseId, searchTerm]);

  const fromWarehouse = warehouses.find((w) => w.id === fromWarehouseId);
  const toWarehouse = warehouses.find((w) => w.id === toWarehouseId);
  const availableDestinations = warehouses.filter(
    (w) => w.id !== fromWarehouseId,
  );

  const isProductSelected = (productId: string) =>
    transferItems.some((item) => item.productId === productId);

  const getItemQuantity = (productId: string) => {
    const item = transferItems.find((i) => i.productId === productId);
    return item?.quantity || 0;
  };

  const toggleProduct = (product: Product) => {
    if (isProductSelected(product.id)) {
      setTransferItems((prev) =>
        prev.filter((item) => item.productId !== product.id),
      );
    } else {
      setTransferItems((prev) => [
        ...prev,
        { productId: product.id, quantity: 1 },
      ]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const validQty = Math.max(1, Math.min(quantity, product.availableStock));
    setTransferItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: validQty } : item,
      ),
    );
  };

  const removeItem = (productId: string) => {
    setTransferItems((prev) =>
      prev.filter((item) => item.productId !== productId),
    );
  };

  const clearAll = () => {
    setTransferItems([]);
    setFromWarehouseId("");
    setToWarehouseId("");
    setSearchTerm("");
  };

  const totalUnits = transferItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const handleSubmit = async () => {
    if (
      !fromWarehouseId ||
      !toWarehouseId ||
      transferItems.length === 0 ||
      fromWarehouseId === toWarehouseId
    ) {
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    handleBulkTransferInventory(transferItems, fromWarehouseId, toWarehouseId);

    setIsSubmitting(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      clearAll();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <>
        <Header title="Transfer Inventory" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={48} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Transfer Complete!
            </h2>
            <p className="text-slate-500">
              {transferItems.length} products ({totalUnits} units) have been
              transferred to {toWarehouse?.name}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Transfer Inventory" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Bulk Inventory Transfer
          </h2>
          <p className="text-sm text-slate-500">
            Move multiple products between warehouses in a single transfer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Select Warehouses
              </h3>

              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    From Warehouse
                  </label>
                  <select
                    value={fromWarehouseId}
                    onChange={(e) => {
                      setFromWarehouseId(e.target.value);
                      setTransferItems([]);
                      if (e.target.value === toWarehouseId) {
                        setToWarehouseId("");
                      }
                    }}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white"
                  >
                    <option value="">Select source warehouse</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.region})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pb-2">
                  <div className="w-10 h-10 bg-action-blue/10 rounded-full flex items-center justify-center">
                    <ArrowRight size={20} className="text-action-blue" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    To Warehouse
                  </label>
                  <select
                    value={toWarehouseId}
                    onChange={(e) => setToWarehouseId(e.target.value)}
                    disabled={!fromWarehouseId}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">Select destination</option>
                    {availableDestinations.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name} ({wh.region})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {fromWarehouse &&
                toWarehouse &&
                fromWarehouse.region !== toWarehouse.region && (
                  <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 border border-amber-200 mt-4">
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

            {fromWarehouseId && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Select Products to Transfer
                    </h3>
                    <span className="text-xs text-slate-400">
                      {availableProducts.length} products available
                    </span>
                  </div>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {availableProducts.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Package size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No products available</p>
                      <p className="text-sm">
                        {searchTerm
                          ? "Try adjusting your search"
                          : "This warehouse has no products with available stock"}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {availableProducts.map((product) => {
                        const isSelected = isProductSelected(product.id);
                        return (
                          <div
                            key={product.id}
                            className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${
                              isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                            }`}
                            onClick={() => toggleProduct(product)}
                          >
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-action-blue border-action-blue"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && (
                                <Check size={14} className="text-white" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900 truncate">
                                  {product.name}
                                </p>
                                <StockStatusBadge status={product.status} />
                              </div>
                              <p className="text-xs text-slate-400">
                                {product.sku} • {product.availableStock}{" "}
                                available
                              </p>
                            </div>

                            {isSelected && (
                              <div
                                className="flex items-center gap-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      product.id,
                                      getItemQuantity(product.id) - 1,
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                                >
                                  <Minus size={14} />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={product.availableStock}
                                  value={getItemQuantity(product.id)}
                                  onChange={(e) =>
                                    updateQuantity(
                                      product.id,
                                      parseInt(e.target.value) || 1,
                                    )
                                  }
                                  className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-action-blue/20"
                                />
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      product.id,
                                      getItemQuantity(product.id) + 1,
                                    )
                                  }
                                  className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!fromWarehouseId && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-12 text-center">
                <Warehouse size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="font-medium text-slate-500">
                  Select a source warehouse to see available products
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 sticky top-6">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Transfer Summary
                </h3>
              </div>

              <div className="p-4">
                {fromWarehouse && toWarehouse ? (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-center">
                        <p className="text-xs text-blue-600 mb-1">From</p>
                        <p className="font-semibold text-blue-800 text-sm truncate">
                          {fromWarehouse.name}
                        </p>
                        <p className="text-xs text-blue-600">
                          {fromWarehouse.region}
                        </p>
                      </div>
                      <ArrowRight size={20} className="text-blue-400" />
                      <div className="flex-1 text-center">
                        <p className="text-xs text-blue-600 mb-1">To</p>
                        <p className="font-semibold text-blue-800 text-sm truncate">
                          {toWarehouse.name}
                        </p>
                        <p className="text-xs text-blue-600">
                          {toWarehouse.region}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 text-center">
                    <p className="text-sm text-slate-400">
                      Select source and destination warehouses
                    </p>
                  </div>
                )}

                {transferItems.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">
                        Selected Products
                      </span>
                      <button
                        onClick={() => setTransferItems([])}
                        className="text-red-600 text-xs hover:underline"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {transferItems.map((item) => {
                        const product = products.find(
                          (p) => p.id === item.productId,
                        );
                        if (!product) return null;
                        return (
                          <div
                            key={item.productId}
                            className="flex items-center gap-3 bg-slate-50 rounded-lg p-3"
                          >
                            <div className="w-8 h-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                              <Package size={14} className="text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {item.quantity} unit
                                {item.quantity !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-6 text-center mb-4">
                    <Package
                      size={32}
                      className="mx-auto mb-2 text-slate-300"
                    />
                    <p className="text-sm text-slate-400">
                      No products selected
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {transferItems.length}
                    </p>
                    <p className="text-xs text-slate-400">Products</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {totalUnits}
                    </p>
                    <p className="text-xs text-slate-400">Total Units</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      !fromWarehouseId ||
                      !toWarehouseId ||
                      transferItems.length === 0
                    }
                    className="w-full px-4 py-3 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing Transfer...
                      </>
                    ) : (
                      <>
                        <ArrowLeftRight size={18} />
                        Transfer {transferItems.length} Product
                        {transferItems.length !== 1 ? "s" : ""}
                      </>
                    )}
                  </button>
                  <button
                    onClick={clearAll}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
