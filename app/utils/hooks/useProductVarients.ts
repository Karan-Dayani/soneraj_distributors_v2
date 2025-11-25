import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useProductVariants(productId: number) {
  return useQuery({
    // Key changed to match the new name
    queryKey: ["product_variants", productId],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("Product_Stock")
        .select(
          `
          id,
          quantity, 
          size_id,
          Bottle_Sizes (
            id,
            size_ml,      
            weight_kg
          )
        `
        )
        .eq("product_id", productId); // Filter for ONE product

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}
