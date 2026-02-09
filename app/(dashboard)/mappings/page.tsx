"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/lib/context";
import { Header } from "@/components/layout/Header";
import { Product, ProductMapping } from "@/lib/types";
import {
  Search,
  Link2,
  Check,
  X,
  Edit2,
  Save,
  ChevronDown,
  ExternalLink,
  Package,
  AlertCircle,
  Filter,
} from "lucide-react";

type Platform = "shopify" | "odoo" | "quickbooks" | "letaAi" | "renda";
type Market = "Kenya" | "Nigeria";

interface PlatformConfig {
  id: Platform;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  idField: keyof ProductMapping;
  nameField: keyof ProductMapping;
}

const platforms: PlatformConfig[] = [
  {
    id: "shopify",
    name: "Shopify",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    idField: "shopifyId",
    nameField: "shopifyHandle",
  },
  {
    id: "odoo",
    name: "Odoo",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    idField: "odooId",
    nameField: "odooName",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    idField: "quickbooksId",
    nameField: "quickbooksName",
  },
  {
    id: "letaAi",
    name: "Leta AI",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    idField: "letaAiId",
    nameField: "letaAiName",
  },
  {
    id: "renda",
    name: "Renda",
    color: "text-pink-700",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    idField: "rendaId",
    nameField: "rendaName",
  },
];

// Mapping Status Badge
function MappingStatus({ mapped }: { mapped: boolean }) {
  return mapped ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      <Check size={12} /> Mapped
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
      <X size={12} /> Not Mapped
    </span>
  );
}

