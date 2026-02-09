"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Download,
  RefreshCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Package,
  ExternalLink,
  MoreVertical,
  ChevronDown,
  X,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useApp } from "@/lib/context";
import {
  OrderStatus,
  OrderSource,
  OrderType,
  DeliveryPlatform,
  type Order,
  type SyncState,
} from "@/lib/types";

// Sync Status Indicator
function SyncIndicator({
  label,
  status,
}: {
  label: string;
  status: SyncState;
}) {
  const colors: Record<SyncState, string> = {
    pending: "bg-slate-200 text-slate-600",
    syncing: "bg-blue-200 text-blue-700 animate-pulse",
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    not_required: "bg-slate-100 text-slate-400",
  };

  const icons: Record<SyncState, React.ReactNode> = {
    pending: <Clock size={12} />,
    syncing: <RefreshCcw size={12} className="animate-spin" />,
    success: <CheckCircle2 size={12} />,
    failed: <AlertCircle size={12} />,
    not_required: <span className="text-[10px]">N/A</span>,
  };

  return (
    <div
      className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 ${colors[status]}`}
    >
      {icons[status]}
      {label}
    </div>
  );
}

// Order Status Badge
function StatusBadge({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "bg-slate-100 text-slate-700 border-slate-200",
    [OrderStatus.PROCESSING]: "bg-blue-50 text-blue-700 border-blue-200",
    [OrderStatus.IN_TRANSIT]: "bg-purple-50 text-purple-700 border-purple-200",
    [OrderStatus.DELIVERED]: "bg-green-50 text-green-700 border-green-200",
    [OrderStatus.CANCELLED]: "bg-red-50 text-red-700 border-red-200",
    [OrderStatus.FAILED]: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${colors[status]}`}
    >
      {status}
    </span>
  );
}

