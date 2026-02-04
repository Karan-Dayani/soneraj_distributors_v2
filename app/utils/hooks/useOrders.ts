import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

type useOrderOption = {
  status?: "pending" | "completed";
};

export function useOrders({ status }: useOrderOption = {}) {
  return useQuery({
    queryKey: ["orders", status],
    queryFn: async () => {
      let query = supabase.from("Sales_Orders").select(
        `
          id,
          status,
          Customers!inner (
            *,
            profiles!inner (*)
          )
          `,
      );
      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
}

export function useOrderItems({ id }: { id: number }) {
  return useQuery({
    queryKey: ["items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Sales_Order_Items")
        .select(
          `*,Product_Stock (*, Products(*), Bottle_Sizes(*)), Order_Item_Batches(*, Stock_Batches(*))`,
        )
        .eq("sales_order_id", id);

      if (error) throw error;
      return data;
    },
  });
}

export type AddOrderType = {
  Sales_Order: { customerid: number; status: string };
  Sales_Order_Items: {
    productStockid: number;
    qty: number;
  }[];
};
export function useAddOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ Sales_Order, Sales_Order_Items }: AddOrderType) => {
      const { data: salesOrderData, error: salesOrderError } = await supabase
        .from("Sales_Orders")
        .insert([
          {
            customer_id: Sales_Order.customerid,
            status: Sales_Order.status as "pending" | "completed",
          },
        ])
        .select()
        .single();

      if (salesOrderError) throw salesOrderError;
      if (!salesOrderData) throw new Error("Failed to create order");

      const itemsToInsert = Sales_Order_Items.map((item) => ({
        sales_order_id: salesOrderData.id,
        product_stock_id: item.productStockid,
        "quantity-ordered": item.qty,
      }));

      const { error: itemsError } = await supabase
        .from("Sales_Order_Items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

type cancelOrderType = {
  orderItemsIds: number[];
  orderId: number;
};

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderItemsIds, orderId }: cancelOrderType) => {
      const { error: orderItemsError } = await supabase
        .from("Sales_Order_Items")
        .delete()
        .in("id", orderItemsIds);

      if (orderItemsError) throw orderItemsError;

      const { error: orderError } = await supabase
        .from("Sales_Orders")
        .delete()
        .eq("id", orderId);

      if (orderError) throw orderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

type compeleteOrderType = {
  sales_order_item_id: number;
  stock_batch_id: number;
  quantity: number;
}[];

export function useCompeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderBatches,
      salesOrderId,
    }: {
      orderBatches: compeleteOrderType;
      salesOrderId: number;
    }) => {
      console.log(orderBatches);
      const { error } = await supabase.rpc("process_order_batches", {
        p_sales_order_id: salesOrderId,
        p_items: orderBatches,
      });

      if (error) {
        console.error("Order processing failed:", error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders", "stock", "stock-batches"],
      });
    },
  });
}
