"use client";

import Error from "@/app/components/Error";
import {
  MatrixRow,
  TableBody,
  TableFooter,
  TableHeader,
} from "@/app/components/Table";
import { useCart } from "@/app/context/CartContext";
import { Check, ChevronDown, RefreshCcw, Store, Trash2 } from "lucide-react";

export default function CheckoutPage() {
  const {
    cart,
    removeProduct,
    removeVariant,
    clearCart,
    totalItems,
    getUniqueSizes,
  } = useCart();
  const products = Object.values(cart);
  const sizes = getUniqueSizes();

  if (products.length === 0) return <Error error="Cart is Empty." />;

  // Inside your Parent Component
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
            {/* Optional: Low stock indicator */}
            {/* {variant.maxStock < 5 && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-orange-500"
                title="Low Stock"
              ></span>
            )} */}
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

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-shadow-grey">Cart</h1>
          <p className="text-slate-grey text-sm mt-1">
            Available distillery units.
          </p>
        </div>
        <button
          className="text-red-400 hover:text-red-600 cursor-pointer"
          onClick={() => clearCart()}
        >
          <RefreshCcw size={28} />
        </button>
      </div>

      <div className="w-full border border-shadow-grey overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh]">
          <table className="min-w-full border-collapse">
            <TableHeader sizes={sizes} />
            <TableBody rows={tableRows} sizes={sizes} />
            <TableFooter total={totalItems} colSpanCount={sizes.length} />
          </table>
        </div>
      </div>

      {/* <div className="fixed bottom-0 left-0 w-full bg-white border-t border-labaster-grey p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-6xl mx-auto">
          <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gunmetal text-white hover:bg-shadow-grey hover:shadow-xl active:scale-[0.98] transition-all duration-200 cursor-pointer group border border-shadow-grey">
            <Check
              size={22}
              className="group-hover:scale-110 transition-transform duration-200"
            />
            <span className="font-bold text-lg tracking-wide uppercase">
              Confirm Order
            </span>
          </button>
        </div>
      </div> */}
      <div className="mt-10 p-4 bg-bright-snow border border-alabaster-grey rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* 1. SELECT RETAILER (Grows to fill space) */}
          {/* <div className="relative w-full sm:flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pale-slate-2 group-focus-within:text-gunmetal transition-colors duration-300 pointer-events-none z-10">
              <Store size={20} strokeWidth={2} />
            </div>

            <select
              className="w-full appearance-none bg-white border border-alabaster-grey text-gunmetal font-medium py-3.5 pl-12 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gunmetal/10 focus:border-gunmetal transition-all duration-200 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled className="text-pale-slate">
                Select a retailer...
              </option>
              {retailers.map((retailer) => (
                <option key={retailer.id} value={retailer.id}>
                  {retailer.name} — {retailer.code}
                </option>
              ))}
            </select>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-pale-slate-2 pointer-events-none">
              <ChevronDown size={16} strokeWidth={3} />
            </div>
          </div> */}

          {/* 2. ACTION BUTTON (Fixed width or auto) */}
          <button
            onClick={() => console.log("order confirm")}
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
  );
}
