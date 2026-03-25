"use client";
import CustomModal from "@/app/components/CustomModal";
import Error from "@/app/components/Error";
import Loader from "@/app/components/Loader";
import { createDispatchPDF } from "@/app/components/PDFs/DispatchPDF";
import { useDispatch, useOrders } from "@/app/utils/hooks/useOrders";
import {
  ArrowDownToLine,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ListFilter,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Orders() {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<"pending" | "completed">(
    "pending",
  );

  const [monthModal, setMonthModal] = useState<boolean>(false);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const [page, setPage] = useState(1);
  const limit = 20;
  // 👇 1. CHANGED: Store the 'committed' filters here when user clicks Apply
  const initialFilterData = {
    address: "",
    route_no: "",
    license_no: "",
    username: "",
    month: "",
  };

  // Stores the temporary inputs in the modal
  const [filterFormData, setFilterFormData] = useState(initialFilterData);

  // Stores the actual active filters used for the list
  const [appliedFilters, setAppliedFilters] = useState(initialFilterData);

  const [filterModal, setFilterModal] = useState<boolean>(false);

  const { data, error, isLoading } = useOrders({
    status: selectedStatus,
    ...appliedFilters,
    page,
    limit,
  });

  const orders = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const { data: DATA, error: dispatchError } = useDispatch({
    ids: selectedOrders,
  });
  const safeRows = DATA ?? [];

  const [dispatchModal, setDispatchModal] = useState<boolean>(false);
  const [dispatchInfo, setDispatchInfo] = useState<{
    title: string;
    name: string;
  }>({ title: "", name: "" });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 👇 3. CHANGED: Just commit the form data to the applied state
  const applyFilters = () => {
    setAppliedFilters({ ...filterFormData });
    setPage(1);
    setFilterModal(false);
  };

  const clearFilters = () => {
    setFilterFormData(initialFilterData);
    setAppliedFilters(initialFilterData);
    setPage(1);
    setFilterModal(false);
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
            {selectedOrders.length > 0 && (
              <div>
                <button
                  onClick={() => setSelectedOrders([])}
                  className="p-3 bg-red-300 hover:bg-red-400 rounded-xl border border-red-600 cursor-pointer transition-colors"
                >
                  <X className="" />
                </button>
              </div>
            )}
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
        ) : !orders?.length ? (
          !orders?.length ? (
            <Error error="No orders found." />
          ) : (
            <Error error="No matches found." />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {orders.map((order) => {
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
        <div className="flex justify-center items-center gap-6 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="cursor-pointer p-1.5 text-slate-grey hover:text-gunmetal disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-full hover:bg-platinum"
            aria-label="Previous Page"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>

          <span className="text-sm font-bold text-gunmetal tracking-wide">
            {page} <span className="text-pale-slate-2 mx-1 font-medium">/</span>{" "}
            {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page >= totalPages}
            className="cursor-pointer p-1.5 text-slate-grey hover:text-gunmetal disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-full hover:bg-platinum"
            aria-label="Next Page"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>
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
              License No.
              <div className="mt-2">
                <input
                  type="text"
                  name="license_no"
                  value={filterFormData.license_no || ""}
                  onChange={handleFilterChange}
                  placeholder="Filter by License No"
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
          <div className="w-full">
            <label className="text-sm font-bold uppercase tracking-widest text-slate-grey ml-1">
              Month
              {/* <div className="mt-2">
                <input
                  type="month"
                  name="month"
                  value={filterFormData.month || ""}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-4 border-2 rounded-xl text-gunmetal font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                />
              </div> */}
              <div
                onClick={() => setMonthModal(true)}
                className="w-full px-4 py-4 border-2 rounded-xl bg-white border-platinum cursor-pointer flex justify-between items-center transition-all duration-200"
              >
                <span
                  className={
                    filterFormData.month
                      ? "text-gunmetal font-medium"
                      : "text-gray-400"
                  }
                >
                  {filterFormData.month
                    ? new Date(filterFormData.month + "-01").toLocaleString(
                        "default",
                        {
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "Select Month"}
                </span>

                <span>📅</span>
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
      <CustomModal
        isOpen={monthModal}
        onClose={() => setMonthModal(false)}
        title="Select Month"
        maxWidth="max-w-sm"
      >
        <div className="space-y-6 pt-2">
          {/* 1. Year Selector */}
          <div className="flex justify-between items-center bg-bright-snow p-2 rounded-xl border border-platinum">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="p-2 text-slate-grey hover:text-gunmetal hover:bg-white rounded-lg border border-transparent hover:border-alabaster-grey hover:shadow-sm transition-all duration-200"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-pale-slate-2 uppercase tracking-widest mb-0.5">
                Year
              </span>
              <span className="text-xl font-bold text-gunmetal font-mono leading-none">
                {year}
              </span>
            </div>

            <button
              onClick={() => setYear((y) => y + 1)}
              className="p-2 text-slate-grey hover:text-gunmetal hover:bg-white rounded-lg border border-transparent hover:border-alabaster-grey hover:shadow-sm transition-all duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* 2. Months Grid */}
          <div className="grid grid-cols-3 gap-3">
            {months.map((m, i) => {
              const value = `${year}-${String(i + 1).padStart(2, "0")}`;
              const isActive = filterFormData.month === value;

              return (
                <button
                  key={m}
                  onClick={() => {
                    handleFilterChange({
                      target: {
                        name: "month",
                        value: value,
                      },
                    } as React.ChangeEvent<HTMLInputElement>);
                    setMonthModal(false);
                  }}
                  className={`
                    py-3.5 rounded-xl text-sm font-bold transition-all duration-200
                    ${
                      isActive
                        ? "bg-gunmetal text-white shadow-md border border-transparent ring-2 ring-gunmetal/20 ring-offset-2"
                        : "bg-white text-iron-grey border border-alabaster-grey hover:border-pale-slate hover:bg-bright-snow hover:text-gunmetal hover:shadow-sm"
                    }
                  `}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      </CustomModal>
    </>
  );
}
