"use client";

import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/context";
import {
  OrderStatus,
  OrderSource,
  OrderType,
  DeliveryPlatform,
  type Order,
  type OrderEvent,
  type SyncState,
} from "@/lib/types";
import { format } from "date-fns";
import {
  ArrowLeft,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  CreditCard,
  RefreshCcw,
  FileText,
  ExternalLink,
  Copy,
  Link2,
  PackageCheck,
  CircleDot,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";

// Format currency
function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

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
    pending: <Clock size={14} />,
    syncing: <RefreshCcw size={14} className="animate-spin" />,
    success: <CheckCircle2 size={14} />,
    failed: <AlertCircle size={14} />,
    not_required: <span className="text-xs">N/A</span>,
  };

  return (
    <div
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${colors[status]}`}
    >
      {icons[status]}
      {label}
    </div>
  );
}

// Order Status Badge
function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<OrderStatus, { color: string; icon: React.ReactNode }> =
    {
      [OrderStatus.PENDING]: {
        color: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <Clock size={14} />,
      },
      [OrderStatus.PROCESSING]: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: <RefreshCcw size={14} />,
      },
      [OrderStatus.IN_TRANSIT]: {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: <Truck size={14} />,
      },
      [OrderStatus.DELIVERED]: {
        color: "bg-green-50 text-green-700 border-green-200",
        icon: <CheckCircle2 size={14} />,
      },
      [OrderStatus.CANCELLED]: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: <XCircle size={14} />,
      },
      [OrderStatus.FAILED]: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: <AlertCircle size={14} />,
      },
    };

  const { color, icon } = config[status];

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-sm font-semibold border flex items-center gap-2 ${color}`}
    >
      {icon}
      {status}
    </span>
  );
}

// Timeline Event Icon
function getEventIcon(type: OrderEvent["type"]) {
  const iconMap: Record<OrderEvent["type"], React.ReactNode> = {
    created: <Package size={16} />,
    payment_received: <CreditCard size={16} />,
    synced_odoo: <Link2 size={16} />,
    synced_quickbooks: <Link2 size={16} />,
    synced_delivery: <Truck size={16} />,
    processing: <RefreshCcw size={16} />,
    fulfilled: <PackageCheck size={16} />,
    shipped: <Truck size={16} />,
    out_for_delivery: <Truck size={16} />,
    delivered: <CheckCircle2 size={16} />,
    cancelled: <XCircle size={16} />,
    failed: <AlertCircle size={16} />,
    note: <MessageSquare size={16} />,
  };
  return iconMap[type] || <CircleDot size={16} />;
}

// Timeline Event Color
function getEventColor(type: OrderEvent["type"]) {
  const colorMap: Record<OrderEvent["type"], string> = {
    created: "bg-slate-500",
    payment_received: "bg-green-500",
    synced_odoo: "bg-purple-500",
    synced_quickbooks: "bg-blue-500",
    synced_delivery: "bg-orange-500",
    processing: "bg-blue-500",
    fulfilled: "bg-indigo-500",
    shipped: "bg-purple-500",
    out_for_delivery: "bg-amber-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
    failed: "bg-red-500",
    note: "bg-slate-400",
  };
  return colorMap[type] || "bg-slate-400";
}

