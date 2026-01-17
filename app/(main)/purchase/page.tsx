"use client";
import Loader from "@/app/components/Loader";
import SimpleSelect from "@/app/components/SelectDropdown";
import { useToast } from "@/app/context/ToastContext";
import { useProducts, useProductVariants } from "@/app/utils/hooks/useProducts";
import { usePurchaseStock } from "@/app/utils/hooks/useStock";
import { useSuppliers } from "@/app/utils/hooks/useSuppliers";
import { Database } from "@/types/supabase";
import { DollarSign } from "lucide-react";
import { useState } from "react";

type Product = Database["public"]["Tables"]["Products"]["Row"];
// type ProductStock = Database["public"]["Tables"]["Product_Stock"]["Row"];
// type StockBatch = Database["public"]["Tables"]["Stock_Batches"]["Row"];

export default function Purchase() {
  const { addToast } = useToast();
  // supplier
  const { data: suppliers, isLoading: isSupplierLoading } = useSuppliers();
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(
    null,
  );

  // product
  const { data: products } = useProducts();
  const supplierProducts = products?.filter(
    (p: Product) => p.supplier_id === selectedSupplierId,
  );
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null,
  );

  // sizes and all
  const { data: productVariants } = useProductVariants(
    selectedProductId as number,
  );

  const { mutate: purchaseStock, isPending } = usePurchaseStock();

  const [inputValues, setInputValues] = useState<
    Record<number, { quantity: number; batch_code: string }>
  >({});

  const handleInputChange = (
    variantId: number,
    field: "quantity" | "batch_code",
    value: number | string,
  ) => {
    setInputValues((prev) => ({
      ...prev,
      [variantId]: {
        ...prev[variantId],
        [field]: value,
      },
    }));
  };

  const handlePurchase = () => {
    // Array 1: For updating existing stock (Product_Stock table)
    const stockToUpdate: {
      id: number;
      product_id: number;
      quantity: number;
      size_id: number;
    }[] = [];

    // Array 2: For inserting history logs (Stock_Batches table)
    const batchesToInsert: {
      product_stock_id: number;
      batch_code: string;
      quantity: number;
    }[] = [];

    productVariants?.forEach((variant) => {
      // Get the input data for this specific variant row
      const inputs = inputValues[variant.id];

      // If user typed a quantity, process it
      if (inputs?.quantity && variant.quantity !== null) {
        const qty = inputs.quantity;
        const batch = inputs.batch_code || "";

        // Push to Stock Update Array
        stockToUpdate.push({
          id: variant.id, // This is the ID of the Product_Stock row
          product_id: selectedProductId as number,
          quantity: (variant.quantity || 0) + qty,
          size_id: variant.size_id as number,
        });

        // Push to Batch Insert Array
        batchesToInsert.push({
          product_stock_id: variant.id, // LINKING HERE: variant.id is the foreign key
          batch_code: batch,
          quantity: qty,
        });
      }
    });

    if (stockToUpdate.length === 0 || batchesToInsert.length === 0) {
      addToast("Incompelete Data!", "error");
      return;
    }

    // 2. Fire the Mutation
    purchaseStock(
      { stockToUpdate, batchesToInsert },
      {
        onSuccess: () => {
          addToast("Purchase Successful!", "success");
          // Clear your inputs here
          setInputValues({});
          setSelectedProductId(null);
          setSelectedSupplierId(null);
        },
        onError: (error) => {
          console.error("Purchase Failed:", error.message);
          addToast("Failed to save purchase. Check console.", "error");
        },
      },
    );
  };

  if (isPending || isSupplierLoading) return <Loader />;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gunmetal">Purchase</h1>
        <p className="text-slate-grey text-sm mt-1">Buy distillery units.</p>
      </div>

      <div className="mt-4 p-4 bg-bright-snow border border-alabaster-grey rounded-xl shadow-sm">
        <div className="flex-1 w-full space-y-4">
          {suppliers && (
            <SimpleSelect
              options={suppliers}
              displayKey="name"
              idKey="id"
              label="Supplier"
              placeholder="Select supplier"
              selectedId={selectedSupplierId}
              onSelect={(item) => setSelectedSupplierId(item.id)}
              onClear={() => {
                setSelectedSupplierId(null);
                setSelectedProductId(null);
              }}
            />
          )}
          {selectedSupplierId && supplierProducts && (
            <SimpleSelect
              options={supplierProducts}
              displayKey="name"
              idKey="id"
              label="Product"
              placeholder="Select product"
              selectedId={selectedProductId}
              onSelect={(item) => setSelectedProductId(item.id)}
              onClear={() => {
                setSelectedProductId(null);
              }}
            />
          )}
          {/* {selectedProductId && sizes && (
            <SimpleSelect
              options={sizes}
              displayKey="size_ml"
              idKey="id"
              label="Size"
              placeholder="Select size"
              selectedId={selectedSizeId}
              onSelect={(item) => setSelectedSizeId(item.id)}
              onClear={() => setSelectedSizeId(null)}
            />
          )} */}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        {productVariants?.map((variant) => {
          return (
            <div
              key={variant.id}
              className="
              group relative overflow-hidden transition-all duration-200
              bg-white border border-alabaster-grey rounded-xl shadow-sm
              hover:border-pale-slate hover:shadow-md
              flex flex-row items-center justify-between p-4 gap-4
              sm:block sm:p-0
            "
            >
              {/* --- Section 1: Info (Size & Stock) --- */}
              <div className="flex flex-col sm:bg-bright-snow sm:border-b sm:border-platinum sm:px-5 sm:py-4 sm:flex-row sm:justify-between sm:items-start">
                <div className="flex flex-col">
                  <span className="hidden sm:block text-[10px] font-bold text-slate-grey uppercase tracking-wider mb-1">
                    Size
                  </span>
                  <span className="text-lg sm:text-2xl font-bold text-gunmetal">
                    {variant.Bottle_Sizes?.size_ml}
                  </span>
                </div>
              </div>

              {/* --- Container for Quantity & Batch --- */}
              <div className="flex flex-row w-full items-start justify-end gap-2 sm:gap-0">
                {/* Input 1: Quantity */}
                <div className="w-24 sm:w-full sm:p-5">
                  <label className="hidden sm:block text-sm font-medium text-iron-grey mb-2">
                    Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={inputValues[variant.id]?.quantity || ""}
                      onChange={(e) => {
                        handleInputChange(
                          variant.id,
                          "quantity",
                          Number(e.target.value),
                        );
                      }}
                      className="
                      w-full rounded-lg text-center sm:text-left
                      bg-bright-snow border border-pale-slate
                      text-gunmetal font-bold
                      
                      /* Mobile Input Sizing */
                      py-2 text-base
                      
                      /* Desktop Input Sizing */
                      sm:px-4 sm:py-3 sm:text-lg
                      
                      placeholder:text-pale-slate-2
                      focus:outline-none focus:ring-2 focus:ring-gunmetal focus:bg-white focus:border-transparent
                      transition-all
                    "
                    />
                  </div>
                </div>

                {/* Input 2: Batch */}
                <div className="w-24 sm:w-full sm:p-5">
                  <label className="hidden sm:block text-sm font-medium text-iron-grey mb-2">
                    Batch
                  </label>
                  <div className="relative">
                    <input
                      type="numeric"
                      placeholder="Batch"
                      value={inputValues[variant.id]?.batch_code || ""}
                      onChange={(e) =>
                        handleInputChange(
                          variant.id,
                          "batch_code",
                          e.target.value.toUpperCase(),
                        )
                      }
                      className="
                      w-full rounded-lg text-center sm:text-left
                      bg-bright-snow border border-pale-slate
                      text-gunmetal font-bold
                      
                      /* Mobile Input Sizing */
                      py-2 text-base
                      
                      /* Desktop Input Sizing */
                      sm:px-4 sm:py-3 sm:text-lg
                      
                      placeholder:text-pale-slate-2
                      focus:outline-none focus:ring-2 focus:ring-gunmetal focus:bg-white focus:border-transparent
                      transition-all
                    "
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedProductId && (
        <div className="mt-10 pt-6 border-t border-alabaster-grey flex justify-end">
          <button
            onClick={handlePurchase}
            className="
            flex items-center gap-2 px-8 py-3.5 
            bg-gunmetal text-white rounded-lg 
            font-semibold shadow-lg hover:bg-shadow-grey hover:scale-[1.01] active:scale-[0.98] 
            transition-all duration-200 w-full md:w-auto justify-center
          "
          >
            <DollarSign size={20} />
            <span>Purchase</span>
          </button>
        </div>
      )}
    </div>
  );
}
