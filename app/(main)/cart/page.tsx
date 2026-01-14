"use client";

import { useState } from "react";
import { RefreshCcw, Trash2, Check } from "lucide-react"; // Icons
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
import SearchSelect from "@/app/components/SearchSelectDropdown";
import { Database } from "@/types/supabase";

type Customer = Database["public"]["Tables"]["Customers"]["Row"];

export default function CheckoutPage() {
  const { addToast } = useToast();
  const { cart, removeProduct, clearCart, totalItems, getUniqueSizes } =
    useCart();

  // Cart Data
  const products = Object.values(cart);
  const sizes = getUniqueSizes();

  // Modal States
  const [clearCartModal, setClearCartModal] = useState<boolean>(false);
  const [confirmModal, setConfirmModal] = useState<boolean>(false);

  // Search & Retailer State
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 500);
  const [selectedRetailerId, setSelectedRetailerId] = useState<number | null>(
    null
  );

  // API Hook
  const { data: Customers, isLoading } = useCustomers({
    search: debouncedQuery,
  });

  // --- HANDLERS ---

  // 1. Handle Search (Connected to SearchSelect)
  const handleRetailerSearch = (q: string) => {
    setQuery(q); // Updates state -> triggers debounce -> triggers useCustomers
  };

  // 2. Handle Selection (Connected to SearchSelect)
  const handleRetailerSelect = (customer: Customer) => {
    setSelectedRetailerId(customer.id);
  };

  const handleConfirmOrder = () => {
    if (!selectedRetailerId) {
      addToast("Please select a retailer first.", "warning");
      return;
    }
    setConfirmModal(false);
    console.log("Order Confirmed for Retailer:", selectedRetailerId);
    addToast("Order placed successfully!", "success");
  };

  // --- TABLE ROWS GENERATION ---
  const tableRows: MatrixRow[] = products.map((prod) => {
    const cells: Record<string, React.ReactNode> = {};
    sizes.forEach((size) => {
      const variant = Object.values(prod.variants).find(
        (v) => v.sizeName === size
      );
      cells[size] = variant ? (
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-sm font-semibold text-iron-grey">
            {variant.quantity}
          </span>
        </div>
      ) : null;
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

        {/* Footer Actions */}
        <div className="mt-4 p-4 bg-bright-snow border border-alabaster-grey rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            {/* 1. REUSABLE SEARCH SELECT */}
            <div className="flex-1 w-full">
              <SearchSelect
                // Data Props
                options={Customers?.data || []}
                isLoading={isLoading} // Pass loading state if available from hook
                // Config Props
                displayKey="name"
                idKey="id"
                placeholder="Search retailer..."
                // label={undefined} // Hides the top label to match your previous layout
                // Event Handlers
                onSearch={handleRetailerSearch}
                onSelect={handleRetailerSelect}
                onClear={() => setSelectedRetailerId(null)}
              />
            </div>

            {/* 2. CONFIRM BUTTON */}
            <button
              onClick={() => setConfirmModal(true)}
              disabled={!selectedRetailerId} // Optional: Disable if no retailer selected
              className="
                w-full sm:w-auto min-w-[180px] flex items-center justify-center gap-2.5 px-6 py-3.5 
                rounded-lg bg-gunmetal text-white font-semibold shadow-md cursor-pointer
                hover:bg-shadow-grey transition-all duration-200 
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
              "
            >
              <Check size={20} strokeWidth={3} />
              Confirm Order
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomAlert
        isOpen={clearCartModal}
        onClose={() => setClearCartModal(false)}
        onConfirm={() => {
          clearCart();
          addToast("Cart Cleared.", "info");
          setClearCartModal(false);
        }}
        title="Clear Cart"
        message="Are you sure you want to clear cart?"
      />

      <CustomAlert
        isOpen={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleConfirmOrder}
        title="Order Confirmation"
        message="Are you sure you want to add the order?"
        type="info"
      />
    </>
  );
}
