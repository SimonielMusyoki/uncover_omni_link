"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse as WarehouseIcon,
  Settings,
  HelpCircle,
  Rocket,
  ClipboardList,
  Ship,
  Users,
  ChevronRight,
  ArrowLeftRight,
} from "lucide-react";
import { useApp } from "@/lib/context";
import {
  RequestStatus,
  ShipmentStatus,
  ProductRequest,
  Shipment,
  Order,
} from "@/lib/types";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  badgeColor?: string;
}

const NavItem: React.FC<NavItemProps> = ({
  href,
  icon: Icon,
  label,
  badge,
  badgeColor = "bg-red-500",
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm group ${
        isActive
          ? "bg-white/10 text-white shadow-lg"
          : "text-blue-100/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="font-medium tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge !== undefined && badge > 0 && (
          <span
            className={`${badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}
          >
            {badge}
          </span>
        )}
        <ChevronRight
          size={14}
          className={`opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? "opacity-100" : ""}`}
        />
      </div>
    </Link>
  );
};

const NavSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-6">
    <p className="px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-200/40 mb-2">
      {title}
    </p>
    <div className="flex flex-col gap-1">{children}</div>
  </div>
);

export function Sidebar() {
  const { requests, shipments, orders } = useApp();

  const pendingRequestsCount = requests.filter(
    (r: ProductRequest) =>
      r.status === RequestStatus.PENDING_APPROVAL ||
      r.status === RequestStatus.APPROVED,
  ).length;

  const activeShipmentsCount = shipments.filter(
    (s: Shipment) => s.status !== ShipmentStatus.RECEIVED,
  ).length;

  const pendingOrdersCount = orders.filter(
    (o: Order) => o.status === "PENDING" || o.status === "PROCESSING",
  ).length;

  return (
    <aside className="w-64 bg-deep-navy text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary rounded-xl p-2 flex items-center justify-center shadow-lg shadow-primary/30">
          <Rocket size={24} className="text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight">Omni-Link</h1>
          <span className="text-[10px] uppercase tracking-[0.2em] text-blue-200/60 font-semibold">
            Supply Chain
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">
        <NavSection title="Overview">
          <NavItem href="/" icon={LayoutDashboard} label="Dashboard" />
        </NavSection>

        <NavSection title="Operations">
          <NavItem
            href="/orders"
            icon={ShoppingCart}
            label="Orders"
            badge={pendingOrdersCount}
            badgeColor="bg-blue-500"
          />
          <NavItem
            href="/requests"
            icon={ClipboardList}
            label="Product Requests"
            badge={pendingRequestsCount}
            badgeColor="bg-amber-500"
          />
          <NavItem
            href="/shipments"
            icon={Ship}
            label="Shipments"
            badge={activeShipmentsCount}
            badgeColor="bg-green-500"
          />
        </NavSection>

        <NavSection title="Inventory">
          <NavItem href="/inventory" icon={Package} label="Products" />
          <NavItem href="/transfers" icon={ArrowLeftRight} label="Transfers" />
          <NavItem href="/warehouse" icon={WarehouseIcon} label="Warehouses" />
        </NavSection>

        <NavSection title="Administration">
          <NavItem href="/users" icon={Users} label="Users" />
          <NavItem href="/settings" icon={Settings} label="Settings" />
        </NavSection>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 overflow-hidden">
            <img
              className="w-full h-full object-cover"
              src="https://picsum.photos/seed/alex/100/100"
              alt="Profile"
            />
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <p className="text-sm font-semibold truncate">Alex Pierce</p>
            <p className="text-[11px] text-blue-200/60 truncate">
              Supply Chain Lead
            </p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
            <Settings size={16} className="text-blue-200/60" />
          </button>
        </div>
      </div>
    </aside>
  );
}
