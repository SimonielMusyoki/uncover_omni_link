"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpDown,
  ChevronDown,
  X,
  Plus,
  Minus,
  Edit,
  Image as ImageIcon,
  Trash2,
  Eye,
  Pencil,
  ArrowLeftRight,
  Warehouse,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useApp } from "@/lib/context";
import { StockStatus, type Product } from "@/lib/types";
import {
  ProductFormModal,
  ImageUploadModal,
} from "@/components/ui/ProductForm";
import { TransferInventoryModal } from "@/components/ui/TransferInventoryModal";

// Stock Status Badge
function StockStatusBadge({ status }: { status: StockStatus }) {
  const configs: Record<StockStatus, { color: string; label: string }> = {
    [StockStatus.IN_STOCK]: {
      color: "bg-green-100 text-green-700 border-green-200",
      label: "In Stock",
    },
    [StockStatus.LOW_STOCK]: {
      color: "bg-amber-100 text-amber-700 border-amber-200",
      label: "Low Stock",
    },
    [StockStatus.OUT_OF_STOCK]: {
      color: "bg-red-100 text-red-700 border-red-200",
      label: "Out of Stock",
    },
  };

  const config = configs[status];

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${config.color}`}
    >
      {config.label}
    </span>
  );
}

// Stock Level Bar
function StockLevelBar({
  current,
  reorder,
  total,
}: {
  current: number;
  reorder: number;
  total: number;
}) {
  const max = Math.max(total * 1.5, reorder * 2);
  const percentage = Math.min((current / max) * 100, 100);
  const reorderPercentage = (reorder / max) * 100;

  let barColor = "bg-green-500";
  if (current <= reorder) {
    barColor = current === 0 ? "bg-red-500" : "bg-amber-500";
  }

  return (
    <div className="relative">
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {/* Reorder level indicator */}
      <div
        className="absolute top-0 w-0.5 h-2 bg-slate-400"
        style={{ left: `${reorderPercentage}%` }}
        title={`Reorder level: ${reorder}`}
      />
    </div>
  );
}

// Product Detail Modal
function ProductDetailModal({
  product,
  warehouseName,
  onClose,
  onEdit,
  onEditImage,
  onDelete,
  onTransfer,
}: {
  product: Product;
  warehouseName?: string;
  onClose: () => void;
  onEdit: () => void;
  onEditImage: () => void;
  onDelete: () => void;
  onTransfer: () => void;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{product.name}</h2>
            <p className="text-sm text-slate-500">SKU: {product.sku}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Stock Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Total Stock</p>
              <p className="text-2xl font-bold text-slate-900">
                {product.stock}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-xs text-blue-600 mb-1">Available</p>
              <p className="text-2xl font-bold text-blue-700">
                {product.availableStock}
              </p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-xs text-amber-600 mb-1">Reserved</p>
              <p className="text-2xl font-bold text-amber-700">
                {product.reservedStock}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-600 mb-1">Reorder Level</p>
              <p className="text-2xl font-bold text-purple-700">
                {product.reorderLevel}
              </p>
            </div>
          </div>

          {/* Warehouse */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Location</h3>
            <div className="flex items-center justify-between bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Warehouse size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {warehouseName || "Unassigned"}
                  </p>
                  <p className="text-xs text-slate-500">Current warehouse</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onTransfer();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                <ArrowLeftRight size={14} />
                Transfer
              </button>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Stock Level</h3>
              <StockStatusBadge status={product.status} />
            </div>
            <StockLevelBar
              current={product.availableStock}
              reorder={product.reorderLevel}
              total={product.stock}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0</span>
              <span>Reorder: {product.reorderLevel}</span>
              <span>Max</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Pricing</h3>

            {/* USD (Base Price) */}
            <div className="bg-blue-50 rounded-xl p-4 mb-3">
              <p className="text-xs text-blue-600 mb-1">
                USD Price (for calculations)
              </p>
              <p className="text-xl font-bold text-blue-700">
                ${product.price.toLocaleString()}
              </p>
            </div>

            {/* Local Market Prices */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-xs text-green-600 mb-1">🇰🇪 Kenya (KES)</p>
                <p className="text-lg font-bold text-green-700">
                  KES {product.priceKES.toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <p className="text-xs text-emerald-600 mb-1">
                  🇳🇬 Nigeria (NGN)
                </p>
                <p className="text-lg font-bold text-emerald-700">
                  ₦{product.priceNGN.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Cost Price */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">Cost Price (USD)</p>
              <p className="text-lg font-bold text-slate-900">
                ${product.costPrice.toLocaleString()}
              </p>
            </div>

            <div className="mt-3 text-sm text-slate-600">
              Margin:{" "}
              <span className="font-bold text-green-600">
                {(
                  ((product.price - product.costPrice) / product.price) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>

          {/* Category */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">Category</p>
            <p className="font-semibold text-slate-800">{product.category}</p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200">
          {showDeleteConfirm ? (
            <div className="flex items-center justify-between bg-red-50 p-4 rounded-xl border border-red-200">
              <p className="text-sm text-red-700 font-medium">
                Are you sure you want to delete this product?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onEditImage}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ImageIcon size={16} />
                  Update Image
                </button>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit size={16} />
                  Edit Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Product Row
function ProductRow({
  product,
  warehouseName,
  onView,
  onEdit,
  onTransfer,
}: {
  product: Product;
  warehouseName?: string;
  onView: () => void;
  onEdit: () => void;
  onTransfer: () => void;
}) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <Package size={18} className="text-slate-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{product.name}</p>
            <p className="text-xs text-slate-400">{product.sku}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
          {product.category}
        </span>
      </td>
      <td className="px-4 py-4">
        {warehouseName ? (
          <span className="text-xs text-slate-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded">
            {warehouseName}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-4">
        <div>
          <p className="font-bold text-slate-900">{product.availableStock}</p>
          <p className="text-xs text-slate-400">of {product.stock} total</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-slate-600">{product.reservedStock}</p>
      </td>
      <td className="px-4 py-4 w-40">
        <StockLevelBar
          current={product.availableStock}
          reorder={product.reorderLevel}
          total={product.stock}
        />
        <p className="text-xs text-slate-400 mt-1">
          Reorder at {product.reorderLevel}
        </p>
      </td>
      <td className="px-4 py-4">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-green-700">
            KES {product.priceKES.toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-emerald-700">
            ₦{product.priceNGN.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400">${product.price}</p>
        </div>
      </td>
      <td className="px-4 py-4">
        <StockStatusBadge status={product.status} />
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <button
            onClick={onView}
            className="p-2 text-slate-400 hover:text-action-blue hover:bg-blue-50 rounded-lg transition-colors"
            title="View details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Edit product"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onTransfer}
            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Transfer inventory"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function InventoryPage() {
  const {
    products,
    warehouses,
    handleAddProduct,
    handleUpdateProduct,
    handleUpdateProductImage,
    handleDeleteProduct,
    handleTransferInventory,
  } = useApp();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [warehouseFilter, setWarehouseFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "stock" | "price">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageEditProduct, setImageEditProduct] = useState<Product | null>(
    null,
  );
  const [transferProduct, setTransferProduct] = useState<Product | null>(null);

  const categories = [...new Set(products.map((p) => p.category))];

  const filteredProducts = products
    .filter((product) => {
      const matchesStatus =
        statusFilter === "ALL" || product.status === statusFilter;
      const matchesCategory =
        categoryFilter === "ALL" || product.category === categoryFilter;
      const matchesWarehouse =
        warehouseFilter === "ALL" || product.warehouseId === warehouseFilter;
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return (
        matchesStatus && matchesCategory && matchesWarehouse && matchesSearch
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "stock":
          comparison = a.availableStock - b.availableStock;
          break;
        case "price":
          comparison = a.price - b.price;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) => p.status === StockStatus.LOW_STOCK,
  ).length;
  const outOfStockProducts = products.filter(
    (p) => p.status === StockStatus.OUT_OF_STOCK,
  ).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <>
      <Header title="Inventory" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Inventory Management
            </h2>
            <p className="text-sm text-slate-500">
              Monitor stock levels and manage products across warehouses
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Package size={20} className="text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalProducts}</p>
            <p className="text-xs text-slate-400">Total Products</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle size={20} className="text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {lowStockProducts}
            </p>
            <p className="text-xs text-slate-400">Low Stock</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              {outOfStockProducts}
            </p>
            <p className="text-xs text-slate-400">Out of Stock</p>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              KES {(totalValue / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-slate-400">Total Value</p>
          </div>
        </div>

        {/* Low Stock Alert */}
        {lowStockProducts + outOfStockProducts > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-800">Stock Alert</p>
                <p className="text-sm text-amber-700">
                  {lowStockProducts} product(s) are running low and{" "}
                  {outOfStockProducts} product(s) are out of stock. Consider
                  creating shipments to replenish inventory.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {products
                    .filter(
                      (p) =>
                        p.status === StockStatus.LOW_STOCK ||
                        p.status === StockStatus.OUT_OF_STOCK,
                    )
                    .slice(0, 5)
                    .map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className="px-2 py-1 bg-white border border-amber-200 rounded text-xs font-medium text-amber-700 hover:bg-amber-100"
                      >
                        {p.name}
                      </button>
                    ))}
                </div>
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
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Warehouse size={16} className="text-slate-400" />
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
            >
              <option value="ALL">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.region})
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {Object.values(StockStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-slate-400" />
            <select
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split("-") as [
                  "name" | "stock" | "price",
                  "asc" | "desc",
                ];
                setSortBy(by);
                setSortOrder(order);
              }}
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="stock-asc">Stock Low to High</option>
              <option value="stock-desc">Stock High to Low</option>
              <option value="price-asc">Price Low to High</option>
              <option value="price-desc">Price High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Prices
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const warehouse = warehouses.find(
                    (w) => w.id === product.warehouseId,
                  );
                  return (
                    <ProductRow
                      key={product.id}
                      product={product}
                      warehouseName={warehouse?.name}
                      onView={() => setSelectedProduct(product)}
                      onEdit={() => setEditingProduct(product)}
                      onTransfer={() => setTransferProduct(product)}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No products found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          warehouseName={
            warehouses.find((w) => w.id === selectedProduct.warehouseId)?.name
          }
          onClose={() => setSelectedProduct(null)}
          onEdit={() => {
            setEditingProduct(selectedProduct);
            setSelectedProduct(null);
          }}
          onEditImage={() => {
            setImageEditProduct(selectedProduct);
            setSelectedProduct(null);
          }}
          onDelete={() => handleDeleteProduct(selectedProduct.id)}
          onTransfer={() => setTransferProduct(selectedProduct)}
        />
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <ProductFormModal
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSave={(data) => {
            handleAddProduct(data);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <ProductFormModal
          mode="edit"
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={(data) => {
            handleUpdateProduct(editingProduct.id, data);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Image Upload Modal */}
      {imageEditProduct && (
        <ImageUploadModal
          product={imageEditProduct}
          onClose={() => setImageEditProduct(null)}
          onSave={(imageUrl) => {
            handleUpdateProductImage(imageEditProduct.id, imageUrl);
            setImageEditProduct(null);
          }}
        />
      )}

      {/* Transfer Inventory Modal */}
      {transferProduct && (
        <TransferInventoryModal
          product={transferProduct}
          onClose={() => setTransferProduct(null)}
          onTransfer={(productId, from, to, qty) => {
            handleTransferInventory(productId, from, to, qty);
            setTransferProduct(null);
          }}
        />
      )}
    </>
  );
}
