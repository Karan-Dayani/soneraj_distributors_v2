import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase/client";

export function useOrders({
  status,
  address,
  route_no,
  license_no,
  username,
  month,
  page = 1,
  limit = 20,
}: {
  status?: "pending" | "completed";
  address?: string;
  route_no?: string;
  license_no?: string;
  username?: string;
  month?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: [
      "orders",
      status,
      address,
      route_no,
      license_no,
      username,
      month,
      page,
      limit,
    ],
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
        { count: "exact" },
      );

      // ✅ Status filter
      if (status) {
        query = query.eq("status", status);
      }

      // ✅ Address filter
      if (address) {
        query = query.ilike("Customers.address", `%${address}%`);
      }

      // ✅ Route No filter
      if (route_no) {
        query = query.ilike("Customers.route_no", `%${route_no}%`);
      }

      // ✅ License No filter
      if (license_no) {
        query = query.ilike("Customers.license_no", `%${license_no}%`);
      }

      // ✅ Username filter (nested)
      if (username) {
        query = query.ilike("Customers.profiles.username", `%${username}%`);
      }

      // ✅ Month filter
      if (month) {
        const start = `${month}-01`;
        const endDate = new Date(start);
        endDate.setMonth(endDate.getMonth() + 1);

        const end = endDate.toISOString();

        // if (status === "completed") {
        //   query = query.gte("completed_at", start).lt("completed_at", end);
        // } else {
        query = query.gte("created_at", start).lt("created_at", end);
        // }
      }

      // ✅ pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      query = query.order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;
      return {
        data: data || [],
        count: count ?? 0,
      };
    },
  });
}

// if (status === "completed") {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const tomorrow = new Date(today);
//   tomorrow.setDate(tomorrow.getDate() + 1);

//   query = query
//     .gte("completed_at", today.toISOString())
//     .lt("completed_at", tomorrow.toISOString());
// }
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

export function useDispatch({ ids }: { ids: number[] }) {
  return useQuery({
    queryKey: ["dispatch", ids],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_dispatch_pdf_rows", {
        p_order_ids: ids,
      });
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
      queryClient.invalidateQueries({ queryKey: ["shortage"] });
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
      queryClient.invalidateQueries({ queryKey: ["shortage"] });
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
      const { error } = await supabase.rpc("process_order_batches", {
        p_sales_order_id: salesOrderId,
        p_items: orderBatches,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
      queryClient.invalidateQueries({
        queryKey: ["stock"],
      });
      queryClient.invalidateQueries({
        queryKey: ["stock-batches"],
      });
      queryClient.invalidateQueries({
        queryKey: ["shortage"],
      });
    },
  });
}

export function useRemoveCompletedOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId }: { orderId: number }) => {
      const { error } = await supabase.rpc("delete_completed_order", {
        p_order_id: orderId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });
}
