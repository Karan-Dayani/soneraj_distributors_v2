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
        `
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

export function usePurchaseStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stockToUpdate,
      batchesToInsert,
    }: PurchaseVariables) => {
      // 1. UPDATE EXISTING STOCK (Bulk Upsert)
      // We use upsert because it can handle an array of updates in one network request.
      const { error: stockError } = await supabase
        .from("Product_Stock")
        .upsert(stockToUpdate);
      // .upsert works because you provided the 'id' (Primary Key)

      if (stockError) throw stockError;

      // 2. INSERT BATCH HISTORY
      const { error: batchError } = await supabase
        .from("Stock_Batches")
        .insert(batchesToInsert);

      if (batchError) throw batchError;

      return true;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
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
      const { error: updateError } = await supabase
        .from("Product_Stock")
        .upsert(stockToUpdate);

      if (updateError) throw updateError;

      const { error: deleteError } = await supabase
        .from("Stock_Batches")
        .delete()
        .eq("id", batchIdToDelete);

      if (deleteError) throw deleteError;

      return true;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
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
      const { error: stockError } = await supabase
        .from("Product_Stock")
        .update({ quantity: newTotalStockQty })
        .eq("id", stockId);

      if (stockError) throw stockError;

      const { error: batchError } = await supabase
        .from("Stock_Batches")
        .update({
          batch_code: newBatchCode,
          quantity: newBatchQty,
        })
        .eq("id", batchId);

      if (batchError) throw batchError;

      return true;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
  });
}
