"use client";

import { useState, useRef, useCallback } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Package,
  DollarSign,
  Hash,
  Layers,
  AlertTriangle,
  Loader2,
  Check,
  Trash2,
} from "lucide-react";
import { Product, StockStatus } from "@/lib/types";
import { useApp } from "@/lib/context";
import { CONFIG } from "@/lib/constants/config";

// ==================== IMAGE UPLOAD COMPONENT ====================

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  disabled?: boolean;
}

export function ImageUpload({
  currentImage,
  onImageChange,
  disabled,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      if (file.size > CONFIG.MAX_UPLOAD_SIZE) {
        alert("Image must be less than 5MB");
        return;
      }

      setIsUploading(true);

      // Simulate upload - in production, you'd upload to a server/CDN
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;

        // Simulate network delay
        setTimeout(() => {
          setPreview(result);
          onImageChange(result);
          setIsUploading(false);
        }, CONFIG.UPLOAD_SIMULATE_DELAY);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [disabled, processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onImageChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        Product Image
      </label>

      <div
        className={`relative border-2 border-dashed rounded-xl transition-all overflow-hidden ${
          isDragging
            ? "border-action-blue bg-blue-50"
            : preview
              ? "border-slate-200 bg-slate-50"
              : "border-slate-300 bg-slate-50 hover:border-slate-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !preview && fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="relative aspect-video">
            <img
              src={preview}
              alt="Product preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="p-3 bg-white rounded-full text-slate-700 hover:bg-slate-100 shadow-lg"
                >
                  <Upload size={18} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="p-3 bg-red-500 rounded-full text-white hover:bg-red-600 shadow-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-video flex flex-col items-center justify-center p-6">
            {isUploading ? (
              <>
                <Loader2
                  size={32}
                  className="text-action-blue animate-spin mb-3"
                />
                <p className="text-sm font-medium text-slate-600">
                  Uploading...
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon size={28} className="text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  Drop image here or click to upload
                </p>
                <p className="text-xs text-slate-400">PNG, JPG up to 5MB</p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
    </div>
  );
}

// ==================== PRODUCT FORM MODAL ====================

interface ProductFormModalProps {
  product?: Product | null;
  onClose: () => void;
  onSave: (product: Omit<Product, "id" | "status" | "availableStock">) => void;
  mode: "add" | "edit";
}

export function ProductFormModal({
  product,
  onClose,
  onSave,
  mode,
}: ProductFormModalProps) {
  const { warehouses } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: product?.category || "",
    sku: product?.sku || "",
    price: product?.price?.toString() || "",
    priceKES: product?.priceKES?.toString() || "",
    priceNGN: product?.priceNGN?.toString() || "",
    costPrice: product?.costPrice?.toString() || "",
    stock: product?.stock?.toString() || "",
    reservedStock: product?.reservedStock?.toString() || "0",
    reorderLevel: product?.reorderLevel?.toString() || "10",
    image: product?.image || "",
    description: product?.description || "",
    warehouseId: product?.warehouseId || "",
  });

  const categories = [
    "Cleansers",
    "Serums",
    "Moisturizers",
    "Sunscreen",
    "Treatments",
    "Masks",
    "Sets",
    "Body Care",
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid USD price is required";
    }
    if (!formData.priceKES || parseFloat(formData.priceKES) <= 0) {
      newErrors.priceKES = "Valid KES price is required";
    }
    if (!formData.priceNGN || parseFloat(formData.priceNGN) <= 0) {
      newErrors.priceNGN = "Valid NGN price is required";
    }
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = "Valid cost price is required";
    }
    if (formData.stock === "" || parseInt(formData.stock) < 0) {
      newErrors.stock = "Valid stock quantity is required";
    }
    if (!formData.image) newErrors.image = "Product image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    const stock = parseInt(formData.stock);
    const reserved = parseInt(formData.reservedStock) || 0;

    onSave({
      name: formData.name.trim(),
      category: formData.category,
      sku: formData.sku.trim().toUpperCase(),
      price: parseFloat(formData.price),
      priceKES: parseFloat(formData.priceKES),
      priceNGN: parseFloat(formData.priceNGN),
      costPrice: parseFloat(formData.costPrice),
      stock,
      reservedStock: reserved,
      reorderLevel: parseInt(formData.reorderLevel) || 10,
      image: formData.image,
      description: formData.description.trim() || undefined,
      warehouseId: formData.warehouseId || undefined,
    });

    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {mode === "add" ? "Add New Product" : "Edit Product"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {mode === "add"
                ? "Add a new product to your inventory"
                : `Editing ${product?.name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          <div className="space-y-6">
            {/* Image Upload */}
            <ImageUpload
              currentImage={formData.image}
              onImageChange={(url) => handleChange("image", url)}
            />
            {errors.image && (
              <p className="text-sm text-red-500 flex items-center gap-1 -mt-4">
                <AlertTriangle size={14} /> {errors.image}
              </p>
            )}

            {/* Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Package size={14} className="inline mr-1.5 text-slate-400" />
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                    errors.name
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                  placeholder="e.g., Vitamin C Serum"
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Layers size={14} className="inline mr-1.5 text-slate-400" />
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white ${
                    errors.category
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-500 mt-1">{errors.category}</p>
                )}
              </div>
            </div>

            {/* SKU & Warehouse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Hash size={14} className="inline mr-1.5 text-slate-400" />
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) =>
                    handleChange("sku", e.target.value.toUpperCase())
                  }
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 font-mono ${
                    errors.sku ? "border-red-300 bg-red-50" : "border-slate-200"
                  }`}
                  placeholder="e.g., UNC-VCS-001"
                />
                {errors.sku && (
                  <p className="text-xs text-red-500 mt-1">{errors.sku}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Warehouse
                </label>
                <select
                  value={formData.warehouseId}
                  onChange={(e) => handleChange("warehouseId", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 bg-white"
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.region})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <DollarSign size={16} className="text-slate-500" />
                <h3 className="text-sm font-bold text-slate-700">Pricing</h3>
              </div>

              {/* USD Price - for calculations */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  USD Price (for calculations) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                      errors.price
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Used for overall revenue calculations and reporting
                </p>
              </div>

              {/* Local Market Prices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    🇰🇪 Kenya Price (KES) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                      KES
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.priceKES}
                      onChange={(e) => handleChange("priceKES", e.target.value)}
                      className={`w-full pl-14 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                        errors.priceKES
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200"
                      }`}
                      placeholder="0"
                    />
                  </div>
                  {errors.priceKES && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.priceKES}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    🇳🇬 Nigeria Price (NGN) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                      ₦
                    </span>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.priceNGN}
                      onChange={(e) => handleChange("priceNGN", e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                        errors.priceNGN
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200"
                      }`}
                      placeholder="0"
                    />
                  </div>
                  {errors.priceNGN && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.priceNGN}
                    </p>
                  )}
                </div>
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Cost Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => handleChange("costPrice", e.target.value)}
                    className={`w-full pl-8 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                      errors.costPrice
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.costPrice && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.costPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Current Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 ${
                    errors.stock
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200"
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-xs text-red-500 mt-1">{errors.stock}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reserved Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.reservedStock}
                  onChange={(e) =>
                    handleChange("reservedStock", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Reorder Level
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.reorderLevel}
                  onChange={(e) => handleChange("reorderLevel", e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20"
                  placeholder="10"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-action-blue/20 resize-none"
                placeholder="Product description..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                {mode === "add" ? "Add Product" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== IMAGE UPLOAD MODAL ====================

interface ImageUploadModalProps {
  product: Product;
  onClose: () => void;
  onSave: (imageUrl: string) => void;
}

export function ImageUploadModal({
  product,
  onClose,
  onSave,
}: ImageUploadModalProps) {
  const [imageUrl, setImageUrl] = useState(product.image);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!imageUrl) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSave(imageUrl);
    setIsSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Update Product Image
            </h2>
            <p className="text-sm text-slate-500 mt-1">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <ImageUpload currentImage={imageUrl} onImageChange={setImageUrl} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !imageUrl}
            className="px-5 py-2.5 bg-action-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check size={16} />
                Update Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
