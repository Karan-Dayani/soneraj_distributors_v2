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
  Sales_Order: { customerid: number; status: "pending" | "completed" };
  Sales_Order_Items: {
    productStockid: number;
    qty: number;
  }[];
};
export function useAddOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ Sales_Order, Sales_Order_Items }: AddOrderType) => {
      const { data: orderId, error } = await supabase.rpc("add_sales_order", {
        p_customer_id: Sales_Order.customerid,
        p_status: Sales_Order.status,
        p_items: Sales_Order_Items.map((item) => ({
          product_stock_id: item.productStockid,
          quantity: item.qty,
        })),
      });

      if (error) throw error;
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
      const { error } = await supabase.rpc("cancel_sales_order", {
        p_order_id: orderId,
        p_order_item_ids: orderItemsIds,
      });

      if (error) throw error;
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
