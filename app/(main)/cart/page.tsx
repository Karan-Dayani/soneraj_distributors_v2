"use client";

import CustomAlert from "@/app/components/CustomAlert";
import Error from "@/app/components/Error";
import {
  MatrixRow,
  TableBody,
  TableFooter,
  TableHeader,
} from "@/app/components/Table";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";
import { useCustomers } from "@/app/utils/hooks/useCustomers";
import { useDebounce } from "@/app/utils/hooks/useDebounce";
import { Check, ChevronDown, RefreshCcw, Store, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function CheckoutPage() {
  const { addToast } = useToast();
  const { cart, removeProduct, clearCart, totalItems, getUniqueSizes } =
    useCart();
  const products = Object.values(cart);
  const sizes = getUniqueSizes();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 500);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedRetailer, setSelectedRetailer] = useState<number | null>(null);

  const [clearCartModal, setClearCartModal] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);

  const { data: Customers } = useCustomers({ search: debouncedQuery });

  const handleSelect = (customer: {
    id: number;
    name: string | null;
    created_at: string;
  }) => {
    setSelectedRetailer(customer.id);
    setQuery(customer.name as string);
    setIsOpen(false);
    console.log("Selected ID:", customer.id);
  };

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
  }, [wrapperRef, selectedRetailer, query]);

  const tableRows: MatrixRow[] = products.map((prod) => {
    const cells: Record<string, React.ReactNode> = {};

    sizes.forEach((size) => {
      const variant = Object.values(prod.variants).find(
        (v) => v.sizeName === size
      );

      if (variant) {
        cells[size] = (
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="text-sm font-semibold text-iron-grey">
              {variant.quantity}
            </span>
          </div>
        );
      } else {
        cells[size] = null;
      }
    });

    return {
      id: prod.productId,
      label: (
        <div className="flex flex-col">
          <span>{prod.productName}</span>
          <span className="text-[10px] text-slate-grey font-normal">
            ID: {prod.productId}
          </span>
        </div>
      ),
      cells: cells,
      action: (
        <button
          className="text-pale-slate-2 hover:text-red-500 transition-colors p-2 cursor-pointer"
          onClick={() => removeProduct(prod.productId)}
        >
          <Trash2 size={18} />
        </button>
      ),
    };
  });

  if (products.length === 0) return <Error error="Cart is Empty." />;

  return (
    <>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-shadow-grey">Cart</h1>
            <p className="text-slate-grey text-sm mt-1">
              Available distillery units.
            </p>
          </div>
          <button
            className="text-red-400 hover:text-red-600 cursor-pointer"
            onClick={() => setClearCartModal(true)}
          >
            <RefreshCcw size={28} />
          </button>
        </div>

        {/* Table */}
        <div className="w-full border border-shadow-grey overflow-hidden">
          <div className="overflow-x-auto max-h-[60vh] no-scrollbar">
            <table className="min-w-full border-separate border-spacing-0">
              <TableHeader sizes={sizes} />
              <TableBody rows={tableRows} sizes={sizes} />
              <TableFooter total={totalItems} colSpanCount={sizes.length} />
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 p-4 bg-bright-snow border border-alabaster-grey rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* 1. SELECT RETAILER */}
            <div className="relative flex-1 w-full group" ref={wrapperRef}>
              {/* Left Icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pale-slate-2 group-focus-within:text-gunmetal transition-colors duration-300 pointer-events-none z-10">
                <Store size={20} strokeWidth={2} />
              </div>

              {/* Search Input (Replaces Select) */}
              <input
                type="text"
                className="w-full bg-white border border-alabaster-grey text-gunmetal font-medium py-3.5 pl-12 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gunmetal/10 focus:border-gunmetal transition-all duration-200 placeholder-pale-slate"
                placeholder="Search or select a retailer..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                  if (
                    selectedRetailer &&
                    Number(e.target.value) !== selectedRetailer
                  ) {
                    setSelectedRetailer(null); // Clear selection if user modifies text
                  }
                }}
                onFocus={() => setIsOpen(true)}
              />

              {/* Right Chevron */}
              <div
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-pale-slate-2 pointer-events-none transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <ChevronDown size={16} strokeWidth={3} />
              </div>

              {/* Dropdown Options List */}
              {isOpen && (
                <div className="absolute mt-2 w-full bg-white border border-alabaster-grey rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-100">
                  {Customers?.data.length === 0 ? (
                    <div className="p-4 text-center text-sm text-pale-slate-2">
                      No retailers found.
                    </div>
                  ) : (
                    <ul className="py-1">
                      {Customers?.data.map((customer) => {
                        const isSelected = selectedRetailer === customer.id;
                        return (
                          <li
                            key={customer.id}
                            onClick={() => handleSelect(customer)}
                            className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between group transition-colors
                          ${
                            isSelected
                              ? "bg-bright-snow"
                              : "hover:bg-bright-snow"
                          }
                        `}
                          >
                            <span
                              className={`font-medium ${
                                isSelected ? "text-gunmetal" : "text-iron-grey"
                              }`}
                            >
                              {customer.name}
                            </span>
                            {isSelected && (
                              <Check size={16} className="text-gunmetal" />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* 2. ACTION BUTTON (Fixed width or auto) */}
            <button
              onClick={() => setConfirmModal(true)}
              disabled={false}
              // Logic: Standard styles -> Hover styles -> Disabled overrides
              className="w-full sm:w-auto min-w-[180px] flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-gunmetal text-white font-semibold shadow-md cursor-pointer
                   hover:bg-shadow-grey  transition-all duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed  disabled:shadow-none"
            >
              <Check size={20} strokeWidth={3} />
              Confirm Order
            </button>
          </div>
        </div>
      </div>

      <CustomAlert
        isOpen={clearCartModal}
        onClose={() => setClearCartModal(false)}
        onConfirm={() => {
          clearCart();
          addToast("Cart Cleared.", "info");
          setClearCartModal(false);
        }}
        title="Clear Cart"
        message="Are you sure you want to clear cart ?"
      />

      <CustomAlert
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={() => {
          setConfirmModal(false);
          console.log("Order Confirmed!");
        }}
        title="Order Confirmation"
        message="Are you sure you want to add the order ?"
        type="info"
      />
    </>
  );
}
