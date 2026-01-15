import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useProducts({ search = "" }: { search?: string } = {}) {
  return useQuery({
    queryKey: ["products", search],

    queryFn: async () => {
      let query = supabase.from("Products").select("*");

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useProductVariants(productId: number) {
  return useQuery({
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
          ),
          Products (   
            name      
          ),
          Stock_Batches (*)
        `
        )
        .eq("product_id", productId);

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
}
