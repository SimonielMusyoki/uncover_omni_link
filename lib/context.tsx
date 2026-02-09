"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Product,
  ProductRequest,
  ProductMapping,
  RequestStatus,
  Order,
  OrderSource,
  OrderStatus,
  OrderType,
  Integration,
  KPIData,
  Warehouse,
  User,
  Shipment,
  ShipmentStatus,
  StockStatus,
  ActivityLog,
  TeamMember,
  DeliveryPlatform,
  UserRole,
} from "@/lib/types";
import {
  initialIntegrations,
  initialKpis,
  initialRequests,
  initialOrders,
  initialWarehouses,
  initialProducts,
  initialUsers,
  initialShipments,
  initialActivityLog,
  getManagers,
  getSupplyChainTeam,
} from "@/lib/data";

// ==================== TOAST STATE ====================

interface ToastState {
  message: string;
  type: "success" | "info" | "warning" | "error";
}

// ==================== CURRENT USER ====================

const currentUser: User = initialUsers.find((u) => u.id === "user-1")!;

// ==================== CONTEXT TYPE ====================

interface AppContextType {
  currentUser: User;
  integrations: Integration[];
  kpis: KPIData[];
  requests: ProductRequest[];
  orders: Order[];
  warehouses: Warehouse[];
  products: Product[];
  users: User[];
  shipments: Shipment[];
  activityLog: ActivityLog[];
  managers: TeamMember[];
  supplyChainTeam: TeamMember[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  toast: ToastState | null;
  showToast: (message: string, type?: ToastState["type"]) => void;
  handleNewRequest: (data: {
    productId: string;
    quantity: number;
    reason: string;
    approverId: string;
  }) => void;
  handleApproveRequest: (id: string, assignToId: string) => void;
  handleRejectRequest: (id: string, reason: string) => void;
  handleMarkReady: (id: string, collectionPoint: string) => void;
  handleMarkCollected: (id: string) => void;
  handleSimulateShopifyOrder: (source: OrderSource) => void;
  handleSyncOrder: (
    orderId: string,
    target: "odoo" | "quickbooks" | "delivery",
  ) => void;
  handleFulfillOrder: (orderId: string) => void;
  handleMarkDelivered: (orderId: string) => void;
  handleFetchShopifyStatus: (orderId: string) => void;
  handleCreateShipment: (
    data: Omit<
      Shipment,
      "id" | "createdAt" | "createdBy" | "createdById" | "status"
    >,
  ) => void;
  handleUpdateShipmentStatus: (
    shipmentId: string,
    status: ShipmentStatus,
  ) => void;
  handleReceiveShipment: (shipmentId: string) => void;
  handleUpdateUserPreferences: (
    userId: string,
    preferences: Partial<User["preferences"]>,
  ) => void;
  handleToggleUserStatus: (userId: string) => void;
  handleAddProduct: (
    data: Omit<Product, "id" | "status" | "availableStock">,
  ) => void;
  handleUpdateProduct: (
    productId: string,
    data: Partial<Omit<Product, "id" | "status" | "availableStock">>,
  ) => void;
  handleUpdateProductImage: (productId: string, imageUrl: string) => void;
  handleDeleteProduct: (productId: string) => void;
  handleTransferInventory: (
    productId: string,
    fromWarehouseId: string,
    toWarehouseId: string,
    quantity: number,
  ) => void;
  handleBulkTransferInventory: (
    transfers: Array<{ productId: string; quantity: number }>,
    fromWarehouseId: string,
    toWarehouseId: string,
  ) => void;
  handleAddWarehouse: (
    data: Omit<Warehouse, "id" | "occupancy" | "lastAudit">,
  ) => void;
  handleInviteUser: (
    data: Omit<
      User,
      "id" | "createdAt" | "lastLogin" | "isActive" | "preferences" | "avatar"
    >,
  ) => void;
  productMappings: ProductMapping[];
  handleUpdateProductMapping: (
    productId: string,
    market: "Kenya" | "Nigeria",
    mappings: Partial<
      Omit<ProductMapping, "id" | "productId" | "market" | "updatedAt">
    >,
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ==================== PROVIDER ====================

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [integrations] = useState<Integration[]>(initialIntegrations);
  const [kpis, setKpis] = useState<KPIData[]>(initialKpis);
  const [requests, setRequests] = useState<ProductRequest[]>(initialRequests);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [activityLog, setActivityLog] =
    useState<ActivityLog[]>(initialActivityLog);
  const [productMappings, setProductMappings] = useState<ProductMapping[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const managers = getManagers();
  const supplyChainTeam = getSupplyChainTeam();

  const showToast = useCallback(
    (message: string, type: ToastState["type"] = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    },
    [],
  );

  const addActivity = useCallback(
    (activity: Omit<ActivityLog, "id" | "timestamp">) => {
      const newActivity: ActivityLog = {
        ...activity,
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      setActivityLog((prev) => [newActivity, ...prev.slice(0, 49)]);
    },
    [],
  );

  // ==================== REQUEST HANDLERS ====================

  const handleNewRequest = useCallback(
    (data: {
      productId: string;
      quantity: number;
      reason: string;
      approverId: string;
    }) => {
      const product = products.find((p) => p.id === data.productId);
      const approver = users.find((u) => u.id === data.approverId);
      if (!product || !approver) return;

      const newRequest: ProductRequest = {
        id: `REQ-2026-${String(requests.length + 1).padStart(3, "0")}`,
        productId: data.productId,
        productName: product.name,
        quantity: data.quantity,
        reason: data.reason,
        requesterId: currentUser.id,
        requesterName: currentUser.name,
        requesterEmail: currentUser.email,
        approverId: data.approverId,
        approverName: approver.name,
        approverEmail: approver.email,
        status: RequestStatus.PENDING_APPROVAL,
        createdAt: new Date().toISOString(),
      };

      setRequests((prev) => [newRequest, ...prev]);
      addActivity({
        type: "request",
        message: "New product request submitted",
        details: `${newRequest.id} - ${data.quantity}x ${product.name}`,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      showToast(
        `Request submitted! Email sent to ${approver.name} for approval.`,
        "info",
      );
    },
    [products, users, requests.length, addActivity, showToast],
  );

  const handleApproveRequest = useCallback(
    (id: string, assignToId: string) => {
      const assignee = users.find((u) => u.id === assignToId);
      if (!assignee) return;

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: RequestStatus.APPROVED,
                assignedTo: assignToId,
                assignedToName: assignee.name,
                approvedAt: new Date().toISOString(),
              }
            : r,
        ),
      );

      addActivity({
        type: "request",
        message: "Product request approved",
        details: `${id} assigned to ${assignee.name}`,
        userName: currentUser.name,
      });
      showToast(
        `Request approved! ${assignee.name} notified for dispatch.`,
        "success",
      );
    },
    [users, addActivity, showToast],
  );

  const handleRejectRequest = useCallback(
    (id: string, reason: string) => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: RequestStatus.REJECTED, rejectionReason: reason }
            : r,
        ),
      );
      addActivity({
        type: "request",
        message: "Product request rejected",
        details: `${id} - Reason: ${reason}`,
        userName: currentUser.name,
      });
      showToast("Request rejected. Requester has been notified.", "info");
    },
    [addActivity, showToast],
  );

  const handleMarkReady = useCallback(
    (id: string, collectionPoint: string) => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: RequestStatus.READY_FOR_COLLECTION,
                collectionPoint,
                readyAt: new Date().toISOString(),
              }
            : r,
        ),
      );

      const request = requests.find((r) => r.id === id);
      addActivity({
        type: "request",
        message: "Products ready for collection",
        details: `${id} - Collection point: ${collectionPoint}`,
        userName: currentUser.name,
      });
      showToast(
        `Email sent to ${request?.requesterName}: Products ready for collection!`,
        "success",
      );
    },
    [requests, addActivity, showToast],
  );

  const handleMarkCollected = useCallback(
    (id: string) => {
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: RequestStatus.COLLECTED,
                collectedAt: new Date().toISOString(),
              }
            : r,
        ),
      );
      showToast("Request marked as collected.", "success");
    },
    [showToast],
  );

  // ==================== ORDER HANDLERS ====================

  const handleSimulateShopifyOrder = useCallback(
    (source: OrderSource) => {
      const isKenya = source === OrderSource.SHOPIFY_KENYA;
      const randomProduct =
        products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;

      const newOrder: Order = {
        id: `ORD-2026-${String(orders.length + 1).padStart(3, "0")}`,
        shopifyOrderId: `SH-${isKenya ? "KE" : "NG"}-${Math.floor(Math.random() * 90000) + 10000}`,
        source,
        type: OrderType.B2C,
        customer: {
          name: isKenya ? "Test Customer Kenya" : "Test Customer Nigeria",
          email: "test@email.com",
          phone: isKenya ? "+254 700 000 000" : "+234 800 000 0000",
          address: isKenya ? "Nairobi, Kenya" : "Lagos, Nigeria",
        },
        items: [
          {
            productId: randomProduct.id,
            productName: randomProduct.name,
            sku: randomProduct.sku,
            quantity,
            unitPrice: randomProduct.price,
            total: randomProduct.price * quantity,
          },
        ],
        subtotal: randomProduct.price * quantity,
        shipping: isKenya ? 350 : 500,
        total: randomProduct.price * quantity + (isKenya ? 350 : 500),
        currency: isKenya ? "KES" : "NGN",
        status: OrderStatus.PENDING,
        sync: {
          odooSO: "pending",
          odooInvoice: "pending",
          qbInvoice: "pending",
          delivery: "pending",
          deliveryPlatform: isKenya
            ? DeliveryPlatform.LETA_AI
            : DeliveryPlatform.RENDA_WMS,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setOrders((prev) => [newOrder, ...prev]);
      addActivity({
        type: "order",
        message: `New order from ${source}`,
        details: `${newOrder.id} - ${newOrder.customer.name} - ${newOrder.currency} ${newOrder.total.toLocaleString()}`,
        userName: "Shopify Webhook",
      });
      showToast(
        `New Shopify order received! Processing ${newOrder.id}...`,
        "info",
      );

      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === newOrder.id
              ? {
                  ...o,
                  status: OrderStatus.PROCESSING,
                  sync: {
                    ...o.sync,
                    odooSO: "success",
                    odooInvoice: "success",
                  },
                }
              : o,
          ),
        );
        showToast(`${newOrder.id} synced to Odoo`, "success");
      }, 1500);

      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === newOrder.id
              ? { ...o, sync: { ...o.sync, qbInvoice: "success" } }
              : o,
          ),
        );
        showToast(`${newOrder.id} synced to QuickBooks`, "success");
      }, 2500);
    },
    [products, orders.length, addActivity, showToast],
  );

  const handleSyncOrder = useCallback(
    (orderId: string, target: "odoo" | "quickbooks" | "delivery") => {
      showToast(`Syncing ${orderId} to ${target}...`, "info");

      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id !== orderId) return o;
            const newSync = { ...o.sync };
            if (target === "odoo") {
              newSync.odooSO = "success";
              newSync.odooInvoice = "success";
            } else if (target === "quickbooks") {
              newSync.qbInvoice = "success";
            } else if (target === "delivery") {
              newSync.delivery = "success";
            }
            return { ...o, sync: newSync };
          }),
        );
        showToast(`${orderId} synced to ${target} successfully`, "success");
      }, 1500);
    },
    [showToast],
  );

  const handleFulfillOrder = useCallback(
    (orderId: string) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      setProducts((prev) =>
        prev.map((p) => {
          const orderItem = order.items.find((i) => i.productId === p.id);
          if (!orderItem) return p;
          const newStock = Math.max(0, p.stock - orderItem.quantity);
          return {
            ...p,
            stock: newStock,
            availableStock: Math.max(0, newStock - p.reservedStock),
          };
        }),
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: OrderStatus.IN_TRANSIT,
                fulfilledAt: new Date().toISOString(),
                trackingNumber: `${order.sync.deliveryPlatform === DeliveryPlatform.LETA_AI ? "LA" : "RW"}-${Date.now()}`,
              }
            : o,
        ),
      );

      addActivity({
        type: "order",
        message: "Order fulfilled and dispatched",
        details: `${orderId} - Sent to ${order.sync.deliveryPlatform}`,
        userName: currentUser.name,
      });
      showToast(`Order ${orderId} fulfilled! Inventory updated.`, "success");
    },
    [orders, addActivity, showToast],
  );

  const handleMarkDelivered = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: OrderStatus.DELIVERED,
                deliveredAt: new Date().toISOString(),
              }
            : o,
        ),
      );
      showToast(`Order ${orderId} marked as delivered.`, "success");
    },
    [showToast],
  );

  const handleFetchShopifyStatus = useCallback(
    (orderId: string) => {
      showToast(`Fetching status from Shopify for ${orderId}...`, "info");
      setTimeout(() => {
        showToast(`Status updated for ${orderId}`, "success");
      }, 1000);
    },
    [showToast],
  );

  // ==================== SHIPMENT HANDLERS ====================

  const handleCreateShipment = useCallback(
    (
      data: Omit<
        Shipment,
        "id" | "createdAt" | "createdBy" | "createdById" | "status"
      >,
    ) => {
      const newShipment: Shipment = {
        ...data,
        id: `SHP-2026-${String(shipments.length + 1).padStart(3, "0")}`,
        status: ShipmentStatus.CREATED,
        createdBy: currentUser.name,
        createdById: currentUser.id,
        createdAt: new Date().toISOString(),
      };

      setShipments((prev) => [newShipment, ...prev]);
      addActivity({
        type: "shipment",
        message: "New shipment created",
        details: `${newShipment.id} - ${newShipment.totalUnits} units from ${newShipment.supplier}`,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      showToast(`Shipment ${newShipment.id} created successfully!`, "success");
    },
    [shipments.length, addActivity, showToast],
  );

  const handleUpdateShipmentStatus = useCallback(
    (shipmentId: string, status: ShipmentStatus) => {
      setShipments((prev) =>
        prev.map((s) => (s.id === shipmentId ? { ...s, status } : s)),
      );
      addActivity({
        type: "shipment",
        message: "Shipment status updated",
        details: `${shipmentId} - Now: ${status}`,
        userName: currentUser.name,
      });
      showToast(`Shipment ${shipmentId} status updated to ${status}`, "info");
    },
    [addActivity, showToast],
  );

  const handleReceiveShipment = useCallback(
    (shipmentId: string) => {
      const shipment = shipments.find((s) => s.id === shipmentId);
      if (!shipment) return;

      setProducts((prev) =>
        prev.map((p) => {
          const shipmentItem = shipment.items.find((i) => i.productId === p.id);
          if (!shipmentItem) return p;
          const newStock = p.stock + shipmentItem.quantity;
          return {
            ...p,
            stock: newStock,
            availableStock: newStock - p.reservedStock,
          };
        }),
      );

      setShipments((prev) =>
        prev.map((s) =>
          s.id === shipmentId
            ? {
                ...s,
                status: ShipmentStatus.RECEIVED,
                actualArrival: new Date().toISOString().split("T")[0],
                receivedBy: currentUser.name,
                receivedAt: new Date().toISOString(),
              }
            : s,
        ),
      );

      addActivity({
        type: "shipment",
        message: "Shipment received into warehouse",
        details: `${shipmentId} - ${shipment.totalUnits} units received at ${shipment.destinationWarehouse}`,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      showToast(
        `Shipment ${shipmentId} received! Inventory updated with ${shipment.totalUnits} units.`,
        "success",
      );
    },
    [shipments, addActivity, showToast],
  );

  // ==================== USER HANDLERS ====================

  const handleUpdateUserPreferences = useCallback(
    (userId: string, preferences: Partial<User["preferences"]>) => {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, preferences: { ...u.preferences, ...preferences } }
            : u,
        ),
      );
      showToast("Preferences updated successfully", "success");
    },
    [showToast],
  );

  const handleToggleUserStatus = useCallback((userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
    );
  }, []);

  // ==================== PRODUCT HANDLERS ====================

  const calculateStockStatus = (
    stock: number,
    reorderLevel: number,
  ): StockStatus => {
    if (stock === 0) return StockStatus.OUT_OF_STOCK;
    if (stock <= reorderLevel) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  };

  const handleAddProduct = useCallback(
    (data: Omit<Product, "id" | "status" | "availableStock">) => {
      const newProduct: Product = {
        ...data,
        id: `prod-${Date.now()}`,
        availableStock: data.stock - data.reservedStock,
        status: calculateStockStatus(data.stock, data.reorderLevel),
      };

      setProducts((prev) => [newProduct, ...prev]);
      addActivity({
        type: "shipment",
        message: "New product added to inventory",
        details: `${newProduct.name} (${newProduct.sku}) - ${newProduct.stock} units`,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      showToast(`Product "${newProduct.name}" added successfully!`, "success");
    },
    [addActivity, showToast],
  );

  const handleUpdateProduct = useCallback(
    (
      productId: string,
      data: Partial<Omit<Product, "id" | "status" | "availableStock">>,
    ) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== productId) return p;
          const updated = { ...p, ...data };
          const stock = data.stock ?? p.stock;
          const reserved = data.reservedStock ?? p.reservedStock;
          const reorderLevel = data.reorderLevel ?? p.reorderLevel;
          return {
            ...updated,
            availableStock: stock - reserved,
            status: calculateStockStatus(stock, reorderLevel),
          };
        }),
      );

      const product = products.find((p) => p.id === productId);
      addActivity({
        type: "shipment",
        message: "Product updated",
        details: `${product?.name || productId} - Details modified`,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      showToast("Product updated successfully!", "success");
    },
    [products, addActivity, showToast],
  );

  const handleUpdateProductImage = useCallback(
    (productId: string, imageUrl: string) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, image: imageUrl } : p)),
      );
      const product = products.find((p) => p.id === productId);
      showToast(`Image updated for "${product?.name || "product"}"`, "success");
    },
    [products, showToast],
  );

  const handleDeleteProduct = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addActivity({
        type: "shipment",
        message: "Product removed from inventory",
        details: `${product?.name || productId} (${product?.sku || "N/A"})`,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      showToast(`Product "${product?.name}" deleted`, "info");
    },
    [products, addActivity, showToast],
  );

  const handleTransferInventory = useCallback(
    (
      productId: string,
      fromWarehouseId: string,
      toWarehouseId: string,
      quantity: number,
    ) => {
      const product = products.find((p) => p.id === productId);
      const fromWarehouse = warehouses.find((w) => w.id === fromWarehouseId);
      const toWarehouse = warehouses.find((w) => w.id === toWarehouseId);

      if (!product || !fromWarehouse || !toWarehouse) {
        showToast("Transfer failed: Invalid product or warehouse", "error");
        return;
      }

      if (product.availableStock < quantity) {
        showToast("Transfer failed: Insufficient available stock", "error");
        return;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, warehouseId: toWarehouseId } : p,
        ),
      );

      addActivity({
        type: "shipment",
        message: "Inventory transferred between warehouses",
        details: `${quantity} units of ${product.name} moved from ${fromWarehouse.name} to ${toWarehouse.name}`,
        userId: currentUser.id,
        userName: currentUser.name,
      });

      showToast(
        `Successfully transferred ${quantity} units to ${toWarehouse.name}`,
        "success",
      );
    },
    [products, warehouses, addActivity, showToast],
  );

  const handleBulkTransferInventory = useCallback(
    (
      transfers: Array<{ productId: string; quantity: number }>,
      fromWarehouseId: string,
      toWarehouseId: string,
    ) => {
      const fromWarehouse = warehouses.find((w) => w.id === fromWarehouseId);
      const toWarehouse = warehouses.find((w) => w.id === toWarehouseId);

      if (!fromWarehouse || !toWarehouse) {
        showToast("Transfer failed: Invalid warehouse", "error");
        return;
      }

      const validTransfers = transfers.filter((t) => {
        const product = products.find((p) => p.id === t.productId);
        return (
          product && product.availableStock >= t.quantity && t.quantity > 0
        );
      });

      if (validTransfers.length === 0) {
        showToast("No valid transfers to process", "error");
        return;
      }

      setProducts((prev) =>
        prev.map((p) => {
          const transfer = validTransfers.find((t) => t.productId === p.id);
          if (transfer) {
            return { ...p, warehouseId: toWarehouseId };
          }
          return p;
        }),
      );

      const totalUnits = validTransfers.reduce((sum, t) => sum + t.quantity, 0);
      const productNames = validTransfers
        .map((t) => {
          const product = products.find((p) => p.id === t.productId);
          return `${product?.name} (${t.quantity})`;
        })
        .join(", ");

      addActivity({
        type: "shipment",
        message: "Bulk inventory transfer completed",
        details: `${validTransfers.length} products (${totalUnits} total units) moved from ${fromWarehouse.name} to ${toWarehouse.name}: ${productNames}`,
        userId: currentUser.id,
        userName: currentUser.name,
      });

      showToast(
        `Successfully transferred ${validTransfers.length} products (${totalUnits} units) to ${toWarehouse.name}`,
        "success",
      );
    },
    [products, warehouses, addActivity, showToast],
  );

  // ==================== WAREHOUSE HANDLERS ====================

  const handleAddWarehouse = useCallback(
    (data: Omit<Warehouse, "id" | "occupancy" | "lastAudit">) => {
      const newWarehouse: Warehouse = {
        ...data,
        id: `wh-${Date.now()}`,
        occupancy: 0,
        lastAudit: new Date().toISOString().split("T")[0],
      };

      setWarehouses((prev) => [...prev, newWarehouse]);
      addActivity({
        type: "shipment",
        message: "New warehouse added",
        details: `${newWarehouse.name} (${newWarehouse.region})`,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      showToast(
        `Warehouse "${newWarehouse.name}" created successfully!`,
        "success",
      );
    },
    [addActivity, showToast],
  );

  // ==================== USER INVITE HANDLER ====================

  const handleInviteUser = useCallback(
    (
      data: Omit<
        User,
        "id" | "createdAt" | "lastLogin" | "isActive" | "preferences" | "avatar"
      >,
    ) => {
      const newUser: User = {
        ...data,
        id: `user-${Date.now()}`,
        isActive: false,
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          dashboardLayout: "compact",
          timezone:
            data.department === "Supply Chain"
              ? "Africa/Nairobi"
              : "Africa/Lagos",
          language: "en",
        },
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [...prev, newUser]);
      addActivity({
        type: "user",
        message: "User invitation sent",
        details: `${newUser.name} (${newUser.email}) - ${newUser.role}`,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      showToast(`Invitation sent to ${newUser.email}`, "success");
    },
    [addActivity, showToast],
  );

  const handleUpdateProductMapping = useCallback(
    (
      productId: string,
      market: "Kenya" | "Nigeria",
      mappings: Partial<
        Omit<ProductMapping, "id" | "productId" | "market" | "updatedAt">
      >,
    ) => {
      setProductMappings((prev) => {
        const existingIndex = prev.findIndex(
          (m) => m.productId === productId && m.market === market,
        );

        if (existingIndex >= 0) {
          // Update existing mapping
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...mappings,
            updatedAt: new Date().toISOString(),
          };
          return updated;
        } else {
          // Create new mapping
          const newMapping: ProductMapping = {
            id: `mapping-${Date.now()}`,
            productId,
            market,
            ...mappings,
            updatedAt: new Date().toISOString(),
          };
          return [...prev, newMapping];
        }
      });

      const product = products.find((p) => p.id === productId);
      addActivity({
        type: "sync",
        message: "Product mapping updated",
        details: `${product?.name || productId} - ${market}`,
        userId: currentUser.id,
        userName: currentUser.name,
      });
      showToast("Product mapping updated successfully", "success");
    },
    [products, addActivity, showToast],
  );

  // ==================== CONTEXT VALUE ====================

  return (
    <AppContext.Provider
      value={{
        currentUser,
        integrations,
        kpis,
        requests,
        orders,
        warehouses,
        products,
        users,
        shipments,
        activityLog,
        managers,
        supplyChainTeam,
        selectedProduct,
        setSelectedProduct,
        toast,
        showToast,
        handleNewRequest,
        handleApproveRequest,
        handleRejectRequest,
        handleMarkReady,
        handleMarkCollected,
        handleSimulateShopifyOrder,
        handleSyncOrder,
        handleFulfillOrder,
        handleMarkDelivered,
        handleFetchShopifyStatus,
        handleCreateShipment,
        handleUpdateShipmentStatus,
        handleReceiveShipment,
        handleUpdateUserPreferences,
        handleToggleUserStatus,
        handleAddProduct,
        handleUpdateProduct,
        handleUpdateProductImage,
        handleDeleteProduct,
        handleTransferInventory,
        handleBulkTransferInventory,
        handleAddWarehouse,
        handleInviteUser,
        productMappings,
        handleUpdateProductMapping,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ==================== HOOK ====================

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
