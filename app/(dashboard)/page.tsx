"use client";

import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Ship,
  ClipboardList,
  ArrowRight,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCcw,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { useApp } from "@/lib/context";
import {
  OrderStatus,
  RequestStatus,
  ShipmentStatus,
  OrderSource,
} from "@/lib/types";

// KPI Card Component
function KPICard({
  title,
  value,
  subtext,
  trend,
  trendDirection,
  icon,
}: {
  title: string;
  value: string;
  subtext: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  icon: string;
}) {
  const IconComponent =
    icon === "orders"
      ? ShoppingCart
      : icon === "revenue"
        ? DollarSign
        : icon === "shipments"
          ? Ship
          : ClipboardList;
  const iconBg =
    icon === "orders"
      ? "bg-blue-50 text-blue-600"
      : icon === "revenue"
        ? "bg-green-50 text-green-600"
        : icon === "shipments"
          ? "bg-purple-50 text-purple-600"
          : "bg-amber-50 text-amber-600";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <IconComponent size={22} />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
            trendDirection === "up"
              ? "bg-green-50 text-green-600"
              : trendDirection === "down"
                ? "bg-red-50 text-red-600"
                : "bg-slate-50 text-slate-600"
          }`}
        >
          {trendDirection === "up" ? (
            <TrendingUp size={14} />
          ) : trendDirection === "down" ? (
            <TrendingDown size={14} />
          ) : null}
          {trend}
        </div>
      </div>
      <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-400">{subtext}</p>
    </div>
  );
}

// Integration Status Card
function IntegrationCard({
  name,
  iconUrl,
  color,
  status,
  lastSync,
  ordersToday,
}: {
  name: string;
  iconUrl: string;
  color: string;
  status: string;
  lastSync?: string;
  ordersToday?: number;
}) {
  const isLive = status === "Live";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg white flex items-center justify-center text-white font-bold text-sm p-1`}
        >
          <img src={`/icons/${iconUrl}.png`} alt={`${name} icon`} />
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : status === "Connected" ? "bg-blue-500" : "bg-red-500"}`}
          />
          <span className="text-xs font-medium text-slate-500">{status}</span>
        </div>
      </div>
      <h4 className="font-semibold text-slate-800 text-sm">{name}</h4>
      {ordersToday !== undefined && (
        <p className="text-xs text-slate-400 mt-1">
          {ordersToday} orders today
        </p>
      )}
      {lastSync && (
        <p className="text-xs text-slate-400 mt-1">Synced {lastSync}</p>
      )}
    </div>
  );
}

// Recent Order Row
function RecentOrderRow({
  order,
}: {
  order: {
    id: string;
    customer: { name: string };
    total: number;
    currency: string;
    status: OrderStatus;
    source: OrderSource;
  };
}) {
  const statusColors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "bg-slate-100 text-slate-700",
    [OrderStatus.PROCESSING]: "bg-blue-100 text-blue-700",
    [OrderStatus.IN_TRANSIT]: "bg-purple-100 text-purple-700",
    [OrderStatus.DELIVERED]: "bg-green-100 text-green-700",
    [OrderStatus.CANCELLED]: "bg-red-100 text-red-700",
    [OrderStatus.FAILED]: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
          <Package size={16} className="text-slate-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {order.customer.name}
          </p>
          <p className="text-xs text-slate-400">
            {order.id} • {order.source}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[order.status]}`}
        >
          {order.status}
        </span>
        <span className="text-sm font-bold text-slate-900">
          {order.currency} {order.total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// Activity Item
function ActivityItem({
  activity,
}: {
  activity: {
    type: string;
    message: string;
    details?: string;
    timestamp: string;
    userName?: string;
  };
}) {
  const typeIcons: Record<string, React.ReactNode> = {
    order: <ShoppingCart size={14} />,
    shipment: <Ship size={14} />,
    request: <ClipboardList size={14} />,
    sync: <RefreshCcw size={14} />,
    user: <CheckCircle2 size={14} />,
  };

  const typeColors: Record<string, string> = {
    order: "bg-blue-100 text-blue-600",
    shipment: "bg-purple-100 text-purple-600",
    request: "bg-amber-100 text-amber-600",
    sync: "bg-green-100 text-green-600",
    user: "bg-slate-100 text-slate-600",
  };

  const timeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 last:border-0">
      <div
        className={`w-8 h-8 rounded-lg ${typeColors[activity.type]} flex items-center justify-center shrink-0`}
      >
        {typeIcons[activity.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800">{activity.message}</p>
        {activity.details && (
          <p className="text-xs text-slate-400 truncate">{activity.details}</p>
        )}
        <p className="text-[10px] text-slate-400 mt-1">
          {activity.userName && `${activity.userName} • `}
          {timeAgo(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const {
    kpis,
    integrations,
    orders,
    requests,
    shipments,
    activityLog,
    handleSimulateShopifyOrder,
  } = useApp();

  const pendingRequests = requests.filter(
    (r) => r.status === RequestStatus.PENDING_APPROVAL,
  ).length;
  const activeShipments = shipments.filter(
    (s) => s.status !== ShipmentStatus.RECEIVED,
  ).length;
  const recentOrders = orders.slice(0, 5);

  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Quick Actions */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() =>
              handleSimulateShopifyOrder(OrderSource.SHOPIFY_KENYA)
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Zap size={16} /> Simulate Kenya Order
          </button>
          <button
            onClick={() =>
              handleSimulateShopifyOrder(OrderSource.SHOPIFY_NIGERIA)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Zap size={16} /> Simulate Nigeria Order
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, idx) => (
            <KPICard key={idx} {...kpi} />
          ))}
        </div>

        {/* Integration Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Integrations Status
            </h2>
            <span className="text-xs text-slate-400">
              All systems operational
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {integrations.map((integration) => (
              <IntegrationCard key={integration.id} {...integration} />
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Recent Orders</h2>
              <Link
                href="/orders"
                className="text-xs font-semibold text-action-blue hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-0">
              {recentOrders.map((order) => (
                <RecentOrderRow key={order.id} order={order} />
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-bold text-slate-900 mb-4">Recent Activity</h2>
            <div className="space-y-0 max-h-[400px] overflow-y-auto custom-scrollbar">
              {activityLog.slice(0, 10).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Pending Requests */}
          <Link
            href="/requests"
            className="bg-amber-50 border border-amber-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                  Pending Requests
                </p>
                <p className="text-3xl font-bold text-amber-900">
                  {pendingRequests}
                </p>
                <p className="text-xs text-amber-600 mt-1">Awaiting approval</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Clock size={24} className="text-amber-600" />
              </div>
            </div>
          </Link>

          {/* Active Shipments */}
          <Link
            href="/shipments"
            className="bg-purple-50 border border-purple-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">
                  Active Shipments
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {activeShipments}
                </p>
                <p className="text-xs text-purple-600 mt-1">
                  In transit to warehouses
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Ship size={24} className="text-purple-600" />
              </div>
            </div>
          </Link>

          {/* Low Stock Alert */}
          <Link
            href="/inventory"
            className="bg-red-50 border border-red-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
                  Low Stock Items
                </p>
                <p className="text-3xl font-bold text-red-900">3</p>
                <p className="text-xs text-red-600 mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-600" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
