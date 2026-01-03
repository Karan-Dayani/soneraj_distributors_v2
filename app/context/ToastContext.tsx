"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

// --- TYPES ---
type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- HOOK ---
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// --- TOAST UI COMPONENT ---
const ToastItem = ({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    // Wait for animation to finish before removing from state
    setTimeout(() => {
      onRemove(toast.id);
    }, 400);
  }, [onRemove, toast.id]);

  // Handle auto-dismiss
  useEffect(() => {
    const duration = toast.duration || 4000;
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.duration, handleClose]);

  const styles = {
    success: {
      icon: CheckCircle,
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      border: "border-emerald-200",
      progressBg: "bg-emerald-100", // Explicit class
      progressFill: "bg-emerald-500", // Explicit class
    },
    error: {
      icon: AlertCircle,
      bg: "bg-rose-100",
      text: "text-rose-600",
      border: "border-rose-200",
      progressBg: "bg-rose-100",
      progressFill: "bg-rose-500",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-amber-100",
      text: "text-amber-600",
      border: "border-amber-200",
      progressBg: "bg-amber-100",
      progressFill: "bg-amber-500",
    },
    info: {
      icon: Info,
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-200",
      progressBg: "bg-blue-100",
      progressFill: "bg-blue-500",
    },
  };

  const style = styles[toast.type];
  const Icon = style.icon;

  return (
    <div
      className={`
        relative flex items-start gap-4 p-4 pr-12 min-w-[340px] max-w-sm
        bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08 
        rounded-xl border-2 ${style.border}
        transform transition-all duration-400 ease-in-out
        ${
          isExiting
            ? "translate-x-[120%] opacity-0"
            : "translate-x-0 opacity-100"
        }
        hover:shadow-lg hover:border-alabaster-grey
      `}
      style={{
        animation: "slideIn 0.4s cubic-bezier(0.21, 1.02, 0.7, 1)",
      }}
      role="alert"
    >
      {/* Colored Icon Container */}
      <div
        className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg} ${style.text}`}
      >
        <Icon size={20} strokeWidth={2.5} />
      </div>

      <div className="flex-1 pt-0.5 pb-2">
        <h4 className="text-sm font-bold text-gunmetal capitalize mb-1 leading-none">
          {toast.type}
        </h4>
        <p className="text-sm text-slate-grey leading-snug font-medium">
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-2 text-pale-slate-2 hover:text-gunmetal hover:bg-bright-snow rounded-lg transition-all"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>

      {/* Progress Bar (Updated Logic) */}
      <div
        className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full overflow-hidden ${style.progressBg}`}
      >
        <div
          className={`h-full rounded-full ${style.progressFill}`}
          style={{
            width: "100%",
            animation: `shrink ${toast.duration || 4000}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
};

// --- PROVIDER ---
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Keyframe styles for the progress bar animation */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Toast Container - Fixed Position */}
      <div className="fixed top-6 right-6 z-9999 flex flex-col gap-3 pointer-events-none perspective-[1000px]">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto transition-all">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