// Order Timeline Component
function OrderTimeline({ events }: { events: OrderEvent[] }) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return (
    <div className="relative">
      {sortedEvents.map((event, index) => {
        const isLast = index === sortedEvents.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Timeline Line */}
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-200" />
            )}

            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${getEventColor(event.type)}`}
              >
                {getEventIcon(event.type)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-sm text-slate-600 mt-0.5">
                      {event.description}
                    </p>
                  )}
                  {event.metadata && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600"
                        >
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {format(new Date(event.timestamp), "MMM dd, h:mm a")}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { orders } = useApp();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const orderId = params.id as string;
  const order = orders.find((o) => o.id === orderId);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Package className="h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Order Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The order you're looking for doesn't exist.
        </p>
        <button
          onClick={() => router.push("/orders")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
      </div>
    );
  }

  const sourceColors: Record<OrderSource, string> = {
    [OrderSource.SHOPIFY_KENYA]: "bg-green-500",
    [OrderSource.SHOPIFY_NIGERIA]: "bg-blue-500",
    [OrderSource.B2B_ODOO]: "bg-purple-500",
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{order.id}</h1>
              <button
                onClick={() => copyToClipboard(order.id, "orderId")}
                className="p-1 hover:bg-slate-100 rounded"
                title="Copy Order ID"
              >
                {copiedField === "orderId" ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="text-slate-400" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${sourceColors[order.source]}`}
                />
                <span className="text-sm text-slate-600">{order.source}</span>
              </div>
              <span className="text-slate-300">•</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  order.type === OrderType.B2C
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {order.type}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-sm text-slate-500">
                {format(new Date(order.createdAt), "MMM dd, yyyy 'at' h:mm a")}
              </span>
            </div>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Order Items</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Package size={20} className="text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(item.total, order.currency)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.quantity} ×{" "}
                      {formatCurrency(item.unitPrice, order.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900">
                    {formatCurrency(order.subtotal, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="text-slate-900">
                    {formatCurrency(order.shipping, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-slate-200">
                  <span className="text-slate-900">Total</span>
                  <span className="text-slate-900">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-6">
              Order Timeline
            </h2>
            {order.events && order.events.length > 0 ? (
              <OrderTimeline events={order.events} />
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p>No timeline events yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Customer</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="font-medium text-slate-900">
                    {order.customer.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-slate-400 mt-0.5" />
                <p className="text-sm text-slate-600">{order.customer.email}</p>
              </div>
              {order.customer.phone && (
                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-slate-400 mt-0.5" />
                  <p className="text-sm text-slate-600">
                    {order.customer.phone}
                  </p>
                </div>
              )}
              {order.customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-slate-400 mt-0.5" />
                  <p className="text-sm text-slate-600">
                    {order.customer.address}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sync Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Sync Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Odoo SO</span>
                <SyncIndicator label="" status={order.sync.odooSO} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Odoo Invoice</span>
                <SyncIndicator label="" status={order.sync.odooInvoice} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">QuickBooks</span>
                <SyncIndicator label="" status={order.sync.qbInvoice} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Delivery</span>
                <SyncIndicator label="" status={order.sync.delivery} />
              </div>
              {order.sync.deliveryPlatform !== DeliveryPlatform.NONE && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Delivery Platform</p>
                  <p className="font-medium text-slate-900">
                    {order.sync.deliveryPlatform}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order References */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900 mb-4">References</h2>
            <div className="space-y-3">
              {order.shopifyOrderId && (
                <div>
                  <p className="text-xs text-slate-500">Shopify Order ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-slate-900">
                      {order.shopifyOrderId}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(order.shopifyOrderId!, "shopify")
                      }
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      {copiedField === "shopify" ? (
                        <CheckCircle2 size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} className="text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {order.odooInvoiceId && (
                <div>
                  <p className="text-xs text-slate-500">Odoo Invoice ID</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-slate-900">
                      {order.odooInvoiceId}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(order.odooInvoiceId!, "odoo")
                      }
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      {copiedField === "odoo" ? (
                        <CheckCircle2 size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} className="text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <p className="text-xs text-slate-500">Tracking Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-slate-900">
                      {order.trackingNumber}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(order.trackingNumber!, "tracking")
                      }
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      {copiedField === "tracking" ? (
                        <CheckCircle2 size={14} className="text-green-600" />
                      ) : (
                        <Copy size={14} className="text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="font-semibold text-slate-900 mb-4">Timestamps</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Created</p>
                <p className="text-sm text-slate-900">
                  {format(
                    new Date(order.createdAt),
                    "MMM dd, yyyy 'at' h:mm a",
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Updated</p>
                <p className="text-sm text-slate-900">
                  {format(
                    new Date(order.updatedAt),
                    "MMM dd, yyyy 'at' h:mm a",
                  )}
                </p>
              </div>
              {order.fulfilledAt && (
                <div>
                  <p className="text-xs text-slate-500">Fulfilled</p>
                  <p className="text-sm text-slate-900">
                    {format(
                      new Date(order.fulfilledAt),
                      "MMM dd, yyyy 'at' h:mm a",
                    )}
                  </p>
                </div>
              )}
              {order.deliveredAt && (
                <div>
                  <p className="text-xs text-slate-500">Delivered</p>
                  <p className="text-sm text-slate-900">
                    {format(
                      new Date(order.deliveredAt),
                      "MMM dd, yyyy 'at' h:mm a",
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
