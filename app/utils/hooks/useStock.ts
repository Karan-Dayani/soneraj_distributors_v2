import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/app/utils/supabase/client";

// Define the types based on your snippet
type StockUpdatePayload = {
  id: number;
  product_id: number;
  quantity: number; // This is the NEW total (old + added)
  size_id: number;
};

type BatchInsertPayload = {
  product_stock_id: number;
  batch_code: string;
  quantity: number; // This is just the added amount
};

type PurchaseVariables = {
  stockToUpdate: StockUpdatePayload[];
  batchesToInsert: BatchInsertPayload[];
};

export function useStock() {
  return useQuery({
    queryKey: ["stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Product_Stock")
        .select(
          `
          id,
          quantity,
          Products ( name, short_name ),
          Bottle_Sizes ( name, size_ml ),
          Stock_Batches (
            id,
            batch_code,
            quantity,
            created_at
          )
        `,
        )
        .neq("quantity", 0)
        // Order batches by newest first
        .order("created_at", {
          foreignTable: "Stock_Batches",
          ascending: false,
        })
        .order("quantity", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useStockBatches({ stockId }: { stockId?: number }) {
  return useQuery({
    queryKey: ["stock-batches", stockId],
    queryFn: async () => {
      let query = supabase.from("Stock_Batches").select("*");

      if (stockId) {
        query = query.eq("product_stock_id", stockId);
      }
      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useShortage() {
  return useQuery({
    queryKey: ["shortage"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_stock_shortage");
      if (error) throw error;
      return data;
    },
  });
}

export function usePurchaseStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stockToUpdate,
      batchesToInsert,
    }: PurchaseVariables) => {
      const { error } = await supabase.rpc("purchase_stock", {
        p_stock_updates: stockToUpdate,
        p_batches: batchesToInsert,
      });

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["stock-batches"] });
      queryClient.invalidateQueries({ queryKey: ["shortage"] });
    },
  });
}

type DeleteBatchVariables = {
  stockToUpdate: { id: number; quantity: number };
  batchIdToDelete: number;
};

export function useRemoveStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      stockToUpdate,
      batchIdToDelete,
    }: DeleteBatchVariables) => {
      const { error } = await supabase.rpc("delete_stock_batch", {
        p_stock_update: stockToUpdate,
        p_batch_id: batchIdToDelete,
      });

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["stock-batches"] });
      queryClient.invalidateQueries({ queryKey: ["shortage"] });
    },
  });
}

type UpdateBatchVariables = {
  stockId: number;
  batchId: number;
  newBatchCode: string;
  newBatchQty: number;
  newTotalStockQty: number;
};

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stockId,
      batchId,
      newBatchCode,
      newBatchQty,
      newTotalStockQty,
    }: UpdateBatchVariables) => {
      const { error } = await supabase.rpc("update_stock_batch", {
        p_stock_id: stockId,
        p_batch_id: batchId,
        p_new_batch_code: newBatchCode,
        p_new_batch_qty: newBatchQty,
        p_new_total_stock_qty: newTotalStockQty,
      });

      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["stock-batches"] });
      queryClient.invalidateQueries({ queryKey: ["shortage"] });
    },
  });
}
