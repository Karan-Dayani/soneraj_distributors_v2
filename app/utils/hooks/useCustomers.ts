import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { supabase } from "@/app/utils/supabase/client";

type UseCustomersOptions = {
  page?: number; // Optional
  search?: string; // Optional
  pageSize?: number; // Optional
};

// --- 1. The READ Hook (Get Data) ---
export function useCustomers({
  page = 1,
  search = "",
  pageSize = 10,
}: UseCustomersOptions = {}) {
  return useQuery({
    queryKey: ["Customers", page, search],

    queryFn: async () => {
      console.log({
        search,
        page,
        pageSize,
      });
      const { data, error } = await supabase.rpc("search_customers", {
        p_search: search,
        p_page: page,
        p_page_size: pageSize,
      });

      if (error) throw error;

      // 🧠 Extract total count (comes from window function)
      const count = data?.[0]?.total_count ?? 0;
      return {
        data,
        count,
      };
    },

    placeholderData: keepPreviousData,
  });
}
// --- 2. The WRITE Hook (Create Data) ---
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCustomer: {
      name: string;
      address: string;
      license_no: string;
      route_no: string;
      user_id: string;
    }) => {
      const { data, error } = await supabase
        .from("Customers")
        .insert(newCustomer)
        .select();
      if (error) throw error;
      return data;
    },
    // When successful, tell the 'customers' query above to refresh!
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Customers"] });
    },
  });
}

// --- 3. The DELETE Hook ---
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("Customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Customers"] });
    },
  });
}

export function useEditCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateCustomer: {
      address: string | null;
      created_at: string;
      id: number;
      license_no: string | null;
      name: string | null;
      route_no: string | null;
      user_id: string | null;
    }) => {
      const { error } = await supabase
        .from("Customers")
        .update(updateCustomer)
        .eq("id", updateCustomer.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Customers"] });
    },
  });
}
