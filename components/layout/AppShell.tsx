"use client";

import { useApp } from "@/lib/context";
import { Toast } from "@/components/ui/Toast";
import { ProductDetailModal } from "@/components/ui/ProductDetailModal";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { selectedProduct, setSelectedProduct, toast } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-bg-light">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <Toast
        message={toast?.message || ""}
        visible={!!toast}
        type={toast?.type === "success" || toast?.type === "info" ? toast.type : undefined}
      />
    </div>
  );
}
