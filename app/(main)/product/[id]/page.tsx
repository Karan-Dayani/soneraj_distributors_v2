// app/product/[id]/page.tsx
"use client";

import { useProductVariants } from "@/app/utils/hooks/useProductVarients";
import { redirect, useParams } from "next/navigation";
import { BottleWine, Plus, Warehouse } from "lucide-react";
import { Database } from "@/types/supabase";
import { useCart, CartVariant } from "@/app/context/CartContext";
import { useState } from "react";
import Loader from "@/app/components/Loader";
import Error from "@/app/components/Error";

type ProductVariant = Pick<
  Database["public"]["Tables"]["Product_Stock"]["Row"],
  "id" | "quantity" | "size_id"
> & {
  Bottle_Sizes: Pick<
    Database["public"]["Tables"]["Bottle_Sizes"]["Row"],
    "id" | "size_ml" | "weight_kg"
  > | null;
  Products: Pick<
    Database["public"]["Tables"]["Products"]["Row"],
    "name"
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
  const { cart, updateProductInCart } = useCart();

  // 2. Local State
  const [localQuantities, setLocalQuantities] = useState<
    Record<number, string>
  >({});

  // 3. Helper to determine what to show in the box
  const getInputValue = (variantId: number) => {
    // 1. Local typing
    if (localQuantities[variantId] !== undefined) {
      return localQuantities[variantId];
    }
    // 2. Global Cart (Nested Lookup)
    // Check if Product exists -> Check if Variant exists
    const productInCart = cart[Number(id)];
    if (productInCart && productInCart.variants[variantId]) {
      return String(productInCart.variants[variantId].quantity);
    }
    return "";
  };

  const handleSaveToCart = () => {
    const variantsToUpdate: CartVariant[] = [];
    let productName = "Unknown Product";

    productVariants?.forEach((variant: ProductVariant) => {
      // Capture name from first available variant
      if (variant.Products?.name) productName = variant.Products.name;

      const val = getInputValue(variant.id);
      const qty = Number(val);

      // We send ALL values (even 0s) so the context knows to remove them if user cleared the box
      if (qty >= 0) {
        variantsToUpdate.push({
          stockId: variant.id,
          sizeName: variant.Bottle_Sizes?.size_ml as string,
          quantity: qty,
          maxStock: variant.quantity || 0,
          price: 0,
        });
      }
    });

    if (variantsToUpdate.length > 0) {
      updateProductInCart(Number(id), productName, variantsToUpdate);
      redirect("/");
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Error error={error.message} />;
  if (!productVariants || productVariants.length === 0) {
    return <Error error="No Product found." />;
  }

  return (
    <div className="h-full bg-bright-snow pb-20">
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        <div className="mb-8 flex items-center gap-3 p-4 bg-white border border-platinum rounded-lg shadow-sm">
          <div className="p-2 bg-platinum rounded-full text-gunmetal">
            <BottleWine size={20} />
          </div>
          <span className="text-xl font-semibold text-iron-grey">
            {productVariants[0]?.Products?.name}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {productVariants?.map((variant: ProductVariant) => {
            const currentValue = getInputValue(variant.id);
            return (
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
                      value={currentValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        console.log(`Typing ID ${variant.id}:`, val); // <--- DEBUG LOG

                        setLocalQuantities((prev) => ({
                          ...prev,
                          [variant.id]: val,
                        }));
                      }}
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
            );
          })}
        </div>

        <div className="mt-10 pt-6 border-t border-alabaster-grey flex justify-end">
          <button
            onClick={handleSaveToCart}
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
