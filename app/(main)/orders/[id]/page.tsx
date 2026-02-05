"use client";
import Error from "@/app/components/Error";
import Loader from "@/app/components/Loader";
import {
  useCancelOrder,
  useCompeleteOrder,
  useOrderItems,
  useOrders,
  useRemoveCompletedOrder,
} from "@/app/utils/hooks/useOrders";
import { useParams, useRouter } from "next/navigation";
import OrderCard from "./OrderCard";
import { Check, RefreshCcw, X } from "lucide-react";
import CustomAlert from "@/app/components/CustomAlert";
import { useCallback, useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import CompletedOrderCard from "./CompletedOrderCard";

type CompeleteBatchType = {
  sales_order_item_id: number;
  stock_batch_id: number;
  quantity: number;
};

export default function OrderDetails() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { id } = params;
  const { data, error, isLoading } = useOrderItems({ id: Number(id) });
  const { data: orderData } = useOrders();
  const currOrder = orderData?.find((order) => order.id === Number(id));
  const isOrderCompletable = data?.every(
    (item) =>
      (item.Product_Stock?.quantity ?? 0) >= (item["quantity-ordered"] ?? 0),
  );

  const [cancelOrderAlert, setCancelOrderAlert] = useState<boolean>(false);
  const { mutate: cancelOrder } = useCancelOrder();
  const [compeleteData, setCompeleteData] = useState<CompeleteBatchType[]>([]);

  const orderedQty =
    data?.reduce((acc, item) => acc + (item?.["quantity-ordered"] ?? 0), 0) ??
    0;

  const availableQty =
    compeleteData
      ?.flat()
      .reduce((acc, item) => acc + (item?.quantity ?? 0), 0) ?? 0;

  const isOrderCompletable2 = orderedQty === availableQty;

  const addToCompelete = useCallback((newBatch: CompeleteBatchType) => {
    setCompeleteData((prev) => [...prev, newBatch]);
  }, []);

  const { mutate: compeleteOrder } = useCompeleteOrder();
  const [removeCompletedOrderAlert, setRemoveCompletedOrderAlert] =
    useState<boolean>(false);
  const { mutate: removeCompletedOrder } = useRemoveCompletedOrder();

  const handleSubmit = () => {
    compeleteOrder(
      {
        orderBatches: compeleteData.flat(),
        salesOrderId: currOrder?.id as number,
      },
      {
        onSuccess: () => {
          addToast("Order Completed Successful!", "success");
          router.replace("/orders");
        },
        onError: (error) => {
          console.error(error);
          addToast("Failed to complete order. Check console.", "error");
        },
      },
    );
  };

  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <Error error={error.message} />;
  }

  return (
    <>
      <div className="max-w-5xl mx-auto p-6 md:p-8">
        <div className="flex flex-col gap-8">
          <div className="">
            <h1 className="text-3xl font-bold text-gunmetal">
              {currOrder?.Customers.name}
            </h1>
            <p className="text-slate-grey text-sm mt-1">
              Order Status :{" "}
              <span className="font-bold uppercase">{currOrder?.status}</span>
            </p>
          </div>
          {data?.map((item) => {
            if (currOrder?.status === "pending") {
              return (
                <OrderCard key={item.id} item={item} add={addToCompelete} />
              );
            } else {
              return <CompletedOrderCard key={item.id} item={item} />;
            }
          })}
          {currOrder?.status === "pending" && (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => setCancelOrderAlert(true)}
                className="
                          group flex-1 w-full sm:w-auto min-w-[140px] py-3.5 px-4
                          bg-red-50 text-red-600 border border-red-100 rounded-xl
                          font-bold text-sm uppercase tracking-wide
                          hover:bg-red-100 hover:border-red-200 hover:text-red-700
                          active:scale-[0.98] transition-all duration-200
                          flex items-center justify-center gap-2 cursor-pointer
                        "
              >
                Cancel
                <X
                  size={20}
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </button>

              {/* 2. RESET BUTTON (Secondary - Outline) */}
              <button
                onClick={() => window.location.reload()}
                className="
                          group flex-1 w-full sm:w-auto min-w-[140px] py-3.5 px-4
                          bg-white text-slate-grey border-2 border-alabaster-grey rounded-xl
                          font-bold text-sm uppercase tracking-wide
                          hover:border-gunmetal hover:text-gunmetal hover:bg-white
                          active:scale-[0.98] transition-all duration-200
                          flex items-center justify-center gap-2 cursor-pointer
                        "
              >
                Reset
                <RefreshCcw
                  size={20}
                  className="group-hover:rotate-180 transition-transform duration-500 ease-out"
                />
              </button>

              {/* 3. COMPLETE BUTTON (Primary - Gunmetal) */}
              <button
                disabled={!isOrderCompletable || !isOrderCompletable2}
                onClick={handleSubmit}
                className="
                          group flex-1 w-full sm:w-auto min-w-40 py-3.5 px-4
                          bg-gunmetal text-white border-2 border-transparent rounded-xl
                          font-bold text-sm uppercase tracking-wide shadow-md
                          hover:bg-shadow-grey hover:shadow-lg
                          active:scale-[0.98] transition-all duration-200
                          disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                          flex items-center justify-center gap-2 cursor-pointer
                        "
              >
                <Check
                  size={20}
                  strokeWidth={3}
                  className="group-hover:scale-110 transition-transform"
                />
                Complete
              </button>
            </div>
          )}
          {currOrder?.status === "completed" && (
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => {
                  setRemoveCompletedOrderAlert(true);
                }}
                className="
                          group flex-1 w-full sm:w-auto min-w-[140px] py-3.5 px-4
                          bg-red-50 text-red-600 border border-red-100 rounded-xl
                          font-bold text-sm uppercase tracking-wide
                          hover:bg-red-100 hover:border-red-200 hover:text-red-700
                          active:scale-[0.98] transition-all duration-200
                          flex items-center justify-center gap-2 cursor-pointer
                        "
              >
                Remove
                <X
                  size={20}
                  className="opacity-70 group-hover:opacity-100 transition-opacity"
                />
              </button>
            </div>
          )}
        </div>
      </div>
      <CustomAlert
        isOpen={cancelOrderAlert}
        onClose={() => setCancelOrderAlert(false)}
        onConfirm={() => {
          cancelOrder(
            {
              orderItemsIds: data?.map((item) => item.id) as number[],
              orderId: currOrder?.id as number,
            },
            {
              onSuccess: () => {
                addToast("Order Canceled Successful!", "success");
                router.replace("/orders");
              },
              onError: (error) => {
                console.error(error);
                addToast("Failed to cancel order. Check console.", "error");
              },
            },
          );
          setCancelOrderAlert(false);
        }}
        title="Cancel Order"
        message={`Do you want to cancel order from ${currOrder?.Customers.name} ?`}
        type="warning"
      />
      <CustomAlert
        isOpen={removeCompletedOrderAlert}
        onClose={() => setRemoveCompletedOrderAlert(false)}
        onConfirm={() => {
          removeCompletedOrder(
            {
              orderId: Number(id),
            },
            {
              onSuccess: () => {
                addToast("Order Removed Successful!", "success");
                router.replace("/orders");
              },
              onError: (error) => {
                console.error(error);
                addToast("Failed to remove order. Check console.", "error");
              },
            },
          );
          setCancelOrderAlert(false);
        }}
        title="Remove Order"
        message={`Do you want to cancel order from ${currOrder?.Customers.name} from history ?`}
        type="warning"
      />
    </>
  );
}
