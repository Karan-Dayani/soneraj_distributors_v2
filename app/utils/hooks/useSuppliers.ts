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

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select();

      if (error) throw error;
      return data;
    },
  });
}
