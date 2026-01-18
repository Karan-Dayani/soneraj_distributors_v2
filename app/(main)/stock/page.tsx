"use client";

import { useState } from "react";
import Loader from "@/app/components/Loader";
import {
  useRemoveStock,
  useStock,
  useUpdateStock,
} from "@/app/utils/hooks/useStock";
import { Pen, Trash2, Save, Search } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import Error from "@/app/components/Error";
import CustomModal from "@/app/components/CustomModal";

// --- Types ---
type RawStockItem = {
  id: number;
  quantity: number;
  Products: {
    name: string;
    short_name: string | null;
  };
  Bottle_Sizes: {
    name: string | null;
    size_ml: string;
  };
  Stock_Batches: {
    id: number;
    batch_code: string;
    quantity: number;
    created_at: string;
  }[];
};

type SelectedBatch = {
  stockId: number;
  currentTotalStockQty: number;
  batchId: number;
  batchCode: string;
  batchQuantity: number;
  productName: string;
  sizeName: string;
};

export default function Stock() {
  const { addToast } = useToast();

  const { data: stockItems, isLoading } = useStock() as {
    data: RawStockItem[] | undefined;
    isLoading: boolean;
  };

  const { mutate: removeStock, isPending: isDeleting } = useRemoveStock();
  const { mutate: updateStock } = useUpdateStock();

  // --- State ---
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<SelectedBatch | null>(
    null,
  );
  const [formData, setFormData] = useState({
    batchCode: "",
    quantity: 0,
  });

  // --- Handlers ---
  const handleEditClick = (
    item: RawStockItem,
    batch: RawStockItem["Stock_Batches"][0],
  ) => {
    setSelectedBatch({
      stockId: item.id,
      currentTotalStockQty: item.quantity,
      batchId: batch.id,
      batchCode: batch.batch_code,
      batchQuantity: batch.quantity,
      productName: item.Products.name,
      sizeName: item.Bottle_Sizes.size_ml,
    });

    setFormData({
      batchCode: batch.batch_code,
      quantity: batch.quantity,
    });
  };

  const handleClose = () => {
    setSelectedBatch(null);
    setFormData({ batchCode: "", quantity: 0 });
  };

  const handleUpdate = () => {
    if (!selectedBatch) return;

    const quantityDiff = formData.quantity - selectedBatch.batchQuantity;
    const newTotalStock = selectedBatch.currentTotalStockQty + quantityDiff;

    if (newTotalStock < 0) {
      addToast("Resulting stock cannot be negative", "error");
      return;
    }

    updateStock(
      {
        stockId: selectedBatch.stockId,
        batchId: selectedBatch.batchId,
        newBatchCode: formData.batchCode,
        newBatchQty: formData.quantity,
        newTotalStockQty: newTotalStock,
      },
      {
        onSuccess: () => {
          addToast("Stock updated successfully", "success");
          handleClose();
        },
        onError: (err) => {
          console.error(err);
          addToast(err.message || "Failed to update stock", "error");
        },
      },
    );
  };

  const handleDelete = () => {
    if (!selectedBatch) return;

    const newTotalQuantity =
      selectedBatch.currentTotalStockQty - selectedBatch.batchQuantity;

    if (newTotalQuantity < 0) {
      addToast("Error: Resulting stock cannot be negative", "error");
      return;
    }

    removeStock(
      {
        stockToUpdate: {
          id: selectedBatch.stockId,
          quantity: newTotalQuantity,
        },
        batchIdToDelete: selectedBatch.batchId,
      },
      {
        onSuccess: () => {
          addToast("Batch deleted successfully", "success");
          handleClose();
        },
        onError: (err) => {
          addToast(err.message || "Failed to delete batch", "error");
        },
      },
    );
  };

  const searchTerms = searchQuery
    .toLowerCase()
    .split(",")
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
  const filteredStockItems = (stockItems || []).filter((item) => {
    if (searchTerms.length === 0) return true;
    return searchTerms.every((term) => {
      const matchName = item.Products.name.toLowerCase().includes(term);
      const matchSize = item.Bottle_Sizes.size_ml.toLowerCase().includes(term);
      const matchBatch = item.Stock_Batches.some((b) =>
        b.batch_code.toLowerCase().includes(term),
      );
      return matchName || matchSize || matchBatch;
    });
  });
  const sortedStockItems = [...filteredStockItems].sort((a, b) => {
    return a.Products.name.localeCompare(b.Products.name);
  });

  if (isLoading) return <Loader />;

  if (!stockItems || stockItems.length < 1)
    return <Error error="No Stock to display." />;

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-0 bg-bright-snow z-10 pt-6 md:pt-8 px-6 md:px-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gunmetal">Stock</h1>
            </div>

            <div className="w-full md:w-auto">
              <div className="relative w-full md:w-fit group">
                <input
                  type="search"
                  name="search"
                  aria-label="Search stock"
                  placeholder="Search..."
                  autoComplete="off"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
                    w-full md:w-56 
                    px-5 py-3 pr-10 
                    text-md text-shadow-grey bg-white border border-alabaster-grey rounded-xl shadow-sm outline-none 
                    transition-all duration-300 ease-in-out 
                    md:focus:w-64 
                    focus:border-gunmetal focus:ring-1 focus:ring-gunmetal 
                    placeholder:text-pale-slate-2
                  "
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-pale-slate-2 pointer-events-none group-focus-within:text-gunmetal transition-colors">
                  <Search size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="py-4 bg-gunmetal text-bright-snow border border-alabaster-grey flex justify-between divide-x divide-alabaster-grey">
            {/* 1. Name: 4/12 mobile, 1/5 desktop */}
            <div className="basis-4/12 md:basis-1/5 flex items-center justify-start px-2">
              Name
            </div>
            {/* 2. Size: 2/12 mobile, 1/5 desktop */}
            <div className="basis-2/12 md:basis-1/5 flex items-center justify-center">
              Size
            </div>
            {/* 3. Batch: 3/12 mobile, 1/5 desktop */}
            <div className="basis-2/12 md:basis-1/5 flex items-center justify-center">
              Batch
            </div>
            {/* 4. Qty: 2/12 mobile, 1/5 desktop */}
            <div className="basis-2/12 md:basis-1/5 flex items-center justify-center">
              Qty
            </div>
            {/* 5. Edit: 1/12 mobile, 1/5 desktop */}
            <div className="basis-2/12 md:basis-1/5 flex items-center justify-center px-2">
              Edit
            </div>
          </div>
        </div>

        <div className="px-6 md:px-8 pb-8">
          {sortedStockItems?.map((item) => (
            <div key={item.id}>
              {item.Stock_Batches?.map((batch) => (
                <div
                  key={batch.id}
                  className="py-4 bg-bright-snow border-b border-l border-r border-alabaster-grey flex justify-between divide-x divide-alabaster-grey"
                >
                  {/* Matches Header Col 1 */}
                  <div className="basis-4/12 md:basis-1/5 flex items-center justify-start px-2">
                    {item.Products.name}
                  </div>

                  {/* Matches Header Col 2 */}
                  <div className="basis-2/12 md:basis-1/5 flex items-center justify-center">
                    {item.Bottle_Sizes.size_ml}
                  </div>

                  {/* Matches Header Col 3 */}
                  <div className="basis-2/12 md:basis-1/5 flex items-center justify-center">
                    {batch.batch_code}
                  </div>

                  {/* Matches Header Col 4 */}
                  <div className="basis-2/12 md:basis-1/5 flex items-center justify-center">
                    {batch.quantity}
                  </div>

                  {/* Matches Header Col 5 */}
                  <div className="basis-2/12 md:basis-1/5 flex items-center justify-center px-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(item, batch);
                      }}
                      className="text-slate-grey hover:text-gunmetal p-1 rounded-full hover:bg-platinum transition-colors cursor-pointer"
                    >
                      <Pen size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <CustomModal
        isOpen={!!selectedBatch}
        onClose={handleClose}
        title={`Manage Batch: ${selectedBatch?.productName} (${selectedBatch?.sizeName})`}
      >
        <div className="flex flex-col gap-6 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gunmetal">
                Batch Code
              </label>
              <input
                type="text"
                value={formData.batchCode}
                onChange={(e) =>
                  setFormData({ ...formData, batchCode: e.target.value })
                }
                className="p-2 border border-platinum rounded-md focus:outline-none focus:ring-2 focus:ring-gunmetal"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gunmetal">
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="p-2 border border-platinum rounded-md focus:outline-none focus:ring-2 focus:ring-gunmetal"
              />
            </div>
          </div>

          <div className="border-t border-platinum my-1"></div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <Trash2 size={18} />
                  <span>Delete Batch</span>
                </>
              )}
            </button>

            <button
              onClick={handleUpdate}
              className="flex items-center gap-2 px-4 py-2 bg-gunmetal text-white hover:bg-opacity-90 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </CustomModal>
    </>
  );
}
