import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],

    queryFn: async () => {
      const { data, error } = await supabase.from("Suppliers").select("*");

      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
