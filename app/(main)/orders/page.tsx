"use client";
import Error from "@/app/components/Error";
import Loader from "@/app/components/Loader";
import { useOrders } from "@/app/utils/hooks/useOrders";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Orders() {
  const { data: orders, error, isLoading } = useOrders();
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

  const toggleOrders = (item: number) => {
    setSelectedOrders((prevItems) =>
      prevItems.includes(item)
        ? prevItems.filter((i) => i !== item)
        : [...prevItems, item],
    );
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Error error={error?.message as string} />;
  }

  if (orders && orders?.length < 1) {
    return <Error error="No order." />;
  }

  return (
    <>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gunmetal">Orders</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {orders?.map((order) => {
            const isSelected = selectedOrders.includes(order.id);

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className={`
                            group relative flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-200
                            bg-white h-full shadow-sm
                            ${
                              isSelected
                                ? "border border-gunmetal bg-gunmetal/5"
                                : "border border-alabaster-grey"
                            }
                          `}
              >
                {/* Left: Content */}
                <div className="flex flex-col gap-1 overflow-hidden">
                  <h2
                    className={`text-base font-semibold truncate transition-colors ${
                      isSelected
                        ? "text-gunmetal"
                        : "text-iron-grey group-hover:text-gunmetal"
                    }`}
                  >
                    {order.Customers?.name || "Unknown Customer"}{" "}
                    {order.Customers?.address} ({order.Customers?.license_no})
                  </h2>

                  <div className="flex items-center text-xs text-slate-grey">
                    <span className="font-medium text-iron-grey truncate">
                      {order.Customers?.profiles?.username}
                    </span>
                  </div>
                </div>

                {/* Right: Selection Action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleOrders(order.id);
                  }}
                  className="pl-4 focus:outline-none group/checkbox shrink-0 cursor-pointer"
                >
                  {isSelected ? (
                    <CheckCircle2
                      size={22}
                      className="text-gunmetal fill-bright-snow transition-transform duration-200 scale-110"
                    />
                  ) : (
                    <Circle
                      size={22}
                      className="text-pale-slate/60 group-hover/checkbox:text-gunmetal transition-colors duration-200"
                    />
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
