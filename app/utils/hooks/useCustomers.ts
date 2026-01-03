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
    // 1. Add page to the key. When 'page' changes, the query refetches automatically.
    queryKey: ["Customers", page, search],

    queryFn: async () => {
      // Calculate the range for Supabase (0-based index)
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("Customers")
        .select("*", { count: "exact" }) // Ask for total count
        .range(from, to) // Limit the rows
        .order("created_at", { ascending: false }); // Always order paginated data!

      // 2. Only apply filter if we have a search term
      if (search) {
        // ilike is "Case Insensitive Like"
        // %search% means "contains search"
        query = query.ilike("name", `%${search}%`);
      }

      const { data, count, error } = await query;

      if (error) throw error;

      // Return both the list and the total count
      return { data, count };
    },

    // 2. This is Magic: It keeps showing old data while fetching the new page.
    // No more "Loading..." flickering!
    placeholderData: keepPreviousData,
  });
}

// --- 2. The WRITE Hook (Create Data) ---
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCustomer: { name: string }) => {
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
