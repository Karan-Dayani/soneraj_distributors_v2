"use client";
import React, { useState } from "react";
import {
  Plus,
  Store,
  LayoutGrid,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash,
} from "lucide-react";
import {
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
} from "@/app/utils/hooks/useCustomers";
import { useDebounce } from "@/app/utils/hooks/useDebounce";
import { useToast } from "@/app/context/ToastContext";

export default function Retailers() {
  const { addToast } = useToast();
  const [input, setInput] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchInput as string, 500);
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { data: Customers } = useCustomers({
    page,
    pageSize,
    search: debouncedSearch as string,
  });
  const totalPages = Math.ceil((Customers?.count || 0) / pageSize);
  const { mutate: createCustomer } = useCreateCustomer();
  const { mutate: deleteCustomer } = useDeleteCustomer();

  return (
    <div className="bg-bright-snow p-8 font-sans text-gunmetal">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-white rounded-lg border border-platinum text-gunmetal shadow-sm">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gunmetal tracking-tight">
              Retailers
            </h1>
            <p className="text-sm text-slate-grey mt-1">
              Manage your distribution retailers.
            </p>
          </div>
        </div>

        {/* Add Retailer Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-platinum shadow-sm mb-8">
          <h2 className="text-lg font-bold text-gunmetal mb-2">
            Add New Retailer
          </h2>

          <div className="flex flex-col md:flex-row items-end gap-4">
            {/* Input Field */}
            <div className="grow w-full">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-grey ml-1">
                Retailer Name
                <div className="relative group mt-2">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pale-slate-2 group-focus-within:text-slate-grey transition-colors pointer-events-none">
                    <Store size={20} />
                  </div>
                  <input
                    value={input ? input : ""}
                    onChange={(e) =>
                      setInput(e.target.value !== "" ? e.target.value : null)
                    }
                    type="text"
                    placeholder="Enter retailer name..."
                    className="w-full pl-12 pr-4 py-4 border-2 rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                  />
                </div>
              </label>
            </div>

            {/* Add Button */}
            <button
              onClick={() => {
                createCustomer(
                  { name: input as string },
                  {
                    onSuccess: () => {
                      setInput(null);
                      addToast("Added Retailer.", "success");
                    },

                    onError: (err) => {
                      addToast(
                        "Failed To Add Retailer " + err.message,
                        "error"
                      );
                    },
                  }
                );
              }}
              disabled={!input}
              className="
              flex items-center gap-2 px-8 py-3.5 
              bg-gunmetal text-white rounded-lg cursor-pointer
              font-semibold shadow-lg hover:bg-shadow-grey hover:scale-[1.01] active:scale-[0.98] 
              transition-all duration-200 w-full md:w-auto justify-center
              disabled:opacity-80 disabled:scale-[1] disabled:bg-gunmetal
            "
            >
              <Plus size={20} strokeWidth={3} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* LIST SECTION: Search & Pagination */}
        <div className="bg-white rounded-2xl border border-platinum shadow-sm overflow-hidden flex flex-col">
          {/* Toolbar: Search */}
          <div className="p-4 border-b border-platinum bg-white">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-grey w-4 h-4" />
              <input
                type="search"
                placeholder="Search retailers..."
                value={searchInput ? searchInput : ""}
                onChange={(e) => {
                  setSearchInput(e.target.value !== "" ? e.target.value : null);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-bright-snow border border-platinum rounded-xl text-sm focus:outline-none focus:border-gunmetal focus:bg-white transition-all placeholder-pale-slate-2 text-gunmetal"
              />
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-platinum min-h-[300px]">
            {(Customers?.data?.length ?? 0) > 0 ? (
              Customers?.data?.map((retailer) => (
                <div
                  key={retailer.id}
                  className="flex items-center justify-between p-5 hover:bg-bright-snow transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-bright-snow border border-platinum flex items-center justify-center text-slate-grey font-bold text-xs">
                      {retailer.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-gunmetal">
                      {retailer.name}
                    </span>
                  </div>

                  <div className="space-x-2">
                    <button
                      onClick={() =>
                        deleteCustomer(retailer.id, {
                          onSuccess: () => {
                            addToast("Removed Retailer.", "success");
                          },

                          onError: (err) => {
                            addToast(
                              "Failed to remove retailer " + err.message,
                              "error"
                            );
                          },
                        })
                      }
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-all"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-pale-slate-2">
                <Store size={48} strokeWidth={1} className="mb-2 opacity-20" />
                <p>No retailers found.</p>
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-platinum bg-white flex items-center justify-between">
            <span className="text-xs text-slate-grey font-medium">
              Page {page} of {totalPages || 1}
            </span>

            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-platinum text-slate-grey hover:border-gunmetal hover:text-gunmetal disabled:opacity-30 disabled:hover:border-platinum transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-platinum text-slate-grey hover:border-gunmetal hover:text-gunmetal disabled:opacity-30 disabled:hover:border-platinum transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
