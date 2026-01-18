import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

type useOrderOption = {
  status?: "pending" | "completed";
};

export function useOrders({ status = "pending" }: useOrderOption = {}) {
  return useQuery({
    queryKey: ["orders", status],
    queryFn: async () => {
      const query = supabase
        .from("Sales_Orders")
        .select(
          `
          id,
          status,
          Customers!inner (
            *,
            profiles!inner (*)
          )
          `,
        )
        .eq("status", status);

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
        .select()
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
