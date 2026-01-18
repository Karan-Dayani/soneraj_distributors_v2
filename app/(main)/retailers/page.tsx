"use client";
import React, { useState } from "react";
import {
  Plus,
  Store,
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
import CustomAlert from "@/app/components/CustomAlert";
import { useUsers } from "@/app/utils/hooks/useSuppliers";
import SimpleSelect from "@/app/components/SelectDropdown";

export default function Retailers() {
  const { addToast } = useToast();
  const { data: users } = useUsers();
  const initialRetailerData = {
    name: "",
    address: "",
    license_no: "",
    route_no: "",
    user_id: "",
  };
  const [retailerFormData, setRetailerFormData] = useState<{
    name: string;
    address: string;
    license_no: string;
    route_no: string;
    user_id: string;
  }>(initialRetailerData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setRetailerFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const [removeRetailerID, setRemoveRetailerID] = useState<number | null>(null);

  return (
    <>
      <div className="bg-bright-snow p-8 font-sans text-gunmetal">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className=" mb-8">
            <h1 className="text-3xl font-bold text-gunmetal">Retailers</h1>
            <p className="text-sm text-slate-grey mt-1">
              Manage your distribution retailers.
            </p>
          </div>

          {/* Add Retailer Section */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-platinum shadow-sm mb-8">
            <h2 className="text-lg font-bold text-gunmetal mb-2">
              Add New Retailer
            </h2>

            <div className="flex flex-col gap-6">
              {/* FORM CONTAINER - GRID SYSTEM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. RETAILER NAME (Full Width) */}
                <div className="md:col-span-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-slate-grey ml-1">
                    Retailer Name
                    <div className="mt-2">
                      <input
                        name="name"
                        value={retailerFormData.name}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Enter retailer name..."
                        className="w-full px-4 py-4 border-2 rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                      />
                    </div>
                  </label>
                </div>

                {/* 2. ADDRESS (Full Width) */}
                <div className="md:col-span-2">
                  <label className="text-sm font-bold uppercase tracking-widest text-slate-grey ml-1">
                    Address
                    <div className="mt-2">
                      <input
                        name="address"
                        value={retailerFormData.address}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Enter full address..."
                        className="w-full px-4 py-4 border-2 rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                      />
                    </div>
                  </label>
                </div>

                {/* 3. LICENSE NO (1/2 Width) */}
                <div className="w-full">
                  <label className="text-sm font-bold uppercase tracking-widest text-slate-grey ml-1">
                    License No
                    <div className="mt-2">
                      <input
                        name="license_no"
                        value={retailerFormData.license_no}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Lic. Number"
                        className="w-full px-4 py-4 border-2 rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                      />
                    </div>
                  </label>
                </div>

                {/* 4. ROUTE NO (1/2 Width) */}
                <div className="w-full">
                  <label className="text-sm font-bold uppercase tracking-widest text-slate-grey ml-1">
                    Route No
                    <div className="mt-2">
                      <input
                        name="route_no"
                        value={retailerFormData.route_no}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Route #"
                        className="w-full px-4 py-4 border-2 rounded-xl text-gunmetal placeholder-pale-slate-2 font-medium focus:outline-none focus:bg-white focus:border-slate-grey bg-white border-platinum transition-all duration-200"
                      />
                    </div>
                  </label>
                </div>

                <div className="w-full">
                  <SimpleSelect
                    options={users || []}
                    displayKey="username"
                    idKey="id"
                    label="Supplier"
                    placeholder="Select supplier"
                    selectedId={retailerFormData.user_id}
                    onSelect={(item) => {
                      setRetailerFormData((prev) => ({
                        ...prev,
                        user_id: item.id,
                      }));
                    }}
                    onClear={() => {
                      setRetailerFormData((prev) => ({
                        ...prev,
                        user_id: "", // Reset to empty string
                      }));
                    }}
                  />
                </div>
              </div>

              {/* BUTTON (Aligned Right) */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    const hasEmptyFields = Object.values(retailerFormData).some(
                      (value) => !value || value.trim() === "",
                    );

                    if (hasEmptyFields) {
                      addToast("Please fill in all fields.", "error");
                      return;
                    }

                    createCustomer(retailerFormData, {
                      onSuccess: () => {
                        addToast("Order Successful!", "success");
                        // Clear your inputs here
                        setRetailerFormData(initialRetailerData);
                      },
                      onError: (error) => {
                        console.error("Adding Retailer Failed:", error.message);
                        addToast(
                          "Failed to add retailer. Check console.",
                          "error",
                        );
                      },
                    });
                  }}
                  className="
        flex items-center gap-2 px-8 py-3.5 
        bg-gunmetal text-white rounded-lg cursor-pointer
        font-semibold shadow-lg hover:bg-shadow-grey hover:scale-[1.01] active:scale-[0.98] 
        transition-all duration-200 w-full md:w-auto justify-center
      "
                >
                  <Plus size={20} strokeWidth={3} />
                  <span>Add Retailer</span>
                </button>
              </div>
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
                    setSearchInput(
                      e.target.value !== "" ? e.target.value : null,
                    );
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
                        {retailer.name}, {retailer.address} (
                        {retailer.license_no})
                      </span>
                    </div>

                    <div className="space-x-2">
                      <button
                        onClick={() => setRemoveRetailerID(retailer.id)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-100 rounded-lg transition-all"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-pale-slate-2">
                  <Store
                    size={48}
                    strokeWidth={1}
                    className="mb-2 opacity-20"
                  />
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
      <CustomAlert
        isOpen={removeRetailerID ? true : false}
        onClose={() => setRemoveRetailerID(null)}
        onConfirm={() => {
          deleteCustomer(removeRetailerID!, {
            onSuccess: () => {
              addToast("Removed Retailer.", "success");
            },
            onError: (err) => {
              addToast("Failed to remove retailer " + err.message, "error");
            },
          });
          setRemoveRetailerID(null);
        }}
        title={`Remove ${
          Customers?.data?.find((r) => r.id === removeRetailerID)?.name
        }`}
        message={`are you sure ?`}
        type="warning"
      />
    </>
  );
}
