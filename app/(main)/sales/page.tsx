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
import { useSalesByMonths } from "@/app/utils/hooks/useOrders";
import { createSalesPDF } from "@/app/components/PDFs/SalesPDF";

type Customer = Database["public"]["Tables"]["Customers"]["Row"];

function SalesDataTable({
  appliedFilters,
}: {
  appliedFilters: {
    route_no: string;
    retailer_id: number | null;
    username: string;
    months: string[];
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
  } = useSalesByMonths(queryFilters);

  const sortedMonths = [...(appliedFilters.months || [])].sort();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSalesData = salesData?.filter(
    (row: any) =>
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
                <Search
                  size={18}
                  className="text-pale-slate-2 group-focus-within:text-gunmetal transition-colors duration-200"
                />
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
                  <th className="px-6 py-4 whitespace-nowrap">Name</th>
                  {sortedMonths.map((m) => {
                    const [year, month] = m.split("-");
                    const monthNamesShort = [
                      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                    ];
                    const formattedHeader = `${monthNamesShort[parseInt(month) - 1]}-${year.slice(2)}`;
                    return (
                      <th
                        key={m}
                        className="px-6 py-4 text-center whitespace-nowrap"
                      >
                        {formattedHeader}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-alabaster-grey">
                {filteredSalesData && filteredSalesData.length > 0
                  ? filteredSalesData.map((row: any) => (
                      <tr
                        key={row.id}
                        className="hover:bg-bright-snow transition-colors duration-200 group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-gunmetal group-hover:text-black transition-colors">
                              {row.name}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span
                                className="bg-bright-snow px-2 py-0.5 rounded-md border border-alabaster-grey text-slate-grey"
                                title="Route No"
                              >
                                {row.route_no || "No Route"}
                              </span>
                              <span
                                className="bg-platinum px-2 py-0.5 rounded-md text-gunmetal font-bold"
                                title="Sales Rep"
                              >
                                {row.username || "N/A"}
                              </span>
                            </div>
                            <span
                              className="text-xs text-slate-grey max-w-[280px] truncate mt-0.5"
                              title={row.address}
                            >
                              {row.address}
                            </span>
                          </div>
                        </td>
                        {sortedMonths.map((m) => (
                          <td key={m} className="px-6 py-4 text-center">
                            <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-lg bg-gunmetal/5 text-gunmetal font-bold border border-gunmetal/10 shadow-sm">
                              {row[m] || 0}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  : null}
              </tbody>
              <tfoot className="bg-bright-snow border-t-2 border-alabaster-grey font-bold text-gunmetal">
                <tr>
                  <td
                    colSpan={1}
                    className="px-6 py-4 text-right uppercase tracking-widest text-xs text-slate-grey"
                  >
                    Grand Total
                  </td>
                  {sortedMonths.map((m) => (
                    <td key={m} className="px-6 py-4 text-center">
                      <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1.5 rounded-lg bg-gunmetal/10 text-gunmetal font-black border border-gunmetal/20 shadow-sm">
                        {filteredSalesData?.reduce(
                          (sum: number, row: any) =>
                            sum + (Number(row[m]) || 0),
                          0,
                        ) || 0}
                      </div>
                    </td>
                  ))}
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
  const [monthModal, setMonthModal] = useState(false);
  const [modalYear, setModalYear] = useState(today.getFullYear());

  const initialFilterData = {
    route_no: "",
    retailer_id: null as number | null,
    username: "",
    months: [] as string[],
  };

  const [filterFormData, setFilterFormData] = useState(initialFilterData);
  const [appliedFilters, setAppliedFilters] = useState(initialFilterData);
  console.log(appliedFilters);

  const hasFilters = Boolean(appliedFilters.months.length > 0);

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

  const { data: salesData } = useSalesByMonths(queryFilters);

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

  const handleClearMonths = () => {
    setFilterFormData((prev) => ({
      ...prev,
      months: [],
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
    handleClearMonths();
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
                  createSalesPDF(salesData as any, [...appliedFilters.months].sort());
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
                Months
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pale-slate-2 group-hover:text-gunmetal transition-colors duration-300 pointer-events-none z-10">
                  <CalendarDays size={18} />
                </div>
                <button
                  onClick={() => setMonthModal(true)}
                  className={`
                    w-full py-3.5 pl-12 pr-4 text-left
                    bg-white border rounded-xl
                    text-gunmetal font-medium
                    shadow-sm transition-all duration-200
                    focus:outline-none focus:border-gunmetal focus:ring-4 focus:ring-gunmetal/5
                    ${monthModal ? "border-gunmetal" : "border-alabaster-grey hover:border-pale-slate"}
                  `}
                >
                  {filterFormData.months.length > 0 ? (
                    <span className="text-gunmetal">
                      {filterFormData.months.length} month(s) selected
                    </span>
                  ) : (
                    <span className="text-pale-slate-2">Select Months...</span>
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

      {/* Month Modal */}
      <CustomModal
        isOpen={monthModal}
        onClose={() => setMonthModal(false)}
        title="Select Months"
        maxWidth="max-w-[400px]"
      >
        <div className="pt-2 flex flex-col gap-5">
          {/* Header */}
          <div className="flex justify-between items-center bg-bright-snow p-2 rounded-xl border border-platinum">
            <button
              onClick={() => setModalYear((y) => y - 1)}
              className="p-2 text-slate-grey hover:text-gunmetal hover:bg-white rounded-lg border border-transparent hover:border-alabaster-grey hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center">
              <span className="text-[15px] font-bold text-gunmetal">
                {modalYear}
              </span>
            </div>

            <button
              onClick={() => setModalYear((y) => y + 1)}
              className="p-2 text-slate-grey hover:text-gunmetal hover:bg-white rounded-lg border border-transparent hover:border-alabaster-grey hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Grid */}
          <div className="px-1">
            <div className="grid grid-cols-3 gap-2">
              {monthNames.map((m, i) => {
                const monthStr = `${modalYear}-${String(i + 1).padStart(2, "0")}`;
                const isSelected = filterFormData.months.includes(monthStr);
                return (
                  <button
                    key={m}
                    onClick={() => {
                      setFilterFormData((prev) => ({
                        ...prev,
                        months: isSelected
                          ? prev.months.filter((month) => month !== monthStr)
                          : [...prev.months, monthStr],
                      }));
                    }}
                    className={`py-3 rounded-lg text-sm font-bold transition-all border ${
                      isSelected
                        ? "bg-gunmetal text-white border-gunmetal shadow-md"
                        : "bg-bright-snow text-slate-grey border-transparent hover:border-alabaster-grey hover:bg-platinum hover:text-gunmetal"
                    } cursor-pointer`}
                  >
                    {m.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-2 pt-5 border-t border-platinum flex justify-end gap-3">
            <button
              onClick={handleClearMonths}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-gunmetal border border-alabaster-grey hover:bg-bright-snow hover:border-pale-slate transition-all cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => setMonthModal(false)}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-gunmetal hover:bg-shadow-grey hover:shadow-md active:scale-95 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
