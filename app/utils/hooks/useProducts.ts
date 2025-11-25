import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],

    queryFn: async () => {
      const { data, error } = await supabase.from("Products").select("*");

      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
