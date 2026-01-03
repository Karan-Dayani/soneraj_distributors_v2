import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "info" | "warning";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "danger",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  // Type-based styles
  const styles = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonBg: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-700",
      buttonBg: "bg-yellow-600 hover:bg-yellow-700",
    },
    info: {
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonBg: "bg-gunmetal hover:bg-shadow-grey",
    },
  };

  const currentStyle = styles[type];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gunmetal/40 backdrop-blur-sm transition-opacity"
        onClick={isLoading ? undefined : onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-platinum overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-pale-slate-2 hover:text-gunmetal transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            {/* Icon Bubble */}
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${currentStyle.iconBg}`}
            >
              <AlertTriangle
                size={32}
                className={currentStyle.iconColor}
                strokeWidth={1.5}
              />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gunmetal mb-2">{title}</h3>
            <p className="text-slate-grey text-sm leading-relaxed mb-8">
              {message}
            </p>

            {/* Actions */}
            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-pale-slate text-gunmetal font-medium rounded-lg hover:bg-bright-snow transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 ${currentStyle.buttonBg}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
