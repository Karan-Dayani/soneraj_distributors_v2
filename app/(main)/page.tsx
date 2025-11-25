"use client";
import { useState } from "react";
import { useSuppliers } from "../utils/hooks/useSuppliers";
import { ChevronDown, Package, AlertCircle, Tag } from "lucide-react";
import { Database } from "@/types/supabase";
import { useProducts } from "../utils/hooks/useProducts";
import Link from "next/link";

type Supplier = Database["public"]["Tables"]["Suppliers"]["Row"];
type Product = Database["public"]["Tables"]["Products"]["Row"];

export default function Home() {
  const {
    data: suppliers,
    isLoading: isLoadingSuppliers,
    error: suppliersError,
  } = useSuppliers();

  const {
    data: products,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts();

  const [openId, setOpenId] = useState<number | null>(null);

  const toggleDropdown = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const isLoading = isLoadingSuppliers || isLoadingProducts;
  const error = suppliersError || productsError;

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-[50vh] text-slate-grey animate-pulse">
        Loading Inventory...
      </div>
    );

  if (error) return <div className="p-10 text-red-500">{error.message}</div>;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* --- Page Header --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-shadow-grey">Suppliers</h1>
        <p className="text-slate-grey text-sm mt-1">
          Available distillery units.
        </p>
      </div>

      {/* --- Suppliers List --- */}
      <div className="flex flex-col gap-4">
        {suppliers?.map((supplier: Supplier) => {
          const isOpen = openId === supplier.id;

          // FILTER: Get only products for this supplier
          const supplierProducts =
            products?.filter((p: Product) => p.supplier_id === supplier.id) ||
            [];

          return (
            <div
              key={supplier.id}
              className={`
                bg-white rounded-xl border transition-all duration-200 overflow-hidden
                ${
                  isOpen
                    ? "border-gunmetal shadow-lg"
                    : "border-alabaster-grey hover:border-pale-slate"
                }
              `}
            >
              {/* --- ACCORDION HEADER --- */}
              <div
                onClick={() => toggleDropdown(supplier.id)}
                className="flex items-center justify-between p-5 cursor-pointer bg-white select-none"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar with Initials */}
                  <div
                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors shrink-0
                    ${
                      isOpen
                        ? "bg-gunmetal text-white"
                        : "bg-platinum text-slate-grey"
                    }
                  `}
                  >
                    {supplier.name?.charAt(0)}
                  </div>

                  {/* Supplier Info */}
                  <div>
                    <h3 className="text-gunmetal font-semibold text-base md:text-lg leading-tight">
                      {supplier.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-pale-slate-2">
                        ID: #{supplier.id}
                      </span>
                      {/* Product Count Badge */}
                      <span className="text-xs font-medium bg-bright-snow text-slate-grey px-2 py-0.5 rounded-full border border-alabaster-grey flex items-center gap-1">
                        <Package size={10} />
                        {supplierProducts.length} Products
                      </span>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div
                  className={`text-slate-grey transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown />
                </div>
              </div>

              {/* --- ACCORDION BODY (Product List) --- */}
              {isOpen && (
                <div className="bg-bright-snow border-t border-alabaster-grey p-5 md:p-6 animate-in fade-in slide-in-from-top-1">
                  {supplierProducts.length > 0 ? (
                    <>
                      <h4 className="text-xs font-bold text-slate-grey uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Tag size={14} /> Product Catalog
                      </h4>

                      {/* --- PRODUCT GRID --- 
                            Responsive: 1 col mobile, 2 col tablet, 3 col desktop
                        */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {supplierProducts.map((product: Product) => (
                          <Link
                            href={`/product/${product.id}`}
                            key={product.id}
                            className="bg-white border border-alabaster-grey rounded-lg p-3 hover:border-pale-slate transition-colors flex flex-col justify-between group cursor-pointer"
                          >
                            <div className="mb-2">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-mono text-slate-grey bg-platinum px-1.5 py-0.5 rounded">
                                  {product.short_name}
                                </span>
                                <span className="text-[10px] text-pale-slate-2">
                                  #{product.id}
                                </span>
                              </div>
                              <p
                                className="text-lg font-medium text-iron-grey group-hover:text-gunmetal truncate"
                                title={product.name as string}
                              >
                                {product.name}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    // Empty State if no products match
                    <div className="text-center py-8 text-pale-slate-2 flex flex-col items-center">
                      <AlertCircle size={24} className="mb-2 opacity-50" />
                      <p className="text-sm">
                        No products found for this supplier.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
