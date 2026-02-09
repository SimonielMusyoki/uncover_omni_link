// ==================== ENUMS ====================

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  IN_TRANSIT = "IN TRANSIT",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export enum StockStatus {
  IN_STOCK = "IN STOCK",
  LOW_STOCK = "LOW STOCK",
  OUT_OF_STOCK = "OUT OF STOCK",
}

export enum OrderSource {
  SHOPIFY_KENYA = "Uncover Kenya",
  SHOPIFY_NIGERIA = "Uncover Nigeria",
  B2B_ODOO = "B2B (Odoo)",
}

export enum OrderType {
  B2C = "B2C",
  B2B = "B2B",
}

export enum WarehouseStatus {
  ACTIVE = "ACTIVE",
  MAINTENANCE = "MAINTENANCE",
  FULL = "FULL",
}

export enum RequestStatus {
  PENDING_APPROVAL = "PENDING APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  READY_FOR_COLLECTION = "READY FOR COLLECTION",
  COLLECTED = "COLLECTED",
}

export enum ShipmentStatus {
  CREATED = "CREATED",
  IN_TRANSIT = "IN TRANSIT",
  AT_PORT = "AT PORT",
  CUSTOMS_CLEARANCE = "CUSTOMS CLEARANCE",
  OUT_FOR_DELIVERY = "OUT FOR DELIVERY",
  RECEIVED = "RECEIVED",
}

export enum UserRole {
  ADMIN = "Admin",
  SUPPLY_CHAIN_LEAD = "Supply Chain Lead",
  SUPPLY_CHAIN = "Supply Chain",
  MANAGER = "Manager",
  EMPLOYEE = "Employee",
}

export enum DeliveryPlatform {
  RENDA_WMS = "Renda WMS",
  LETA_AI = "Leta AI",
  NONE = "None",
}

// ==================== SYNC STATUS ====================

export type SyncState =
  | "pending"
  | "syncing"
  | "success"
  | "failed"
  | "not_required";

export interface SyncStatus {
  odooSO: SyncState;
  odooInvoice: SyncState;
  qbInvoice: SyncState;
  delivery: SyncState;
  deliveryPlatform: DeliveryPlatform;
}

// ==================== CORE INTERFACES ====================

export interface Order {
  id: string;
  shopifyOrderId?: string;
  odooInvoiceId?: string;
  source: OrderSource;
  type: OrderType;
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: "KES" | "NGN" | "USD";
  status: OrderStatus;
  sync: SyncStatus;
  trackingNumber?: string;
  deliveryNotes?: string;
  createdAt: string;
  updatedAt: string;
  fulfilledAt?: string;
  deliveredAt?: string;
  events?: OrderEvent[];
}

export interface OrderEvent {
  id: string;
  type:
    | "created"
    | "payment_received"
    | "synced_odoo"
    | "synced_quickbooks"
    | "synced_delivery"
    | "processing"
    | "fulfilled"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "failed"
    | "note";
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number; // USD - used for overall calculations
  priceKES: number; // Kenyan Shillings
  priceNGN: number; // Nigerian Naira
  costPrice: number;
  stock: number;
  reservedStock: number;
  availableStock: number;
  reorderLevel: number;
  status: StockStatus;
  image: string;
  description?: string;
  warehouseId?: string;
}

export interface ProductMapping {
  id: string;
  productId: string;
  market: "Kenya" | "Nigeria";
  shopifyId?: string;
  shopifyHandle?: string;
  odooId?: string;
  odooName?: string;
  quickbooksId?: string;
  quickbooksName?: string;
  letaAiId?: string;
  letaAiName?: string;
  rendaId?: string;
  rendaName?: string;
  updatedAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  region: "Kenya" | "Nigeria";
  capacity: number;
  occupancy: number;
  manager: string;
  managerId: string;
  status: WarehouseStatus;
  lastAudit: string;
  deliveryPlatform: DeliveryPlatform;
}

export interface ProductRequest {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  approverId: string;
  approverName: string;
  approverEmail: string;
  status: RequestStatus;
  assignedTo?: string;
  assignedToName?: string;
  rejectionReason?: string;
  collectionPoint?: string;
  createdAt: string;
  approvedAt?: string;
  readyAt?: string;
  collectedAt?: string;
}

export interface Shipment {
  id: string;
  reference: string;
  supplier: string;
  origin: string;
  destinationWarehouseId: string;
  destinationWarehouse: string;
  items: ShipmentItem[];
  totalUnits: number;
  totalValue: number;
  currency: "USD" | "KES" | "NGN";
  status: ShipmentStatus;
  carrier: string;
  trackingNumber?: string;
  containerNumber?: string;
  estimatedArrival: string;
  actualArrival?: string;
  createdBy: string;
  createdById: string;
  createdAt: string;
  receivedBy?: string;
  receivedAt?: string;
  notes?: string;
}

export interface ShipmentItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  phone?: string;
  managerId?: string;
  managerName?: string;
  warehouseId?: string;
  warehouseName?: string;
  isActive: boolean;
  preferences: UserPreferences;
  createdAt: string;
  lastLogin?: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  dashboardLayout: "compact" | "detailed";
  timezone: string;
  language: "en" | "fr";
}

// ==================== DASHBOARD TYPES ====================

export interface Integration {
  id: string;
  name: string;
  iconUrl: string;
  color: string;
  status: "Connected" | "Live" | "Disconnected" | "Error";
  lastSync?: string;
  description?: string;
  ordersToday?: number;
  region?: "Kenya" | "Nigeria" | "Both";
}

export interface KPIData {
  title: string;
  value: string;
  subtext: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  icon: string;
}

export interface ActivityLog {
  id: string;
  type: "order" | "shipment" | "request" | "sync" | "user";
  message: string;
  details?: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

// ==================== VIEW TYPES ====================

export type View =
  | "DASHBOARD"
  | "ORDERS"
  | "REQUESTS"
  | "INVENTORY"
  | "WAREHOUSE"
  | "SHIPMENTS"
  | "USERS"
  | "SETTINGS";

// ==================== TEAM TYPES (for backwards compatibility) ====================

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}
