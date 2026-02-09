"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  X,
  ArrowRight,
  Calendar,
  Warehouse,
  Ship,
  Plane,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useApp } from "@/lib/context";
import {
  ShipmentStatus,
  UserRole,
  type Shipment,
  type ShipmentItem,
} from "@/lib/types";

// Shipment Status Badge
function StatusBadge({ status }: { status: ShipmentStatus }) {
  const configs: Record<
    ShipmentStatus,
    { color: string; icon: React.ReactNode }
  > = {
    [ShipmentStatus.CREATED]: {
      color: "bg-slate-100 text-slate-700 border-slate-200",
      icon: <Clock size={12} />,
    },
    [ShipmentStatus.IN_TRANSIT]: {
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: <Truck size={12} />,
    },
    [ShipmentStatus.AT_PORT]: {
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <Package size={12} />,
    },
    [ShipmentStatus.CUSTOMS_CLEARANCE]: {
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: <AlertCircle size={12} />,
    },
    [ShipmentStatus.OUT_FOR_DELIVERY]: {
      color: "bg-cyan-100 text-cyan-700 border-cyan-200",
      icon: <Truck size={12} />,
    },
    [ShipmentStatus.RECEIVED]: {
      color: "bg-green-100 text-green-700 border-green-200",
      icon: <CheckCircle2 size={12} />,
    },
  };

  const config = configs[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.color}`}
    >
      {config.icon}
      {status.replace(/_/g, " ")}
    </span>
  );
}

// Create Shipment Modal
function CreateShipmentModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (
    data: Omit<
      Shipment,
      "id" | "status" | "createdAt" | "createdBy" | "createdById"
    >,
  ) => void;
}) {
  const { warehouses, products, currentUser } = useApp();
  const [origin, setOrigin] = useState("");
  const [supplier, setSupplier] = useState("");
  const [destinationWarehouseId, setDestinationWarehouseId] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedArrival, setEstimatedArrival] = useState("");
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number }>
  >([{ productId: "", quantity: 1 }]);

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: "productId" | "quantity",
    value: string | number,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(
      (item) => item.productId && item.quantity > 0,
    );
    if (
      origin &&
      supplier &&
      destinationWarehouseId &&
      carrier &&
      estimatedArrival &&
      validItems.length > 0
    ) {
      const destWarehouse = warehouses.find(
        (w) => w.id === destinationWarehouseId,
      );
      const shipmentItems: ShipmentItem[] = validItems.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return {
          productId: item.productId,
          productName: product?.name || "",
          sku: product?.sku || "",
          quantity: item.quantity,
          unitCost: product?.costPrice || 0,
          totalCost: (product?.costPrice || 0) * item.quantity,
        };
      });

      const totalUnits = shipmentItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const totalValue = shipmentItems.reduce(
        (sum, item) => sum + item.totalCost,
        0,
      );

      onSubmit({
        reference: `SHP-${Date.now()}`,
        supplier,
        origin,
        destinationWarehouseId,
        destinationWarehouse: destWarehouse?.name || "",
        items: shipmentItems,
        totalUnits,
        totalValue,
        currency: "USD",
        carrier,
        trackingNumber: trackingNumber || undefined,
        estimatedArrival,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Create New Shipment
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-4"
        >
          {/* Supplier */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Supplier *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              placeholder="e.g., ABC Manufacturing Co."
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              required
            />
          </div>

          {/* Origin */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Origin (Factory Location) *
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              placeholder="e.g., Guangzhou, China"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
            />
          </div>

          {/* Destination Warehouse */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Destination Warehouse *
            </label>
            <select
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              value={destinationWarehouseId}
              onChange={(e) => setDestinationWarehouseId(e.target.value)}
              required
            >
              <option value="">Select warehouse</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} - {wh.location}
                </option>
              ))}
            </select>
          </div>

          {/* Carrier & Tracking */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Carrier *
              </label>
              <select
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                required
              >
                <option value="">Select carrier</option>
                <option value="DHL">DHL</option>
                <option value="FedEx">FedEx</option>
                <option value="UPS">UPS</option>
                <option value="Maersk">Maersk (Sea)</option>
                <option value="MSC">MSC (Sea)</option>
                <option value="Air Cargo">Air Cargo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
                placeholder="e.g., DHL1234567890 (optional)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Estimated Arrival */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Estimated Arrival *
            </label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              value={estimatedArrival}
              onChange={(e) => setEstimatedArrival(e.target.value)}
              required
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">
                Items *
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-action-blue font-semibold hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
                    value={item.productId}
                    onChange={(e) =>
                      updateItem(index, "productId", e.target.value)
                    }
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    className="w-24 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseInt(e.target.value))
                    }
                    required
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            className="px-4 py-2 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <Ship size={16} /> Create Shipment
          </button>
        </div>
      </div>
    </div>
  );
}

// Shipment Detail Modal
function ShipmentDetailModal({
  shipment,
  onClose,
  onUpdateStatus,
  onReceive,
}: {
  shipment: Shipment;
  onClose: () => void;
  onUpdateStatus: (status: ShipmentStatus) => void;
  onReceive: () => void;
}) {
  const { warehouses, products } = useApp();
  const destinationWarehouse = warehouses.find(
    (w) => w.id === shipment.destinationWarehouseId,
  );

  const statusSteps = [
    ShipmentStatus.CREATED,
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.AT_PORT,
    ShipmentStatus.CUSTOMS_CLEARANCE,
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.RECEIVED,
  ];

  const currentStepIndex = statusSteps.indexOf(shipment.status);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{shipment.id}</h2>
            <p className="text-sm text-slate-500">
              {shipment.carrier} - {shipment.trackingNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Status Timeline */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              Shipment Progress
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-4">
                {statusSteps.map((status, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div
                      key={status}
                      className="relative flex items-center gap-4"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                          isCompleted
                            ? isCurrent
                              ? "bg-action-blue"
                              : "bg-green-500"
                            : "bg-slate-200"
                        }`}
                      >
                        {isCompleted && !isCurrent ? (
                          <CheckCircle2 size={16} className="text-white" />
                        ) : isCurrent ? (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 bg-slate-400 rounded-full" />
                        )}
                      </div>
                      <div>
                        <p
                          className={`font-semibold text-sm ${
                            isCompleted ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {status.replace(/_/g, " ")}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-action-blue">
                            Current Status
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Route Info */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Route Information
            </h3>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">Origin</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />{" "}
                    {shipment.origin}
                  </p>
                </div>
                <ArrowRight size={20} className="text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-1">Destination</p>
                  <p className="font-semibold text-slate-800 flex items-center gap-1">
                    <Warehouse size={14} className="text-slate-400" />{" "}
                    {destinationWarehouse?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {destinationWarehouse?.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Items</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shipment.items.map((item, idx) => {
                    const product = products.find(
                      (p) => p.id === item.productId,
                    );
                    return (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">
                            {product?.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            SKU: {product?.sku}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {item.quantity}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Created</p>
              <p className="font-semibold text-slate-800 text-sm">
                {new Date(shipment.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Est. Arrival</p>
              <p className="font-semibold text-slate-800 text-sm">
                {new Date(shipment.estimatedArrival).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Received</p>
              <p className="font-semibold text-slate-800 text-sm">
                {shipment.actualArrival
                  ? new Date(shipment.actualArrival).toLocaleDateString()
                  : "Pending"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end flex-wrap">
          {shipment.status !== ShipmentStatus.RECEIVED && (
            <>
              {shipment.status === ShipmentStatus.OUT_FOR_DELIVERY ? (
                <button
                  onClick={onReceive}
                  className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> Receive Shipment
                </button>
              ) : (
                <select
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onUpdateStatus(e.target.value as ShipmentStatus);
                    }
                  }}
                >
                  <option value="">Update Status...</option>
                  {statusSteps
                    .filter(
                      (s) =>
                        statusSteps.indexOf(s) > currentStepIndex &&
                        s !== ShipmentStatus.RECEIVED,
                    )
                    .map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                </select>
              )}
            </>
          )}
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

// Shipment Card
function ShipmentCard({
  shipment,
  onClick,
}: {
  shipment: Shipment;
  onClick: () => void;
}) {
  const { warehouses, products } = useApp();
  const destinationWarehouse = warehouses.find(
    (w) => w.id === shipment.destinationWarehouseId,
  );

  const totalItems = shipment.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-slate-900">{shipment.id}</p>
          <p className="text-xs text-slate-400">{shipment.carrier}</p>
        </div>
        <StatusBadge status={shipment.status} />
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
        <MapPin size={14} className="text-slate-400" />
        <span className="truncate">{shipment.origin}</span>
        <ArrowRight size={14} className="text-slate-400" />
        <Warehouse size={14} className="text-slate-400" />
        <span className="truncate">{destinationWarehouse?.name}</span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-slate-400">
          <Package size={12} />
          <span>
            {shipment.items.length} product(s), {totalItems} units
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar size={12} />
          <span>
            ETA: {new Date(shipment.estimatedArrival).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Tracking:{" "}
          <span className="font-mono text-slate-600">
            {shipment.trackingNumber}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function ShipmentsPage() {
  const {
    shipments,
    currentUser,
    handleCreateShipment,
    handleUpdateShipmentStatus,
    handleReceiveShipment,
  } = useApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const canCreate =
    currentUser.role === UserRole.SUPPLY_CHAIN_LEAD ||
    currentUser.role === UserRole.ADMIN;

  const filteredShipments = shipments.filter((shipment) => {
    const matchesStatus =
      statusFilter === "ALL" || shipment.status === statusFilter;
    const matchesSearch =
      shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.trackingNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Group by status for visual organization
  const activeShipments = filteredShipments.filter(
    (s) => s.status !== ShipmentStatus.RECEIVED,
  );
  const receivedShipments = filteredShipments.filter(
    (s) => s.status === ShipmentStatus.RECEIVED,
  );

  return (
    <>
      <Header title="Shipments" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Shipment Tracking
            </h2>
            <p className="text-sm text-slate-500">
              Track shipments from factories to warehouses
            </p>
          </div>
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-action-blue text-white rounded-lg font-medium text-sm hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus size={16} /> New Shipment
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">In Transit</p>
            <p className="text-2xl font-bold text-purple-600">
              {
                shipments.filter((s) => s.status === ShipmentStatus.IN_TRANSIT)
                  .length
              }
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">Customs Clearance</p>
            <p className="text-2xl font-bold text-amber-600">
              {
                shipments.filter(
                  (s) => s.status === ShipmentStatus.CUSTOMS_CLEARANCE,
                ).length
              }
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">Out for Delivery</p>
            <p className="text-2xl font-bold text-cyan-600">
              {
                shipments.filter(
                  (s) => s.status === ShipmentStatus.OUT_FOR_DELIVERY,
                ).length
              }
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-400 mb-1">Received This Month</p>
            <p className="text-2xl font-bold text-green-600">
              {
                shipments.filter((s) => s.status === ShipmentStatus.RECEIVED)
                  .length
              }
            </p>
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
              placeholder="Search shipments..."
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
              {Object.values(ShipmentStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Shipments */}
        {activeShipments.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">
              Active Shipments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeShipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onClick={() => setSelectedShipment(shipment)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Received Shipments */}
        {receivedShipments.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">
              Recently Received
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {receivedShipments.map((shipment) => (
                <ShipmentCard
                  key={shipment.id}
                  shipment={shipment}
                  onClick={() => setSelectedShipment(shipment)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredShipments.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Ship size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">No shipments found</p>
            <p className="text-sm">
              Create a new shipment to track inventory in transit
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateShipmentModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => {
            handleCreateShipment(data);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Detail Modal */}
      {selectedShipment && (
        <ShipmentDetailModal
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onUpdateStatus={(status) => {
            handleUpdateShipmentStatus(selectedShipment.id, status);
            setSelectedShipment(null);
          }}
          onReceive={() => {
            handleReceiveShipment(selectedShipment.id);
            setSelectedShipment(null);
          }}
        />
      )}
    </>
  );
}
