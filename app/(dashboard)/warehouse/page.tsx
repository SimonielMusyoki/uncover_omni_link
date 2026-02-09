"use client";

import { useState } from "react";
import {
  Warehouse as WarehouseIcon,
  MapPin,
  Package,
  Users,
  Truck,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
  Phone,
  Mail,
  Globe,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useApp } from "@/lib/context";
import { WarehouseStatus, DeliveryPlatform, type Warehouse } from "@/lib/types";
import { WarehouseFormModal } from "@/components/ui/WarehouseForm";

// Warehouse Status Badge
function StatusBadge({ status }: { status: WarehouseStatus }) {
  const configs: Record<
    WarehouseStatus,
    { color: string; icon: React.ReactNode }
  > = {
    [WarehouseStatus.ACTIVE]: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: <CheckCircle2 size={12} />,
    },
    [WarehouseStatus.MAINTENANCE]: {
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <AlertCircle size={12} />,
    },
    [WarehouseStatus.FULL]: {
      color: "bg-slate-100 text-slate-700 border-slate-200",
      icon: <AlertCircle size={12} />,
    },
  };

  const config = configs[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.color}`}
    >
      {config.icon}
      {status}
    </span>
  );
}

// Delivery Platform Badge
function DeliveryPlatformBadge({ platform }: { platform: DeliveryPlatform }) {
  const configs: Record<DeliveryPlatform, { color: string; label: string }> = {
    [DeliveryPlatform.LETA_AI]: {
      color: "bg-cyan-100 text-cyan-700 border-cyan-200",
      label: "Leta AI",
    },
    [DeliveryPlatform.RENDA_WMS]: {
      color: "bg-purple-100 text-purple-700 border-purple-200",
      label: "Renda WMS",
    },
    [DeliveryPlatform.NONE]: {
      color: "bg-slate-100 text-slate-500 border-slate-200",
      label: "None",
    },
  };

  const config = configs[platform];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${config.color}`}
    >
      <Truck size={10} />
      {config.label}
    </span>
  );
}

