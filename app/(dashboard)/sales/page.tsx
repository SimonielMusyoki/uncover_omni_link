"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/context";
import { Header } from "@/components/layout/Header";
import {
  OrderStatus,
  OrderSource,
  type Order,
  type OrderItem,
} from "@/lib/types";
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  ShoppingCart,
  Calendar,
  Filter,
  Download,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
} from "date-fns";

type DateRange =
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "thisMonth"
  | "lastMonth"
  | "custom";

type MarketFilter = "ALL" | "KENYA" | "NIGERIA";

interface SalesMetrics {
  totalUnits: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  previousUnits: number;
  previousRevenue: number;
  previousOrders: number;
}

interface ProductSales {
  productId: string;
  productName: string;
  sku: string;
  unitsSold: number;
  d2cUnits: number;
  b2bUnits: number;
  revenue: number;
  orders: number;
}

// Format currency
function formatCurrency(amount: number, currency: string = "KES") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

// Metric Card Component
function MetricCard({
  title,
  value,
  previousValue,
  prefix = "",
  suffix = "",
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  const change = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0;
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconColor}`}>
          <Icon size={20} className="text-white" />
        </div>
        {previousValue !== undefined && previousValue > 0 && (
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">
        {prefix}
        {value.toLocaleString()}
        {suffix}
      </p>
      <p className="text-sm text-slate-500 mt-1">{title}</p>
      {previousValue !== undefined && (
        <p className="text-xs text-slate-400 mt-2">
          vs {prefix}
          {previousValue.toLocaleString()}
          {suffix} previous period
        </p>
      )}
    </div>
  );
}

// Product Sales Row
function ProductSalesRow({
  product,
  rank,
  maxUnits,
}: {
  product: ProductSales;
  rank: number;
  maxUnits: number;
}) {
  const percentage = (product.unitsSold / maxUnits) * 100;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              rank === 1
                ? "bg-amber-100 text-amber-700"
                : rank === 2
                  ? "bg-slate-200 text-slate-700"
                  : rank === 3
                    ? "bg-orange-100 text-orange-700"
                    : "bg-slate-100 text-slate-500"
            }`}
          >
            {rank}
          </span>
          <div>
            <p className="font-semibold text-slate-900">
              {product.productName}
            </p>
            <p className="text-xs text-slate-400">SKU: {product.sku}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="font-bold text-slate-900 min-w-[60px]">
              {product.unitsSold.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            <span className="text-green-600 font-medium">
              {product.d2cUnits} D2C
            </span>
            {" • "}
            <span className="text-purple-600 font-medium">
              {product.b2bUnits} B2B
            </span>
          </p>
        </div>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="font-semibold text-slate-900">
          {formatCurrency(product.revenue)}
        </span>
      </td>
      <td className="px-4 py-4 text-right">
        <span className="text-slate-600">{product.orders}</span>
      </td>
    </tr>
  );
}