// Product Row Component
function ProductMappingRow({
  product,
  market,
  mapping,
  onEdit,
}: {
  product: Product;
  market: Market;
  mapping: ProductMapping | undefined;
  onEdit: () => void;
}) {
  const mappedCount = platforms.filter((p) => mapping?.[p.idField]).length;
  const totalPlatforms = platforms.length;

  return (
    <tr className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{product.name}</p>
            <p className="text-xs text-slate-400">SKU: {product.sku}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span
          className={`px-2 py-1 rounded-md text-xs font-semibold ${
            market === "Kenya"
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {market}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          {platforms.map((platform) => {
            const isMapped = !!mapping?.[platform.idField];
            return (
              <span
                key={platform.id}
                className={`px-2 py-0.5 rounded text-xs font-medium ${
                  isMapped
                    ? `${platform.bgColor} ${platform.color}`
                    : "bg-gray-100 text-gray-400"
                }`}
                title={
                  isMapped
                    ? `${platform.name}: ${mapping?.[platform.idField]}`
                    : `${platform.name}: Not mapped`
                }
              >
                {platform.name.substring(0, 3).toUpperCase()}
              </span>
            );
          })}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                mappedCount === totalPlatforms
                  ? "bg-green-500"
                  : mappedCount > 0
                    ? "bg-amber-500"
                    : "bg-gray-300"
              }`}
              style={{ width: `${(mappedCount / totalPlatforms) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 min-w-[40px]">
            {mappedCount}/{totalPlatforms}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <Edit2 size={16} />
        </button>
      </td>
    </tr>
  );
}

// Edit Mapping Modal
function EditMappingModal({
  product,
  market,
  mapping,
  onSave,
  onClose,
}: {
  product: Product;
  market: Market;
  mapping: ProductMapping | undefined;
  onSave: (mappings: Partial<ProductMapping>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    shopifyId: mapping?.shopifyId || "",
    shopifyHandle: mapping?.shopifyHandle || "",
    odooId: mapping?.odooId || "",
    odooName: mapping?.odooName || "",
    quickbooksId: mapping?.quickbooksId || "",
    quickbooksName: mapping?.quickbooksName || "",
    letaAiId: mapping?.letaAiId || "",
    letaAiName: mapping?.letaAiName || "",
    rendaId: mapping?.rendaId || "",
    rendaName: mapping?.rendaName || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-sm text-slate-500">SKU: {product.sku}</p>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      market === "Kenya"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {market}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[60vh]"
        >
          <div className="space-y-6">
            {platforms.map((platform) => (
              <div
                key={platform.id}
                className={`p-4 rounded-xl border ${platform.borderColor} ${platform.bgColor}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Link2 size={16} className={platform.color} />
                  <h3 className={`font-semibold ${platform.color}`}>
                    {platform.name}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {platform.name} ID
                    </label>
                    <input
                      type="text"
                      value={
                        formData[platform.idField as keyof typeof formData] ||
                        ""
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [platform.idField]: e.target.value,
                        }))
                      }
                      placeholder={`Enter ${platform.name} ID`}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      {platform.name} Name/Handle
                    </label>
                    <input
                      type="text"
                      value={
                        formData[platform.nameField as keyof typeof formData] ||
                        ""
                      }
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [platform.nameField]: e.target.value,
                        }))
                      }
                      placeholder={`Enter ${platform.name} name`}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save Mappings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductMappingsPage() {
  const { products, productMappings, handleUpdateProductMapping } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarket, setSelectedMarket] = useState<Market | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<
    "ALL" | "MAPPED" | "PARTIAL" | "UNMAPPED"
  >("ALL");
  const [editingProduct, setEditingProduct] = useState<{
    product: Product;
    market: Market;
  } | null>(null);

  // Generate product rows for both markets
  const productRows = useMemo(() => {
    const rows: Array<{ product: Product; market: Market }> = [];
    products.forEach((product) => {
      rows.push({ product, market: "Kenya" });
      rows.push({ product, market: "Nigeria" });
    });
    return rows;
  }, [products]);

  // Filter products
  const filteredRows = useMemo(() => {
    return productRows.filter(({ product, market }) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMarket =
        selectedMarket === "ALL" || market === selectedMarket;

      const mapping = productMappings.find(
        (m) => m.productId === product.id && m.market === market,
      );
      const mappedCount = platforms.filter((p) => mapping?.[p.idField]).length;

      let matchesStatus = true;
      if (selectedStatus === "MAPPED") {
        matchesStatus = mappedCount === platforms.length;
      } else if (selectedStatus === "PARTIAL") {
        matchesStatus = mappedCount > 0 && mappedCount < platforms.length;
      } else if (selectedStatus === "UNMAPPED") {
        matchesStatus = mappedCount === 0;
      }

      return matchesSearch && matchesMarket && matchesStatus;
    });
  }, [
    productRows,
    searchTerm,
    selectedMarket,
    selectedStatus,
    productMappings,
  ]);

  // Stats
  const stats = useMemo(() => {
    const total = productRows.length;
    let fullyMapped = 0;
    let partiallyMapped = 0;
    let unmapped = 0;

    productRows.forEach(({ product, market }) => {
      const mapping = productMappings.find(
        (m) => m.productId === product.id && m.market === market,
      );
      const mappedCount = platforms.filter((p) => mapping?.[p.idField]).length;

      if (mappedCount === platforms.length) fullyMapped++;
      else if (mappedCount > 0) partiallyMapped++;
      else unmapped++;
    });

    return { total, fullyMapped, partiallyMapped, unmapped };
  }, [productRows, productMappings]);

  const getMapping = (productId: string, market: Market) => {
    return productMappings.find(
      (m) => m.productId === productId && m.market === market,
    );
  };

  const handleSaveMapping = (mappings: Partial<ProductMapping>) => {
    if (editingProduct) {
      handleUpdateProductMapping(
        editingProduct.product.id,
        editingProduct.market,
        mappings,
      );
      setEditingProduct(null);
    }
  };

  return (
    <>
      <Header title="Product Mappings" />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Product Mappings
            </h2>
            <p className="text-sm text-slate-500">
              Map Shopify products to their counterparts in Odoo, QuickBooks,
              Leta AI, and Renda
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Package size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.total}
                </p>
                <p className="text-xs text-slate-500">Total Entries</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Check size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.fullyMapped}
                </p>
                <p className="text-xs text-slate-500">Fully Mapped</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertCircle size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.partiallyMapped}
                </p>
                <p className="text-xs text-slate-500">Partially Mapped</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <X size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.unmapped}
                </p>
                <p className="text-xs text-slate-500">Unmapped</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-4 mb-6">
          <div className="flex items-start gap-3">
            <Link2 size={20} className="text-purple-600 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900">
                Why Product Mapping?
              </p>
              <p className="text-sm text-purple-700 mt-1">
                Product mappings ensure that when orders come in from Shopify,
                the system can automatically match them to the correct product
                IDs in Odoo, QuickBooks, Leta AI, and Renda. This enables
                seamless order syncing across all platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[240px]">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={selectedMarket}
              onChange={(e) =>
                setSelectedMarket(e.target.value as Market | "ALL")
              }
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="ALL">All Markets</option>
              <option value="Kenya">Kenya</option>
              <option value="Nigeria">Nigeria</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(
                  e.target.value as "ALL" | "MAPPED" | "PARTIAL" | "UNMAPPED",
                )
              }
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="MAPPED">Fully Mapped</option>
              <option value="PARTIAL">Partially Mapped</option>
              <option value="UNMAPPED">Unmapped</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Platforms
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map(({ product, market }) => (
                  <ProductMappingRow
                    key={`${product.id}-${market}`}
                    product={product}
                    market={market}
                    mapping={getMapping(product.id, market)}
                    onEdit={() => setEditingProduct({ product, market })}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {filteredRows.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No products found</p>
              <p className="text-sm">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <EditMappingModal
          product={editingProduct.product}
          market={editingProduct.market}
          mapping={getMapping(editingProduct.product.id, editingProduct.market)}
          onSave={handleSaveMapping}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </>
  );
}
