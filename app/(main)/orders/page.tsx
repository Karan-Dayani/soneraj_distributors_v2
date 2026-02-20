"use client";
import CustomModal from "@/app/components/CustomModal";
import Error from "@/app/components/Error";
import Loader from "@/app/components/Loader";
import { createDispatchPDF } from "@/app/components/PDFs/DispatchPDF";
import { useDispatch, useOrders } from "@/app/utils/hooks/useOrders";
import {
  ArrowDownToLine,
  CheckCircle2,
  Circle,
  ListFilter,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function Orders() {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "completed">(
    "pending",
  );
  const {
    data: orders,
    error,
    isLoading,
  } = useOrders({ status: selectedStatus });

  const { data: DATA, error: dispatchError } = useDispatch({
    ids: selectedOrders,
  });
  const safeRows = DATA ?? [];

  const [dispatchModal, setDispatchModal] = useState<boolean>(false);
  const [dispatchInfo, setDispatchInfo] = useState<{
    title: string;
    name: string;
  }>({ title: "", name: "" });

  // 👇 1. CHANGED: Store the 'committed' filters here when user clicks Apply
  const initialFilterData = {
    address: "",
    route_no: "",
    username: "",
  };

  // Stores the temporary inputs in the modal
  const [filterFormData, setFilterFormData] = useState(initialFilterData);

  // Stores the actual active filters used for the list
  const [appliedFilters, setAppliedFilters] = useState(initialFilterData);

  const [filterModal, setFilterModal] = useState<boolean>(false);

  // 👇 2. CHANGED: Derived State (No useEffect needed)
  // This automatically recalculates whenever 'orders' or 'appliedFilters' changes.
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((o) => {
      // Address Filter
      if (appliedFilters.address) {
        if (
          !o.Customers?.address
            ?.toLowerCase()
            .includes(appliedFilters.address.toLowerCase())
        ) {
          return false;
        }
      }

      // Route No Filter
      if (appliedFilters.route_no) {
        // Safe check for route_no (adjust path if needed)
        const route = String(o.Customers?.route_no || "").toLowerCase();
        if (!route.includes(appliedFilters.route_no.toLowerCase())) {
          return false;
        }
      }

      // Username Filter
      if (appliedFilters.username) {
        if (
          !o.Customers?.profiles?.username
            ?.toLowerCase()
            .includes(appliedFilters.username.toLowerCase())
        ) {
          return false;
        }
      }

      return true; // Keep order if all checks pass
    });
  }, [orders, appliedFilters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 👇 3. CHANGED: Just commit the form data to the applied state
  const applyFilters = () => {
    setAppliedFilters(filterFormData);
    setFilterModal(false);
  };

  const clearFilters = () => {
    setFilterFormData(initialFilterData);
    setAppliedFilters(initialFilterData);
  };

  const toggleOrders = (item: number) => {
    setSelectedOrders((prevItems) =>
      prevItems.includes(item)
        ? prevItems.filter((i) => i !== item)
        : [...prevItems, item],
    );
  };

  const handleDownload = async (info: { title: string; name: string }) => {
    // if (!dispatchRef.current) return;
    // await exportDispatchPdf(
    //   dispatchRef.current,
    //   `dispatch-${selectedOrders.join("-")}.pdf`,
    // );
    createDispatchPDF(safeRows, info);
  };

  return (
    <>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="order-1 text-3xl font-bold text-gunmetal text-left">
            Orders
          </h1>

          <div className="order-3 w-full md:w-auto md:order-2 flex justify-center">
            <div className="p-1 flex bg-white rounded-xl border border-alabaster-grey">
              <div
                onClick={() => {
                  setSelectedStatus("pending");
                  setSelectedOrders([]);
                }}
                className={`w-32 text-center p-2 rounded-l-lg cursor-pointer ${
                  selectedStatus === "pending" && "bg-platinum"
                } transition-all duration-500`}
              >
                Pending
              </div>
              <div className="w-px bg-alabaster-grey" />
              <div
                onClick={() => {
                  setSelectedStatus("completed");
                  setSelectedOrders([]);
                }}
                className={`w-32 text-center p-2 rounded-r-lg cursor-pointer ${
                  selectedStatus === "completed" && "bg-platinum"
                } transition-all duration-500`}
              >
                Completed
              </div>
            </div>
          </div>

          <div className="order-2 md:order-3 flex gap-2 items-center">
            <div>
              <button
                onClick={() => setFilterModal(true)}
                className="p-3 bg-white hover:bg-bright-snow rounded-xl border border-alabaster-grey cursor-pointer transition-colors"
              >
                <ListFilter className="" />
              </button>
            </div>
            <div>
              <button
                disabled={selectedOrders.length < 1}
                onClick={() => setDispatchModal(true)}
                className="p-3 bg-white hover:bg-bright-snow rounded-xl border border-alabaster-grey cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ArrowDownToLine className="" />
              </button>
            </div>
          </div>
        </div>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Error error={error.message} />
        ) : !filteredOrders?.length ? (
          !orders?.length ? (
            <Error error="No orders found." />
          ) : (
            <Error error="No matches found." />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {filteredOrders.map((order) => {
              const isSelected = selectedOrders.includes(order.id);

              return (
                <Link
                  key={order.id}
                  href={
                    selectedOrders.length >= 1 ? "#" : `/orders/${order.id}`
                  }
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
        )}
      </div>
      <CustomModal
        isOpen={filterModal}
        onClose={() => {
          setFilterModal(false);
        }}
        title="Filter orders."
      >
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <label className="text-sm font-bold uppercase tracking-widest text-slate-grey ml-1">
              Address
              <div className="mt-2">
                <input
                  type="text"
                  name="address"
                  value={filterFormData.address || ""}
                  onChange={handleFilterChange}
                  placeholder="Filter by Address"
                  className="w-full px-4 py-4 border-2 rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                />
              </div>
            </label>
          </div>
          <div className="w-full">
            <label className="text-sm font-bold uppercase tracking-widest text-slate-grey ml-1">
              Route No.
              <div className="mt-2">
                <input
                  type="text"
                  name="route_no"
                  value={filterFormData.route_no || ""}
                  onChange={handleFilterChange}
                  placeholder="Filter by Route No"
                  className="w-full px-4 py-4 border-2 rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                />
              </div>
            </label>
          </div>
          <div className="w-full">
            <label className="text-sm font-bold uppercase tracking-widest text-slate-grey ml-1">
              Username
              <div className="mt-2">
                <input
                  type="text"
                  name="username"
                  value={filterFormData.username || ""}
                  onChange={handleFilterChange}
                  placeholder="Filter by Username"
                  className="w-full px-4 py-4 border-2 rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                />
              </div>
            </label>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={clearFilters}
              className="basis-1/2 py-3 cursor-pointer bg-platinum rounded hover:opacity-90 transition"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="basis-1/2 py-3 cursor-pointer bg-gunmetal text-white rounded hover:opacity-90 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </CustomModal>
      <CustomModal
        isOpen={dispatchModal}
        onClose={() => {
          setDispatchModal(false);
          setDispatchInfo({ title: "", name: "" });
        }}
        title="Dispatch PDF Info"
      >
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <label className="text-sm font-bold uppercase tracking-widest text-slate-grey ml-1">
              Title
              <div className="mt-2">
                <input
                  type="text"
                  name="title"
                  value={dispatchInfo.title || ""}
                  onChange={(e) =>
                    setDispatchInfo((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Title for the PDF"
                  className="w-full px-4 py-4 border-2 rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                />
              </div>
            </label>
          </div>
          <div className="w-full">
            <label className="text-sm font-bold uppercase tracking-widest text-slate-grey ml-1">
              Name
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  value={dispatchInfo.name || ""}
                  onChange={(e) =>
                    setDispatchInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Name of the PDF"
                  className="w-full px-4 py-4 border-2 rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                />
              </div>
            </label>
          </div>
          <button
            onClick={() => {
              handleDownload(dispatchInfo);
              setDispatchModal(false);
              setDispatchInfo({ title: "", name: "" });
            }}
            className="basis-1/2 py-3 cursor-pointer bg-gunmetal text-white rounded-xl"
          >
            Download
          </button>
        </div>
      </CustomModal>
    </>
  );
}
