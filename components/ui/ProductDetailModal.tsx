"use client";

import { X, FileText } from "lucide-react";
import { Product, StockStatus } from "@/lib/types";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full text-slate-400 hover:text-deep-navy shadow-sm transition-all"
        >
          <X size={20} />
        </button>

        <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden bg-slate-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
              {product.category}
            </span>
            <span
              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                product.status === StockStatus.IN_STOCK
                  ? "bg-green-50 text-green-700 border-green-100"
                  : product.status === StockStatus.LOW_STOCK
                    ? "bg-orange-50 text-orange-700 border-orange-100"
                    : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {product.status}
            </span>
          </div>

          <h2 className="text-3xl font-extrabold text-deep-navy font-display mb-1">
            {product.name}
          </h2>
          <p className="text-sm font-medium text-slate-400 tracking-wider uppercase mb-6">
            {product.sku}
          </p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                Current Stock
              </p>
              <p
                className={`text-2xl font-black ${product.stock < 10 ? "text-red-600" : "text-slate-900"}`}
              >
                {product.stock}{" "}
                <span className="text-xs font-bold text-slate-400">UNITS</span>
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">
                USD Price
              </p>
              <p className="text-2xl font-black text-slate-900">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Local Market Prices */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-xl border border-green-100">
              <p className="text-[10px] font-bold text-green-600 uppercase tracking-tighter mb-1">
                🇰🇪 Kenya
              </p>
              <p className="text-lg font-bold text-green-700">
                KES {product.priceKES?.toLocaleString() || "N/A"}
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter mb-1">
                🇳🇬 Nigeria
              </p>
              <p className="text-lg font-bold text-emerald-700">
                ₦{product.priceNGN?.toLocaleString() || "N/A"}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
              <FileText size={14} className="text-slate-400" /> Product
              Description
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">
              {product.description ||
                "No description available for this SKU. Ensure metadata is synced with Shopify and Odoo for complete product profiles."}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold overflow-hidden"
                  >
                    <img
                      src={`https://picsum.photos/seed/${product.id}${i}/40/40`}
                      alt="Warehouse Hub"
                    />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                AVAILABLE IN 3 HUBS
              </span>
            </div>
            <button className="px-6 py-2.5 bg-action-blue text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">
              Update Stock Level
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
