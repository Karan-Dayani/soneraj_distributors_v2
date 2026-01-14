import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, List, X } from "lucide-react";

// --- GENERIC PROPS INTERFACE ---
export interface SimpleSelectProps<T> {
  /** The list of data to display in the dropdown */
  options: T[];
  /** Callback fired when user selects an option */
  onSelect: (item: T) => void;
  onClear: () => void;
  /** Which property of the object to display (e.g., 'name', 'title') */
  displayKey: keyof T;
  /** Unique ID key (e.g., 'id') for React keys and comparison */
  idKey: keyof T;
  /** Label for the input */
  label?: string;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Optional: Currently selected ID (for controlled component usage) */
  selectedId?: string | number | null;
  /** Optional: Custom icon to display on the left (defaults to List) */
  icon?: React.ElementType;
}

export default function SimpleSelect<T extends Record<string, any>>({
  options = [],
  onSelect,
  onClear,
  displayKey,
  idKey,
  label,
  placeholder = "Select an option...",
  selectedId,
  icon: Icon = List,
}: SimpleSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Derive selected item from props if selectedId is provided
  const selectedItem = selectedId
    ? options.find((item) => item[idKey] === selectedId)
    : null;

  // Handle Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AUTO-SCROLL LOGIC: Keeps consistency with SearchSelect
  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const timer = setTimeout(() => {
        wrapperRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOptionClick = (item: T) => {
    onSelect(item);
    setIsOpen(false);
  };

  const handleClear = () => {
    onClear();
  };

  return (
    <div
      className="w-full font-sans text-gunmetal scroll-mt-24"
      ref={wrapperRef}
    >
      {label && (
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-grey mb-2 ml-1">
          {label}
        </label>
      )}

      <div className="relative group">
        {/* Left Icon (Visual only) */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pale-slate-2 pointer-events-none z-10">
          <Icon
            size={20}
            strokeWidth={2}
            // className="group-hover:text-gunmetal transition-colors"
          />
        </div>

        {/* Trigger Button (Replaces Input) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full pl-12 pr-10 py-3.5 text-left
            bg-white border rounded-xl
            text-gunmetal font-medium
            shadow-sm transition-all duration-200
            focus:outline-none focus:border-gunmetal focus:ring-4 focus:ring-gunmetal/5
            ${
              isOpen
                ? "border-gunmetal"
                : "border-alabaster-grey hover:border-pale-slate"
            }
          `}
        >
          {selectedItem ? (
            <span className="text-gunmetal">{selectedItem[displayKey]}</span>
          ) : (
            <span className="text-pale-slate-2">{placeholder}</span>
          )}
        </button>

        {/* Right Chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {selectedId && (
            <button
              onClick={handleClear}
              className="text-pale-slate-2 hover:text-gunmetal transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-pale-slate-2 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-alabaster-grey rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="p-4 text-center text-sm text-pale-slate-2">
                No options available.
              </div>
            ) : (
              <ul className="py-1">
                {options.map((item) => {
                  const isSelected = selectedItem?.[idKey] === item[idKey];
                  return (
                    <li
                      key={String(item[idKey])}
                      onClick={() => handleOptionClick(item)}
                      className={`
                        px-4 py-3 text-sm cursor-pointer flex items-center justify-between
                        transition-colors group
                        ${
                          isSelected ? "bg-bright-snow" : "hover:bg-bright-snow"
                        }
                      `}
                    >
                      <span
                        className={`font-medium ${
                          isSelected ? "text-gunmetal" : "text-iron-grey"
                        } group-hover:text-gunmetal`}
                      >
                        {item[displayKey]}
                      </span>

                      {isSelected && (
                        <Check size={16} className="text-gunmetal" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Footer with Count */}
            {options.length > 0 && (
              <div className="bg-bright-snow p-2 text-center border-t border-platinum">
                <span className="text-[10px] text-pale-slate-2 font-medium uppercase tracking-wider">
                  {options.length} Options
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