// Source Badge
function SourceBadge({
  source,
  type,
}: {
  source: OrderSource;
  type: OrderType;
}) {
  const colors: Record<OrderSource, string> = {
    [OrderSource.SHOPIFY_KENYA]: "bg-green-500",
    [OrderSource.SHOPIFY_NIGERIA]: "bg-blue-500",
    [OrderSource.B2B_ODOO]: "bg-purple-500",
  };

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${colors[source]}`} />
      <span className="text-xs font-medium text-slate-600">{source}</span>
      {type === OrderType.B2B && (
        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded">
          B2B
        </span>
      )}
    </div>
  );
}

// Order Detail Modal
function OrderDetailModal({
  order,
  onClose,
  onSync,
  onFulfill,
  onMarkDelivered,
}: {
  order: Order;
  onClose: () => void;
  onSync: (target: "odoo" | "quickbooks" | "delivery") => void;
  onFulfill: () => void;
  onMarkDelivered: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{order.id}</h2>
            <SourceBadge source={order.source} type={order.type} />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Customer Details
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Name</p>
                <p className="font-semibold text-slate-800">
                  {order.customer.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Email</p>
                <p className="font-semibold text-slate-800">
                  {order.customer.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Phone</p>
                <p className="font-semibold text-slate-800">
                  {order.customer.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Address</p>
                <p className="font-semibold text-slate-800">
                  {order.customer.address || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Order Items
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-slate-500 uppercase">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase">
                      Price
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">
                          {item.productName}
                        </p>
                        <p className="text-xs text-slate-400">{item.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {order.currency} {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {order.currency} {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-right text-sm text-slate-600"
                    >
                      Subtotal
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {order.currency} {order.subtotal.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-right text-sm text-slate-600"
                    >
                      Shipping
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {order.currency} {order.shipping.toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-right text-sm font-bold text-slate-900"
                    >
                      Total
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-lg text-slate-900">
                      {order.currency} {order.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Sync Status */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Sync Status
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">Odoo Sales Order</p>
                <SyncIndicator label="" status={order.sync.odooSO} />
                {order.sync.odooSO !== "success" &&
                  order.sync.odooSO !== "not_required" && (
                    <button
                      onClick={() => onSync("odoo")}
                      className="mt-2 text-xs text-action-blue font-semibold hover:underline"
                    >
                      Retry Sync
                    </button>
                  )}
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">Odoo Invoice</p>
                <SyncIndicator label="" status={order.sync.odooInvoice} />
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">
                  QuickBooks Invoice
                </p>
                <SyncIndicator label="" status={order.sync.qbInvoice} />
                {order.sync.qbInvoice !== "success" &&
                  order.sync.qbInvoice !== "not_required" && (
                    <button
                      onClick={() => onSync("quickbooks")}
                      className="mt-2 text-xs text-action-blue font-semibold hover:underline"
                    >
                      Retry Sync
                    </button>
                  )}
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2">
                  Delivery ({order.sync.deliveryPlatform})
                </p>
                <SyncIndicator label="" status={order.sync.delivery} />
                {order.sync.delivery !== "success" &&
                  order.sync.delivery !== "not_required" &&
                  order.type === OrderType.B2C && (
                    <button
                      onClick={() => onSync("delivery")}
                      className="mt-2 text-xs text-action-blue font-semibold hover:underline"
                    >
                      Retry Sync
                    </button>
                  )}
              </div>
            </div>
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Tracking Information
              </h3>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-600 mb-1">
                    Tracking Number
                  </p>
                  <p className="font-mono font-bold text-purple-900">
                    {order.trackingNumber}
                  </p>
                </div>
                <button className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 flex items-center gap-1">
                  Track <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
          {order.status === OrderStatus.PROCESSING && (
            <button
              onClick={onFulfill}
              className="px-4 py-2 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Truck size={16} /> Fulfill Order
            </button>
          )}
          {order.status === OrderStatus.IN_TRANSIT && (
            <button
              onClick={onMarkDelivered}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <CheckCircle2 size={16} /> Mark Delivered
            </button>
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

// Order Row Component
function OrderRow({ order }: { order: Order }) {
  const router = useRouter();

  return (
    <tr
      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
      onClick={() => router.push(`/orders/${order.id}`)}
    >
      <td className="px-4 py-4">
        <div>
          <p className="font-semibold text-slate-900">{order.id}</p>
          <p className="text-xs text-slate-400">
            {order.shopifyOrderId || order.odooInvoiceId}
          </p>
        </div>
      </td>
      <td className="px-4 py-4">
        <SourceBadge source={order.source} type={order.type} />
      </td>
      <td className="px-4 py-4">
        <p className="font-medium text-slate-800">{order.customer.name}</p>
        <p className="text-xs text-slate-400">{order.customer.email}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-bold text-slate-900">
          {order.currency} {order.total.toLocaleString()}
        </p>
        <p className="text-xs text-slate-400">{order.items.length} item(s)</p>
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-1 flex-wrap">
          <SyncIndicator label="Odoo" status={order.sync.odooSO} />
          <SyncIndicator label="QB" status={order.sync.qbInvoice} />
          {order.type === OrderType.B2C && (
            <SyncIndicator
              label={
                order.sync.deliveryPlatform === DeliveryPlatform.LETA_AI
                  ? "Leta"
                  : "Renda"
              }
              status={order.sync.delivery}
            />
          )}
        </div>
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-4 py-4 text-right">
        <button
          className="p-2 hover:bg-slate-100 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/orders/${order.id}`);
          }}
        >
          <ExternalLink size={16} className="text-slate-400" />
        </button>
      </td>
    </tr>
  );
}

export default function OrdersPage() {
  const { orders, handleSyncOrder, handleFulfillOrder, handleMarkDelivered } =
    useApp();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;
    const matchesSource =
      sourceFilter === "ALL" || order.source === sourceFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSource && matchesSearch;
  });

  return (
    <>
      <Header title="Orders" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Order Management
            </h2>
            <p className="text-sm text-slate-500">
              Manage orders from Shopify Kenya, Shopify Nigeria, and B2B Odoo
              invoices
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium text-sm hover:bg-slate-50 flex items-center gap-2">
              <Download size={16} /> Export
            </button>
            <button className="px-4 py-2 bg-action-blue text-white rounded-lg font-medium text-sm hover:bg-blue-600 flex items-center gap-2">
              <RefreshCcw size={16} /> Sync All
            </button>
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
              placeholder="Search orders..."
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
              {Object.values(OrderStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              <option value="ALL">All Sources</option>
              {Object.values(OrderSource).map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sync Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No orders found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSync={(target) => handleSyncOrder(selectedOrder.id, target)}
          onFulfill={() => {
            handleFulfillOrder(selectedOrder.id);
            setSelectedOrder(null);
          }}
          onMarkDelivered={() => {
            handleMarkDelivered(selectedOrder.id);
            setSelectedOrder(null);
          }}
        />
      )}
    </>
  );
}
