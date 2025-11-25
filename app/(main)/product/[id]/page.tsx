"use client";

import { useProductVariants } from "@/app/utils/hooks/useProductVarients";
import { useParams } from "next/navigation";
import { Plus, Warehouse } from "lucide-react";
import { Database } from "@/types/supabase";

// We only want specific columns, not the whole Row
type ProductVariant = Pick<
  Database["public"]["Tables"]["Product_Stock"]["Row"],
  "id" | "quantity" | "size_id"
> & {
  // We also need to define exactly what comes back from the join
  Bottle_Sizes: Pick<
    Database["public"]["Tables"]["Bottle_Sizes"]["Row"],
    "id" | "size_ml" | "weight_kg"
  > | null;
};
export default function Product() {
  const params = useParams();
  const { id } = params;
  const {
    data: productVariants,
    isLoading,
    error,
  } = useProductVariants(Number(id));

  if (isLoading)
    return <div className="p-10 text-slate-grey">Loading product...</div>;
  if (error) return <div className="p-10 text-red-500">{error.message}</div>;

  return (
    <div className="h-full bg-bright-snow pb-20">
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productVariants?.map((variant: ProductVariant) => (
            <div
              key={variant.id}
              className="bg-white rounded-xl border border-alabaster-grey shadow-sm overflow-hidden hover:border-pale-slate hover:shadow-md transition-all duration-200 group"
            >
              {/* Card Header: Size & Weight */}
              <div className="px-5 py-4 bg-bright-snow border-b border-platinum flex justify-between items-start">
                <div>
                  <span className="block text-[10px] font-bold text-slate-grey uppercase tracking-wider mb-1">
                    Size
                  </span>
                  <span className="text-2xl font-bold text-gunmetal">
                    {variant.Bottle_Sizes?.size_ml}
                  </span>
                </div>

                {/* Weight Tag */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-alabaster-grey rounded text-xs font-medium text-pale-slate-2">
                  <Warehouse size={12} />
                  {variant.quantity}
                </div>
              </div>

              {/* Card Body: Input */}
              <div className="p-5">
                <label className="block text-sm font-medium text-iron-grey mb-2">
                  Quantity
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    className="
                      w-full px-4 py-3 rounded-lg
                      bg-bright-snow border border-pale-slate
                      text-gunmetal font-bold text-lg
                      placeholder:text-pale-slate-2
                      focus:outline-none focus:ring-2 focus:ring-gunmetal focus:bg-white
                      transition-all
                    "
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-alabaster-grey flex justify-end">
          <button
            className="
            flex items-center gap-2 px-8 py-3.5 
            bg-gunmetal text-white rounded-lg 
            font-semibold shadow-lg hover:bg-shadow-grey hover:scale-[1.01] active:scale-[0.98] 
            transition-all duration-200 w-full md:w-auto justify-center
          "
          >
            <Plus size={20} />
            <span>Add to cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
