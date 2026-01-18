import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, ChevronDown, Loader2, X, Check } from "lucide-react";

// --- GENERIC PROPS INTERFACE ---
export interface SearchSelectProps<T> {
  /** The list of data to display in the dropdown */
  options: T[];
  /** Callback fired when user types. Parent should trigger API call here. */
  onSearch: (query: string) => void;
  /** Callback fired when user selects an option */
  onSelect: (item: T) => void;
  onClear: () => void;
  /** Which property of the object to display (e.g., 'name', 'title') */
  displayKey: string;
  /** Unique ID key (e.g., 'id') for React keys and comparison */
  idKey: keyof T;
  /** Label for the input */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Loading state to show spinner */
  isLoading?: boolean;
}

export default function SearchSelect<T extends Record<string, any>>({
  options = [],
  onSearch,
  onSelect,
  onClear,
  displayKey,
  idKey,
  label = "",
  placeholder = "Type to search...",
  isLoading = false,
}: SearchSelectProps<T>) {
  const [inputValue, setInputValue] = useState("");
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getDisplayLabel = useCallback(
    (item: T | null): string => {
      if (!item) return "";

      if (displayKey.includes(",")) {
        return displayKey
          .split(",")
          .map((key) => item[key.trim()])
          .filter(Boolean)
          .join(" ");
      }
      return item[displayKey];
    },
    [displayKey],
  );

  // Handle Click Outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Optional: If you want to reset the input to the selected item's name on blur
        if (selectedItem) {
          setInputValue(getDisplayLabel(selectedItem));
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedItem, getDisplayLabel]);

  // AUTO-SCROLL LOGIC: Scrolls input to top/center when opened
  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      // 300ms delay gives the mobile keyboard time to slide up before we scroll
      const timer = setTimeout(() => {
        wrapperRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center", // Centers the input in the visible area (safer than 'start' which might hide behind headers)
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onSearch(val);
    setIsOpen(true);

    // Logic: If user modifies text, clear the "selection" state
    if (selectedItem && val !== getDisplayLabel(selectedItem)) {
      setSelectedItem(null);
    }
  };

  const handleOptionClick = (item: T) => {
    setInputValue(getDisplayLabel(item)); // Display the name
    setSelectedItem(item); // Track selection
    onSelect(item); // Notify parent
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputValue("");
    setSelectedItem(null);
    onSearch("");
    setIsOpen(false);
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
        {/* Left Icon: Search or Loading Spinner */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pale-slate-2 pointer-events-none z-10">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-gunmetal" />
          ) : (
            <Search
              size={18}
              className="group-focus-within:text-gunmetal transition-colors"
            />
          )}
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-10 py-3.5 
            bg-white border border-alabaster-grey rounded-xl
            text-gunmetal font-medium placeholder-pale-slate-2
            shadow-sm transition-all duration-200
            focus:outline-none focus:border-gunmetal focus:ring-4 focus:ring-gunmetal/5
            hover:border-pale-slate
          "
        />

        {/* Right Actions: Clear or Chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {inputValue && !isLoading && (
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
                {isLoading ? "Searching..." : "No results found."}
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
                        {getDisplayLabel(item)}
                      </span>

                      {isSelected && (
                        <Check size={16} className="text-gunmetal" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Result Count Footer */}
            {!isLoading && options.length > 0 && (
              <div className="bg-bright-snow p-2 text-center border-t border-platinum">
                <span className="text-[10px] text-pale-slate-2 font-medium uppercase tracking-wider">
                  {options.length} Results
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
