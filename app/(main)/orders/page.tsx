"use client";
import CustomModal from "@/app/components/CustomModal";
import Error from "@/app/components/Error";
import Loader from "@/app/components/Loader";
import { createDispatchPDF } from "@/app/components/PDFs/DispatchPDF";
import { useDispatch, useOrders } from "@/app/utils/hooks/useOrders";
import {
  ArrowDownToLine,
  CalendarDays,
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
  const [dateModal, setDateModal] = useState(false);

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(year, month, day);

    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(clickedDate);
      setRangeEnd(null);
    } else {
      if (clickedDate < rangeStart) {
        setRangeEnd(rangeStart);
        setRangeStart(clickedDate);
      } else {
        setRangeEnd(clickedDate);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleApply = () => {
    setFilterFormData((prev) => ({
      ...prev,
      start_date: rangeStart ? formatDate(rangeStart) : "",
      end_date: rangeEnd ? formatDate(rangeEnd) : "",
    }));

    setDateModal(false);
  };

  const handleClear = () => {
    setRangeStart(null);
    setRangeEnd(null);

    setFilterFormData((prev) => ({
      ...prev,
      start_date: "",
      end_date: "",
    }));
  };

  const [page, setPage] = useState(1);
  const limit = 20;
  // 👇 1. CHANGED: Store the 'committed' filters here when user clicks Apply
  const initialFilterData = {
    address: "",
    route_no: "",
    license_no: "",
    username: "",
    start_date: "",
    end_date: "",
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
                  setPage(1);
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
                  setPage(1);
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
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-grey mb-2 ml-1">
              Date Range
            </label>

            <div className="relative group">
              {/* Left Icon */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pale-slate-2 group-hover:text-gunmetal transition-colors duration-300 pointer-events-none z-10">
                <CalendarDays size={18} strokeWidth={2} />
              </div>

              {/* Trigger Button */}
              <button
                onClick={() => setDateModal(true)}
                className={`
              w-full pl-12 pr-10 py-3.5 text-left
              bg-white border rounded-xl
              font-medium
              shadow-sm transition-all duration-200
              focus:outline-none focus:border-gunmetal focus:ring-4 focus:ring-gunmetal/5
              ${dateModal ? "border-gunmetal" : "border-alabaster-grey hover:border-pale-slate"}
            `}
              >
                {filterFormData.start_date || filterFormData.end_date ? (
                  <span className="text-gunmetal font-medium">
                    {filterFormData.start_date || "?"} ------{" "}
                    {filterFormData.end_date || "?"}
                  </span>
                ) : (
                  <span className="text-pale-slate-2">
                    Select Date Range...
                  </span>
                )}
              </button>
            </div>
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
        isOpen={dateModal}
        onClose={() => setDateModal(false)}
        title="Select Date Range"
        maxWidth="max-w-[400px]"
      >
        <div className="pt-2 flex flex-col gap-5">
          {/* Calendar Header */}
          <div className="flex justify-between items-center bg-bright-snow p-2 rounded-xl border border-platinum">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-grey hover:text-gunmetal hover:bg-white rounded-lg border border-transparent hover:border-alabaster-grey hover:shadow-sm transition-all duration-200"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center">
              <span className="text-[15px] font-bold text-gunmetal">
                {monthNames[month]} {year}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-grey hover:text-gunmetal hover:bg-white rounded-lg border border-transparent hover:border-alabaster-grey hover:shadow-sm transition-all duration-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="px-1">
            {/* Days of Week */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-bold text-pale-slate-2 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {/* Empty slots for first row */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 w-full" />
              ))}

              {/* Day Buttons */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const currentDateObj = new Date(year, month, day);
                const time = currentDateObj.getTime();

                const isStart = rangeStart?.getTime() === time;
                const isEnd = rangeEnd?.getTime() === time;
                const isInRange =
                  rangeStart &&
                  rangeEnd &&
                  time > rangeStart.getTime() &&
                  time < rangeEnd.getTime();

                // Styling logic for range connections
                let wrapperClass =
                  "w-full h-10 flex items-center justify-center relative";
                if (isInRange) wrapperClass += " bg-bright-snow";
                if (isStart && rangeEnd)
                  wrapperClass +=
                    " bg-gradient-to-r from-transparent to-bright-snow";
                if (isEnd && rangeStart)
                  wrapperClass +=
                    " bg-gradient-to-l from-transparent to-bright-snow";

                let buttonClass =
                  "w-9 h-9 rounded-full text-sm font-semibold transition-all flex items-center justify-center z-10 ";

                if (isStart || isEnd) {
                  buttonClass += "bg-gunmetal text-white shadow-md";
                } else if (isInRange) {
                  buttonClass += "text-gunmetal hover:bg-platinum";
                } else {
                  buttonClass +=
                    "text-iron-grey hover:bg-platinum hover:text-gunmetal";
                }

                return (
                  <div key={day} className={wrapperClass}>
                    <button
                      onClick={() => handleDayClick(day)}
                      className={buttonClass}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Range Display */}
          <div className="flex items-center justify-between px-4 py-3 bg-bright-snow rounded-xl border border-platinum">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-grey">
                Start Date
              </span>
              <span className="text-sm font-bold text-gunmetal">
                {rangeStart
                  ? rangeStart.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "-- / -- / ----"}
              </span>
            </div>
            <div className="h-6 w-px bg-pale-slate"></div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-slate-grey">
                End Date
              </span>
              <span className="text-sm font-bold text-gunmetal">
                {rangeEnd
                  ? rangeEnd.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "-- / -- / ----"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-2 pt-5 border-t border-platinum flex justify-end gap-3">
            <button
              onClick={handleClear}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-gunmetal border border-alabaster-grey hover:bg-bright-snow hover:border-pale-slate transition-all"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              disabled={!rangeStart}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gunmetal hover:bg-shadow-grey hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