// Warehouse Detail Modal
function WarehouseDetailModal({
  warehouse,
  onClose,
}: {
  warehouse: Warehouse;
  onClose: () => void;
}) {
  const { products } = useApp();

  // Calculate warehouse inventory - filter products in this warehouse
  const warehouseInventory = products.filter(
    (p) => p.warehouseId === warehouse.id,
  );

  const totalUnits = warehouseInventory.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = warehouseInventory.reduce(
    (sum, p) => sum + p.stock * p.price,
    0,
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {warehouse.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <MapPin size={14} className="text-slate-400" />
              <span className="text-sm text-slate-500">
                {warehouse.location}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Status & Platform */}
          <div className="flex items-center gap-3 mb-6">
            <StatusBadge status={warehouse.status} />
            <DeliveryPlatformBadge platform={warehouse.deliveryPlatform} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-slate-900">
                {warehouseInventory.length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 mb-1">Total Units</p>
              <p className="text-2xl font-bold text-blue-700">
                {totalUnits.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 mb-1">Inventory Value</p>
              <p className="text-2xl font-bold text-green-700">
                KES {(totalValue / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>

          {/* Manager Info */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Warehouse Manager
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-action-blue rounded-full flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">
                  {warehouse.manager}
                </p>
                <p className="text-sm text-slate-500">{warehouse.location}</p>
              </div>
            </div>
          </div>

          {/* Inventory List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Inventory ({warehouseInventory.length} products)
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseInventory.slice(0, 10).map((product) => (
                    <tr key={product.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-400">{product.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">
                        KES {(product.stock * product.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {warehouseInventory.length > 10 && (
                <div className="px-4 py-2 bg-slate-50 text-center text-sm text-slate-500">
                  +{warehouseInventory.length - 10} more products
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Warehouse Card
function WarehouseCard({
  warehouse,
  onClick,
}: {
  warehouse: Warehouse;
  onClick: () => void;
}) {
  const { products } = useApp();

  // Calculate warehouse stats
  const warehouseProducts = products.filter(
    (p) => p.warehouseId === warehouse.id,
  );
  const totalUnits = warehouseProducts.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
          <WarehouseIcon size={24} className="text-slate-600" />
        </div>
        <StatusBadge status={warehouse.status} />
      </div>

      {/* Name & Location */}
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        {warehouse.name}
      </h3>
      <div className="flex items-center gap-1 text-sm text-slate-500 mb-4">
        <MapPin size={14} />
        <span>{warehouse.location}</span>
      </div>

      {/* Delivery Platform */}
      <div className="mb-4">
        <DeliveryPlatformBadge platform={warehouse.deliveryPlatform} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Products</p>
          <p className="text-lg font-bold text-slate-900">
            {warehouseProducts.length}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Total Units</p>
          <p className="text-lg font-bold text-slate-900">
            {totalUnits.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Manager */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
          <Users size={14} className="text-slate-500" />
        </div>
        <div>
          <p className="text-xs text-slate-400">Manager</p>
          <p className="text-sm font-medium text-slate-800">
            {warehouse.manager}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WarehousePage() {
  const { warehouses, products, shipments, handleAddWarehouse } = useApp();
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredWarehouses = warehouses.filter((wh) => {
    const matchesStatus = statusFilter === "ALL" || wh.status === statusFilter;
    const matchesSearch =
      wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Global stats
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter(
    (w) => w.status === WarehouseStatus.ACTIVE,
  ).length;
  const totalInventoryUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const incomingShipments = shipments.filter(
    (s) => s.status !== "RECEIVED",
  ).length;

  // Kenya vs Nigeria split
  const kenyaWarehouses = warehouses.filter(
    (w) => w.deliveryPlatform === DeliveryPlatform.LETA_AI,
  );
  const nigeriaWarehouses = warehouses.filter(
    (w) => w.deliveryPlatform === DeliveryPlatform.RENDA_WMS,
  );

  return (
    <>
      <Header title="Warehouses" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Warehouse Management
            </h2>
            <p className="text-sm text-slate-500">
              Monitor warehouses across Kenya (Leta AI) and Nigeria (Renda WMS)
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Warehouse
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <WarehouseIcon size={20} className="text-slate-400" />
              <span className="text-xs font-semibold text-green-600">
                {activeWarehouses}/{totalWarehouses} Active
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {totalWarehouses}
            </p>
            <p className="text-xs text-slate-400">Total Warehouses</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Package size={20} className="text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {totalInventoryUnits.toLocaleString()}
            </p>
            <p className="text-xs text-slate-400">Total Units</p>
          </div>
          <div className="bg-white rounded-xl border border-cyan-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Truck size={20} className="text-cyan-500" />
              <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded">
                LETA AI
              </span>
            </div>
            <p className="text-2xl font-bold text-cyan-700">
              {kenyaWarehouses.length}
            </p>
            <p className="text-xs text-slate-400">Kenya Warehouses</p>
          </div>
          <div className="bg-white rounded-xl border border-purple-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Truck size={20} className="text-purple-500" />
              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                RENDA WMS
              </span>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {nigeriaWarehouses.length}
            </p>
            <p className="text-xs text-slate-400">Nigeria Warehouses</p>
          </div>
        </div>

        {/* Incoming Shipments Alert */}
        {incomingShipments > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800">
                  Incoming Shipments
                </p>
                <p className="text-sm text-blue-700">
                  {incomingShipments} shipment(s) are currently in transit to
                  warehouses
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search warehouses..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {Object.values(WarehouseStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Kenya Warehouses */}
        {kenyaWarehouses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Globe size={16} className="text-cyan-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase">
                Kenya (Leta AI)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kenyaWarehouses
                .filter((w) => filteredWarehouses.includes(w))
                .map((warehouse) => (
                  <WarehouseCard
                    key={warehouse.id}
                    warehouse={warehouse}
                    onClick={() => setSelectedWarehouse(warehouse)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Nigeria Warehouses */}
        {nigeriaWarehouses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe size={16} className="text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase">
                Nigeria (Renda WMS)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nigeriaWarehouses
                .filter((w) => filteredWarehouses.includes(w))
                .map((warehouse) => (
                  <WarehouseCard
                    key={warehouse.id}
                    warehouse={warehouse}
                    onClick={() => setSelectedWarehouse(warehouse)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredWarehouses.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <WarehouseIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">No warehouses found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Warehouse Detail Modal */}
      {selectedWarehouse && (
        <WarehouseDetailModal
          warehouse={selectedWarehouse}
          onClose={() => setSelectedWarehouse(null)}
        />
      )}

      {/* Add Warehouse Modal */}
      {showAddModal && (
        <WarehouseFormModal
          onClose={() => setShowAddModal(false)}
          onSave={(data) => {
            handleAddWarehouse(data);
            setShowAddModal(false);
          }}
        />
      )}
    </>
  );
}
