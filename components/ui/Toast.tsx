"use client";

import { CheckCircle, Mail } from "lucide-react";

interface ToastProps {
  message: string;
  visible: boolean;
  type?: "success" | "info";
}

export const Toast: React.FC<ToastProps> = ({
  message,
  visible,
  type = "success",
}) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] bg-deep-navy text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 duration-300">
      {type === "success" ? (
        <CheckCircle className="text-green-400" size={20} />
      ) : (
        <Mail className="text-blue-400" size={20} />
      )}
      <span className="text-sm font-bold">{message}</span>
    </div>
  );
};
