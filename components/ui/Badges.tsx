import React from "react";
import {
  OrderStatus,
  RequestStatus,
  ShipmentStatus,
  StockStatus,
  UserRole,
  WarehouseStatus,
} from "@/lib/types";

// ==================== COLOR CONFIGURATIONS ====================

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-slate-100 text-slate-700",
  [OrderStatus.PROCESSING]: "bg-blue-100 text-blue-700",
  [OrderStatus.IN_TRANSIT]: "bg-purple-100 text-purple-700",
  [OrderStatus.DELIVERED]: "bg-green-100 text-green-700",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-700",
  [OrderStatus.FAILED]: "bg-red-100 text-red-700",
};

const REQUEST_STATUS_COLORS: Record<RequestStatus, string> = {
  [RequestStatus.PENDING_APPROVAL]: "bg-yellow-100 text-yellow-700",
  [RequestStatus.APPROVED]: "bg-blue-100 text-blue-700",
  [RequestStatus.REJECTED]: "bg-red-100 text-red-700",
  [RequestStatus.READY_FOR_COLLECTION]: "bg-purple-100 text-purple-700",
  [RequestStatus.COLLECTED]: "bg-green-100 text-green-700",
};

const SHIPMENT_STATUS_COLORS: Record<ShipmentStatus, string> = {
  [ShipmentStatus.CREATED]: "bg-slate-100 text-slate-700",
  [ShipmentStatus.IN_TRANSIT]: "bg-blue-100 text-blue-700",
  [ShipmentStatus.AT_PORT]: "bg-purple-100 text-purple-700",
  [ShipmentStatus.CUSTOMS_CLEARANCE]: "bg-yellow-100 text-yellow-700",
  [ShipmentStatus.OUT_FOR_DELIVERY]: "bg-indigo-100 text-indigo-700",
  [ShipmentStatus.RECEIVED]: "bg-green-100 text-green-700",
};

const STOCK_STATUS_COLORS: Record<StockStatus, string> = {
  [StockStatus.IN_STOCK]: "bg-green-100 text-green-700",
  [StockStatus.LOW_STOCK]: "bg-yellow-100 text-yellow-700",
  [StockStatus.OUT_OF_STOCK]: "bg-red-100 text-red-700",
};

const USER_ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "bg-purple-100 text-purple-700",
  [UserRole.SUPPLY_CHAIN_LEAD]: "bg-blue-100 text-blue-700",
  [UserRole.SUPPLY_CHAIN]: "bg-cyan-100 text-cyan-700",
  [UserRole.MANAGER]: "bg-green-100 text-green-700",
  [UserRole.EMPLOYEE]: "bg-slate-100 text-slate-700",
};

const WAREHOUSE_STATUS_COLORS: Record<WarehouseStatus, string> = {
  [WarehouseStatus.ACTIVE]: "bg-green-100 text-green-700",
  [WarehouseStatus.MAINTENANCE]: "bg-yellow-100 text-yellow-700",
  [WarehouseStatus.FULL]: "bg-red-100 text-red-700",
};

// ==================== BADGE COMPONENTS ====================

interface BaseBadgeProps {
  className?: string;
  uppercase?: boolean;
  size?: "sm" | "md" | "lg";
}

const BADGE_SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export const OrderStatusBadge = React.memo(
  ({
    status,
    className = "",
    uppercase = true,
    size = "sm",
  }: BaseBadgeProps & { status: OrderStatus }) => (
    <span
      className={`inline-flex items-center rounded-full font-bold ${BADGE_SIZE_CLASSES[size]} ${ORDER_STATUS_COLORS[status]} ${uppercase ? "uppercase" : ""} ${className}`}
    >
      {status}
    </span>
  ),
);
OrderStatusBadge.displayName = "OrderStatusBadge";

export const RequestStatusBadge = React.memo(
  ({
    status,
    className = "",
    uppercase = true,
    size = "sm",
  }: BaseBadgeProps & { status: RequestStatus }) => (
    <span
      className={`inline-flex items-center rounded-full font-bold ${BADGE_SIZE_CLASSES[size]} ${REQUEST_STATUS_COLORS[status]} ${uppercase ? "uppercase" : ""} ${className}`}
    >
      {status}
    </span>
  ),
);
RequestStatusBadge.displayName = "RequestStatusBadge";

export const ShipmentStatusBadge = React.memo(
  ({
    status,
    className = "",
    uppercase = true,
    size = "sm",
  }: BaseBadgeProps & { status: ShipmentStatus }) => (
    <span
      className={`inline-flex items-center rounded-full font-bold ${BADGE_SIZE_CLASSES[size]} ${SHIPMENT_STATUS_COLORS[status]} ${uppercase ? "uppercase" : ""} ${className}`}
    >
      {status}
    </span>
  ),
);
ShipmentStatusBadge.displayName = "ShipmentStatusBadge";

export const StockStatusBadge = React.memo(
  ({
    status,
    className = "",
    uppercase = true,
    size = "sm",
  }: BaseBadgeProps & { status: StockStatus }) => (
    <span
      className={`inline-flex items-center rounded-full font-bold ${BADGE_SIZE_CLASSES[size]} ${STOCK_STATUS_COLORS[status]} ${uppercase ? "uppercase" : ""} ${className}`}
    >
      {status}
    </span>
  ),
);
StockStatusBadge.displayName = "StockStatusBadge";

export const UserRoleBadge = React.memo(
  ({
    role,
    className = "",
    uppercase = false,
    size = "sm",
  }: BaseBadgeProps & { role: UserRole }) => (
    <span
      className={`inline-flex items-center rounded-full font-medium ${BADGE_SIZE_CLASSES[size]} ${USER_ROLE_COLORS[role]} ${uppercase ? "uppercase" : ""} ${className}`}
    >
      {role}
    </span>
  ),
);
UserRoleBadge.displayName = "UserRoleBadge";

export const WarehouseStatusBadge = React.memo(
  ({
    status,
    className = "",
    uppercase = true,
    size = "sm",
  }: BaseBadgeProps & { status: WarehouseStatus }) => (
    <span
      className={`inline-flex items-center rounded-full font-bold ${BADGE_SIZE_CLASSES[size]} ${WAREHOUSE_STATUS_COLORS[status]} ${uppercase ? "uppercase" : ""} ${className}`}
    >
      {status}
    </span>
  ),
);
WarehouseStatusBadge.displayName = "WarehouseStatusBadge";

export const ActiveStatusBadge = React.memo(
  ({
    isActive,
    className = "",
    size = "sm",
  }: BaseBadgeProps & { isActive: boolean }) => (
    <span
      className={`inline-flex items-center rounded-full font-bold ${BADGE_SIZE_CLASSES[size]} ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} ${className}`}
    >
      {isActive ? "ACTIVE" : "INACTIVE"}
    </span>
  ),
);
ActiveStatusBadge.displayName = "ActiveStatusBadge";