export default function SalesPage() {
  const { orders, products } = useApp();
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const [sourceFilter, setSourceFilter] = useState<OrderSource | "ALL">("ALL");
  const [marketFilter, setMarketFilter] = useState<MarketFilter>("ALL");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  // Calculate date boundaries
  const getDateBoundaries = (range: DateRange) => {
    const now = new Date();
    switch (range) {
      case "today":
        return {
          start: startOfDay(now),
          end: endOfDay(now),
          previousStart: startOfDay(subDays(now, 1)),
          previousEnd: endOfDay(subDays(now, 1)),
        };
      case "yesterday":
        return {
          start: startOfDay(subDays(now, 1)),
          end: endOfDay(subDays(now, 1)),
          previousStart: startOfDay(subDays(now, 2)),
          previousEnd: endOfDay(subDays(now, 2)),
        };
      case "7days":
        return {
          start: startOfDay(subDays(now, 6)),
          end: endOfDay(now),
          previousStart: startOfDay(subDays(now, 13)),
          previousEnd: endOfDay(subDays(now, 7)),
        };
      case "30days":
        return {
          start: startOfDay(subDays(now, 29)),
          end: endOfDay(now),
          previousStart: startOfDay(subDays(now, 59)),
          previousEnd: endOfDay(subDays(now, 30)),
        };
      case "thisMonth":
        return {
          start: startOfMonth(now),
          end: endOfDay(now),
          previousStart: startOfMonth(subMonths(now, 1)),
          previousEnd: endOfMonth(subMonths(now, 1)),
        };
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
          previousStart: startOfMonth(subMonths(now, 2)),
          previousEnd: endOfMonth(subMonths(now, 2)),
        };
      case "custom":
        const customStart = customStartDate
          ? startOfDay(new Date(customStartDate))
          : startOfDay(subDays(now, 29));
        const customEnd = customEndDate
          ? endOfDay(new Date(customEndDate))
          : endOfDay(now);
        const daysDiff = Math.ceil(
          (customEnd.getTime() - customStart.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          start: customStart,
          end: customEnd,
          previousStart: startOfDay(subDays(customStart, daysDiff)),
          previousEnd: endOfDay(subDays(customStart, 1)),
        };
      default:
        return {
          start: startOfDay(subDays(now, 29)),
          end: endOfDay(now),
          previousStart: startOfDay(subDays(now, 59)),
          previousEnd: endOfDay(subDays(now, 30)),
        };
    }
  };

  // Filter orders and calculate metrics
  const { currentMetrics, previousMetrics, productSales, filteredOrders } =
    useMemo(() => {
      const boundaries = getDateBoundaries(dateRange);

      // Filter orders by date range, source, and market
      const filterOrders = (start: Date, end: Date) => {
        return orders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          const inDateRange = isWithinInterval(orderDate, { start, end });
          const matchesSource =
            sourceFilter === "ALL" || order.source === sourceFilter;
          // Filter by market
          const matchesMarket =
            marketFilter === "ALL" ||
            (marketFilter === "KENYA" &&
              (order.source === OrderSource.SHOPIFY_KENYA ||
                (order.source === OrderSource.B2B_ODOO &&
                  order.currency === "KES"))) ||
            (marketFilter === "NIGERIA" &&
              (order.source === OrderSource.SHOPIFY_NIGERIA ||
                (order.source === OrderSource.B2B_ODOO &&
                  order.currency === "NGN")));
          // Only count delivered or completed orders for sales
          const isCompleted =
            order.status === OrderStatus.DELIVERED ||
            order.status === OrderStatus.IN_TRANSIT ||
            order.status === OrderStatus.PROCESSING;
          return inDateRange && matchesSource && matchesMarket && isCompleted;
        });
      };

      const currentOrders = filterOrders(boundaries.start, boundaries.end);
      const previousOrders = filterOrders(
        boundaries.previousStart,
        boundaries.previousEnd,
      );

      // Calculate metrics
      const calculateMetrics = (orderList: Order[]): SalesMetrics => {
        let totalUnits = 0;
        let totalRevenue = 0;

        orderList.forEach((order) => {
          order.items.forEach((item) => {
            totalUnits += item.quantity;
          });
          // Convert to KES for consistency (simplified)
          let revenue = order.total;
          if (order.currency === "NGN") {
            revenue = order.total * 0.0054; // Approximate NGN to KES
          }
          totalRevenue += revenue;
        });

        return {
          totalUnits,
          totalRevenue,
          totalOrders: orderList.length,
          averageOrderValue:
            orderList.length > 0 ? totalRevenue / orderList.length : 0,
          previousUnits: 0,
          previousRevenue: 0,
          previousOrders: 0,
        };
      };

      const current = calculateMetrics(currentOrders);
      const previous = calculateMetrics(previousOrders);

      // Calculate product-level sales with D2C/B2B breakdown
      const productSalesMap = new Map<string, ProductSales>();

      currentOrders.forEach((order) => {
        const isB2B = order.source === OrderSource.B2B_ODOO;
        order.items.forEach((item) => {
          const existing = productSalesMap.get(item.productId);
          let itemRevenue = item.total;
          if (order.currency === "NGN") {
            itemRevenue = item.total * 0.0054;
          }

          if (existing) {
            existing.unitsSold += item.quantity;
            if (isB2B) {
              existing.b2bUnits += item.quantity;
            } else {
              existing.d2cUnits += item.quantity;
            }
            existing.revenue += itemRevenue;
            existing.orders += 1;
          } else {
            productSalesMap.set(item.productId, {
              productId: item.productId,
              productName: item.productName,
              sku: item.sku,
              unitsSold: item.quantity,
              d2cUnits: isB2B ? 0 : item.quantity,
              b2bUnits: isB2B ? item.quantity : 0,
              revenue: itemRevenue,
              orders: 1,
            });
          }
        });
      });

      const sortedProductSales = Array.from(productSalesMap.values()).sort(
        (a, b) => b.unitsSold - a.unitsSold,
      );

      return {
        currentMetrics: current,
        previousMetrics: previous,
        productSales: sortedProductSales,
        filteredOrders: currentOrders,
      };
    }, [
      orders,
      dateRange,
      sourceFilter,
      marketFilter,
      customStartDate,
      customEndDate,
    ]);

  const maxUnits =
    productSales.length > 0
      ? Math.max(...productSales.map((p) => p.unitsSold))
      : 1;

  const dateRangeLabel = useMemo(() => {
    const boundaries = getDateBoundaries(dateRange);
    return `${format(boundaries.start, "MMM dd, yyyy")} - ${format(boundaries.end, "MMM dd, yyyy")}`;
  }, [dateRange, customStartDate, customEndDate]);

  return (
    <>
      <Header title="Sales Analytics" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Sales Analytics
            </h2>
            <p className="text-sm text-slate-500">
              Track units sold and revenue across all channels
            </p>
          </div>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-200 flex items-center gap-2">
            <Download size={16} /> Export Report
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === "custom" && (
              <>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </>
            )}

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={marketFilter}
                onChange={(e) =>
                  setMarketFilter(e.target.value as MarketFilter)
                }
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="ALL">All Markets</option>
                <option value="KENYA">Uncover Kenya</option>
                <option value="NIGERIA">Uncover Nigeria</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sourceFilter}
                onChange={(e) =>
                  setSourceFilter(e.target.value as OrderSource | "ALL")
                }
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              >
                <option value="ALL">All Channels</option>
                <option value={OrderSource.SHOPIFY_KENYA}>Shopify Kenya</option>
                <option value={OrderSource.SHOPIFY_NIGERIA}>
                  Shopify Nigeria
                </option>
                <option value={OrderSource.B2B_ODOO}>B2B (Odoo)</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-slate-500">
              {dateRangeLabel}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Units Sold"
            value={currentMetrics.totalUnits}
            previousValue={previousMetrics.totalUnits}
            icon={Package}
            iconColor="bg-purple-500"
          />
          <MetricCard
            title="Total Revenue"
            value={Math.round(currentMetrics.totalRevenue)}
            previousValue={Math.round(previousMetrics.totalRevenue)}
            prefix="KES "
            icon={DollarSign}
            iconColor="bg-green-500"
          />
          <MetricCard
            title="Total Orders"
            value={currentMetrics.totalOrders}
            previousValue={previousMetrics.totalOrders}
            icon={ShoppingCart}
            iconColor="bg-blue-500"
          />
          <MetricCard
            title="Avg Order Value"
            value={Math.round(currentMetrics.averageOrderValue)}
            previousValue={
              previousMetrics.averageOrderValue > 0
                ? Math.round(previousMetrics.averageOrderValue)
                : undefined
            }
            prefix="KES "
            icon={BarChart3}
            iconColor="bg-amber-500"
          />
        </div>

        {/* Product Sales Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Sales by Product</h3>
            <p className="text-sm text-slate-500">
              Top selling products in the selected period
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Orders
                  </th>
                </tr>
              </thead>
              <tbody>
                {productSales.map((product, index) => (
                  <ProductSalesRow
                    key={product.productId}
                    product={product}
                    rank={index + 1}
                    maxUnits={maxUnits}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {productSales.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No sales data found</p>
              <p className="text-sm">
                Try adjusting your date range or filters
              </p>
            </div>
          )}
        </div>

        {/* Sales by Channel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            OrderSource.SHOPIFY_KENYA,
            OrderSource.SHOPIFY_NIGERIA,
            OrderSource.B2B_ODOO,
          ].map((source) => {
            const sourceOrders = filteredOrders.filter(
              (o) => o.source === source,
            );
            const sourceUnits = sourceOrders.reduce(
              (acc, order) =>
                acc + order.items.reduce((sum, item) => sum + item.quantity, 0),
              0,
            );
            const sourceRevenue = sourceOrders.reduce((acc, order) => {
              let revenue = order.total;
              if (order.currency === "NGN") revenue *= 0.0054;
              return acc + revenue;
            }, 0);

            const colors: Record<OrderSource, string> = {
              [OrderSource.SHOPIFY_KENYA]: "bg-green-500",
              [OrderSource.SHOPIFY_NIGERIA]: "bg-blue-500",
              [OrderSource.B2B_ODOO]: "bg-purple-500",
            };

            return (
              <div
                key={source}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-3 h-3 rounded-full ${colors[source]}`} />
                  <span className="font-medium text-slate-900">{source}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Units Sold</span>
                    <span className="font-semibold text-slate-900">
                      {sourceUnits.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Revenue</span>
                    <span className="font-semibold text-slate-900">
                      {formatCurrency(Math.round(sourceRevenue))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Orders</span>
                    <span className="font-semibold text-slate-900">
                      {sourceOrders.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
