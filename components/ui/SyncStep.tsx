"use client";

import { LucideIcon } from "lucide-react";

interface SyncStepProps {
  label: string;
  status: "pending" | "success" | "failed";
  icon: LucideIcon;
}

export const SyncStep: React.FC<SyncStepProps> = ({
  label,
  status,
  icon: Icon,
}) => {
  const colors = {
    pending: "bg-slate-100 text-slate-400 border-slate-200",
    success: "bg-green-100 text-green-600 border-green-200",
    failed: "bg-red-100 text-red-600 border-red-200",
  };

  return (
    <div
      className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-tight transition-colors duration-300 ${colors[status]}`}
    >
      <Icon size={12} />
      <span>{label}</span>
    </div>
  );
};
