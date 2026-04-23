"use client";
import CustomModal from "@/app/components/CustomModal";
import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  RefreshCcw,
  TrendingUp,
  ArrowDownToLine,
  Search,
} from "lucide-react";
import { useCustomers } from "@/app/utils/hooks/useCustomers";
import { useDebounce } from "@/app/utils/hooks/useDebounce";
import SearchSelect from "@/app/components/SearchSelectDropdown";
import { Database } from "@/types/supabase";
import { useSalesFiltered } from "@/app/utils/hooks/useOrders";
import { createSalesPDF } from "@/app/components/PDFs/SalesPDF";

type Customer = Database["public"]["Tables"]["Customers"]["Row"];

function SalesDataTable({
  appliedFilters,
}: {
  appliedFilters: {
    route_no: string;
    retailer_id: number | null;
    username: string;
    start_date: string;
    end_date: string;
  };
}) {
  const formattedRouteNo =
    appliedFilters.route_no &&
    appliedFilters.route_no.length === 1 &&
    /^\d$/.test(appliedFilters.route_no)
      ? `0${appliedFilters.route_no}`
      : appliedFilters.route_no;

  const queryFilters = {
    ...appliedFilters,
    route_no: formattedRouteNo,
  };

  const {
    data: salesData,
    isLoading: isSalesLoading,
    error: salesError,
  } = useSalesFiltered(queryFilters);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSalesData = salesData?.filter(
    (row) =>
      row.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="bg-white border border-alabaster-grey rounded-xl shadow-sm overflow-hidden">
      {isSalesLoading ? (
        <div className="p-16 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gunmetal mb-4"></div>
          <p className="text-slate-grey font-medium text-sm">
            Loading sales data...
          </p>
        </div>
      ) : salesError ? (
        <div className="p-12 text-center">
          <p className="text-red-500 font-bold mb-2">Error loading data</p>
          <p className="text-slate-grey text-sm">{salesError.message}</p>
        </div>
      ) : salesData && salesData.length > 0 ? (
        <div className="flex flex-col">
          <div className="p-5 bg-bright-snow/30 border-b border-alabaster-grey">
            <div className="relative w-full max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={18} className="text-pale-slate-2 group-focus-within:text-gunmetal transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="Search retailers or addresses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-alabaster-grey rounded-xl text-sm font-medium text-gunmetal placeholder-pale-slate-2 shadow-sm hover:border-pale-slate focus:outline-none focus:border-gunmetal focus:ring-4 focus:ring-gunmetal/5 transition-all duration-200"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bright-snow border-b border-alabaster-grey text-xs uppercase tracking-widest text-slate-grey font-bold">
                  <th className="px-6 py-4 whitespace-nowrap">Retailer Name</th>
                  <th className="px-6 py-4 whitespace-nowrap">Address</th>
                  <th className="px-6 py-4 whitespace-nowrap">Sales Rep</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">
                    Total Qty
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-alabaster-grey">
                {filteredSalesData && filteredSalesData.length > 0
                  ? filteredSalesData.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-bright-snow transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-gunmetal group-hover:text-black transition-colors">
                            {row.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="text-sm text-slate-grey max-w-[280px] truncate"
                            title={row.address}
                          >
                            {row.address}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-platinum text-gunmetal text-[11px] uppercase tracking-wider font-bold">
                            {row.username || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-lg bg-gunmetal/5 text-gunmetal font-bold border border-gunmetal/10 shadow-sm">
                            {row.total_quantity}
                          </div>
                        </td>
                      </tr>
                    ))
                  : null}
              </tbody>
              <tfoot className="bg-bright-snow border-t-2 border-alabaster-grey font-bold text-gunmetal">
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-right uppercase tracking-widest text-xs text-slate-grey"
                  >
                    Grand Total
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-lg bg-gunmetal/10 text-gunmetal font-black border border-gunmetal/20 shadow-sm">
                      {filteredSalesData?.reduce(
                        (sum, row) => sum + (Number(row.total_quantity) || 0),
                        0,
                      ) || 0}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
            {filteredSalesData?.length === 0 && (
              <div className="p-8 text-center text-slate-grey text-sm">
                No matching records found in this list.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-16 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-bright-snow rounded-full flex items-center justify-center mb-4 border border-platinum shadow-inner">
            <ListFilter size={24} className="text-pale-slate-2" />
          </div>
          <h3 className="text-lg font-bold text-gunmetal mb-1">
            No sales found
          </h3>
          <p className="text-slate-grey text-sm max-w-sm">
            We couldn't find any sales data matching your current filters. Try
            adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SalesPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [dateModal, setDateModal] = useState(false);

  const initialFilterData = {
    route_no: "",
    retailer_id: null as number | null,
    username: "",
    start_date: "",
    end_date: "",
  };

  const [filterFormData, setFilterFormData] = useState(initialFilterData);
  const [appliedFilters, setAppliedFilters] = useState(initialFilterData);

  const hasFilters = Boolean(
    appliedFilters.route_no ||
    appliedFilters.retailer_id !== null ||
    appliedFilters.username ||
    appliedFilters.start_date ||
    appliedFilters.end_date,
  );

  const formattedRouteNo =
    appliedFilters.route_no &&
    appliedFilters.route_no.length === 1 &&
    /^\d$/.test(appliedFilters.route_no)
      ? `0${appliedFilters.route_no}`
      : appliedFilters.route_no;

  const queryFilters = {
    ...appliedFilters,
    route_no: formattedRouteNo,
  };

  const { data: salesData } = useSalesFiltered(queryFilters);

  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounce(query, 500);

  const { data: Customers, isLoading } = useCustomers({
    search: debouncedQuery,
  });

  const handleRetailerSearch = (q: string) => {
    setQuery(q);
  };

  const handleRetailerSelect = (customer: Customer) => {
    setFilterFormData((prev) => ({ ...prev, retailer_id: customer.id }));
  };

  const handleRetailerClear = () => {
    setFilterFormData((prev) => ({ ...prev, retailer_id: null }));
  };

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
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleApplyDate = () => {
    setFilterFormData((prev) => ({
      ...prev,
      start_date: rangeStart ? formatDate(rangeStart) : "",
      end_date: rangeEnd ? formatDate(rangeEnd) : "",
    }));
    setDateModal(false);
  };

  const handleClearDate = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setFilterFormData((prev) => ({
      ...prev,
      start_date: "",
      end_date: "",
    }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterFormData((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filterFormData });
    // Future: Trigger data refetch using 'appliedFilters' here
  };

  const clearFilters = () => {
    setFilterFormData(initialFilterData);
    setAppliedFilters(initialFilterData);
    handleClearDate();
  };

  return (
    <>
      <div className="p-6 md:p-8 max-w-6xl mx-auto">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gunmetal">
              Sales Dashboard
            </h1>
            <p className="text-slate-grey text-sm mt-1">
              Manage, filter, and view your sales data.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                if (salesData && salesData.length > 0) {
                  createSalesPDF(salesData);
                }
              }}
              disabled={!salesData || salesData.length === 0}
              className="p-3 bg-white hover:bg-bright-snow rounded-xl border border-alabaster-grey cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              <ArrowDownToLine className="" />
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-xl border border-alabaster-grey shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ListFilter size={20} className="text-gunmetal" />
            <h2 className="text-lg font-bold text-gunmetal">Filter Sales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="w-full">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-grey mb-2 ml-1">
                Route No.
              </label>
              <input
                type="text"
                name="route_no"
                value={filterFormData.route_no}
                onChange={handleFilterChange}
                placeholder="Search route..."
                className="w-full px-4 py-3.5 bg-white border border-alabaster-grey rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium shadow-sm hover:border-pale-slate transition-all duration-200 focus:outline-none focus:border-gunmetal focus:ring-4 focus:ring-gunmetal/5"
              />
            </div>

            <div className="w-full">
              <SearchSelect
                options={Customers?.data || []}
                isLoading={isLoading}
                displayKey="name,address,license_no"
                idKey="id"
                placeholder="Search retailer..."
                label="Retailer"
                onSearch={handleRetailerSearch}
                onSelect={handleRetailerSelect}
                onClear={handleRetailerClear}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-grey mb-2 ml-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={filterFormData.username}
                onChange={handleFilterChange}
                placeholder="Search username..."
                className="w-full px-4 py-3.5 bg-white border border-alabaster-grey rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium shadow-sm hover:border-pale-slate transition-all duration-200 focus:outline-none focus:border-gunmetal focus:ring-4 focus:ring-gunmetal/5"
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-grey mb-2 ml-1">
                Date Range
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pale-slate-2 group-hover:text-gunmetal transition-colors duration-300 pointer-events-none z-10">
                  <CalendarDays size={18} />
                </div>
                <button
                  onClick={() => setDateModal(true)}
                  className={`
                    w-full py-3.5 pl-12 pr-4 text-left
                    bg-white border rounded-xl
                    text-gunmetal font-medium
                    shadow-sm transition-all duration-200
                    focus:outline-none focus:border-gunmetal focus:ring-4 focus:ring-gunmetal/5
                    ${dateModal ? "border-gunmetal" : "border-alabaster-grey hover:border-pale-slate"}
                  `}
                >
                  {filterFormData.start_date || filterFormData.end_date ? (
                    <span className="text-gunmetal">
                      {filterFormData.start_date || "?"} -{" "}
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
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-alabaster-grey">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-slate-grey border border-alabaster-grey hover:bg-bright-snow hover:text-gunmetal transition-all cursor-pointer"
            >
              <RefreshCcw size={16} />
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gunmetal hover:bg-shadow-grey shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Sales Data Table */}
        {hasFilters ? (
          <SalesDataTable appliedFilters={appliedFilters} />
        ) : (
          <div className="bg-white border border-alabaster-grey rounded-xl shadow-sm overflow-hidden">
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-bright-snow rounded-full flex items-center justify-center mb-4 border border-platinum shadow-inner">
                <ListFilter size={24} className="text-pale-slate-2" />
              </div>
              <h3 className="text-lg font-bold text-gunmetal mb-1">
                Apply filters to view sales
              </h3>
              <p className="text-slate-grey text-sm max-w-sm">
                Please select at least one filter above to view sales data.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Date Modal (Reused from Orders) */}
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
              className="p-2 text-slate-grey hover:text-gunmetal hover:bg-white rounded-lg border border-transparent hover:border-alabaster-grey hover:shadow-sm transition-all duration-200 cursor-pointer"
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
              className="p-2 text-slate-grey hover:text-gunmetal hover:bg-white rounded-lg border border-transparent hover:border-alabaster-grey hover:shadow-sm transition-all duration-200 cursor-pointer"
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
                  "w-9 h-9 rounded-full text-sm font-semibold transition-all flex items-center justify-center z-10 cursor-pointer ";

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
              onClick={handleClearDate}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-gunmetal border border-alabaster-grey hover:bg-bright-snow hover:border-pale-slate transition-all cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={handleApplyDate}
              disabled={!rangeStart}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gunmetal hover:bg-shadow-grey hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
