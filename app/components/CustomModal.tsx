import React from "react";
import { X } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string; // Optional: e.g., 'max-w-lg', 'max-w-2xl', 'max-w-4xl'
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg", // Default width
}) => {
  if (!isOpen) return null;

  return (
    // Z-Index matching your Alert
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gunmetal/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`
          relative w-full ${maxWidth} 
          bg-white rounded-xl shadow-2xl border border-platinum 
          overflow-hidden transform transition-all scale-100 
          animate-in zoom-in-95 duration-200 
          max-h-[90vh] flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-platinum bg-white shrink-0">
          <h3 className="text-lg font-bold text-gunmetal truncate pr-4">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-pale-slate-2 hover:text-gunmetal hover:bg-bright-snow p-1 rounded-md transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;
