import SimpleSelect from "@/app/components/SelectDropdown";
import { useToast } from "@/app/context/ToastContext";
import { useStockBatches } from "@/app/utils/hooks/useStock";
import {
  Minus,
  Plus,
  Box,
  AlertCircle,
  CheckCircle2,
  Save,
} from "lucide-react";
import { useState } from "react";

export default function OrderCard({ item, add }: any) {
  const { addToast } = useToast();
  const [submitted, setSubmitted] = useState<boolean>(false);
  // Fetch available batches for this specific product stock
  const { data: BatchData } = useStockBatches({
    stockId: item.product_stock_id,
  });

  // 1. Initialize state with an array of objects to track multiple batch rows
  const [rows, setRows] = useState<
    { id: number; qty: number; batch_id: number | null }[]
  >(() => [{ id: Date.now(), qty: 0, batch_id: null }]);

  // 2. Calculation Logic for Validation
  const totalOrdered = item["quantity-ordered"] || 0;
  // Sum up all qty values in the rows
  const totalAllocated = rows.reduce(
    (sum, row) => sum + (Number(row.qty) || 0),
    0,
  );

  const getBatchRemaining = (batchId: number | null) => {
    if (!batchId) return 0;
    const batch = BatchData?.find((b: any) => b.id === batchId);
    return batch?.quantity ?? 0;
  };

  const getAllocatedForBatch = (
    batchId: number | null,
    currentRowId: number,
  ) => {
    if (!batchId) return 0;

    return rows.reduce((sum, r) => {
      if (r.batch_id === batchId && r.id !== currentRowId) {
        return sum + (r.qty || 0);
      }
      return sum;
    }, 0);
  };

  const clampQtyToBatch = (
    qty: number,
    batchId: number | null,
    rowId: number,
  ) => {
    if (!batchId) return qty;

    const batchRemaining = getBatchRemaining(batchId);
    const alreadyUsed = getAllocatedForBatch(batchId, rowId);

    const maxAllowed = batchRemaining - alreadyUsed;
    return Math.max(0, Math.min(qty, maxAllowed));
  };

  const isPerfectMatch = totalAllocated === totalOrdered;
  const isOverAllocated = totalAllocated > totalOrdered;
  const isLowStock = item.Product_Stock?.quantity < totalOrdered;

  // 3. Row Management Functions
  const addRow = () => {
    setRows([...rows, { id: Date.now(), qty: 0, batch_id: null }]);
  };

  const removeRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const updateRow = (
    id: number,
    field: "qty" | "batch_id",
    value: number | null,
  ) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const newRow = { ...row, [field]: value };

        // validate qty AFTER any change
        const clamped = clampQtyToBatch(newRow.qty, newRow.batch_id, id);

        newRow.qty = clamped;

        return newRow;
      }),
    );
  };

  // 4. Submission Handler
  const handleConfirm = () => {
    // filter valid rows
    const validRows = rows.filter((r) => Number(r.qty) > 0 && r.batch_id);

    if (validRows.length === 0) {
      addToast("Select batch and quantity first", "error");
      return;
    }

    if (totalAllocated !== totalOrdered) {
      addToast(
        `Allocated ${totalAllocated} but order requires ${totalOrdered}`,
        "error",
      );
      return;
    }

    try {
      const data = validRows.map((r) => ({
        sales_order_item_id: item.id,
        stock_batch_id: r.batch_id,
        quantity: r.qty,
      }));

      add(data);

      // only lock UI after sending
      setSubmitted(true);
    } catch {
      addToast("Failed to allocate batches! Please reset.", "error");
    }
  };

  return (
    <div
      className={`bg-white border ${
        isLowStock ? "border-red-200" : "border-alabaster-grey"
      } rounded-xl shadow-sm transition-all ${submitted && "pointer-events-none"}`}
    >
      {/* Stock Warning Banner */}
      {isLowStock && (
        <div className="bg-red-50 px-3 py-1.5 flex items-center gap-2 border-b border-red-100 rounded-t-xl">
          <AlertCircle size={12} className="text-red-500" />
          <span className="text-red-600 text-[9px] font-bold uppercase tracking-wider">
            Insufficient Warehouse Stock
          </span>
        </div>
      )}

      <div className="p-4 md:p-5">
        {/* Header Grid: Responsive Product Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div className="col-span-2 md:col-span-1">
            <p className="text-[10px] font-bold uppercase text-slate-grey mb-0.5">
              Product Name
            </p>
            <p className="text-gunmetal font-bold text-base truncate">
              {item.Product_Stock?.Products?.name}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-grey mb-0.5">
              Size
            </p>
            <p className="text-iron-grey text-sm font-bold">
              {item.Product_Stock?.Bottle_Sizes?.size_ml}ml
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-grey mb-0.5">
              Ordered
            </p>
            <p className="text-gunmetal text-sm font-bold">
              {totalOrdered} units
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-grey mb-0.5">
              Available
            </p>
            <div className="flex items-center gap-1">
              <span
                className={`text-sm font-bold ${
                  isLowStock ? "text-red-500" : "text-green-600"
                }`}
              >
                {item.Product_Stock?.quantity}
              </span>
              {!isLowStock && (
                <CheckCircle2 size={12} className="text-green-600" />
              )}
            </div>
          </div>
        </div>

        {/* Batch Allocation Area */}
        <div className="bg-bright-snow p-3 md:p-4 rounded-lg border border-platinum">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Box size={14} className="text-slate-grey" />
              <h3 className="text-[10px] font-bold uppercase text-gunmetal">
                Batch Allocation
              </h3>
            </div>

            {/* Allocation Badge Status */}
            <div
              className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                isPerfectMatch
                  ? "bg-green-50 border-green-200 text-green-700"
                  : isOverAllocated
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-pale-slate/20 border-pale-slate text-slate-grey"
              }`}
            >
              {totalAllocated} / {totalOrdered} Allocated
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {rows.map((row, i) => (
              <div
                key={row.id}
                className="flex gap-2 items-center relative"
                style={{ zIndex: rows.length - i }}
              >
                <div className="flex gap-2 grow items-center">
                  {/* Batch Select Component */}
                  <div className="grow min-w-0">
                    <SimpleSelect
                      options={BatchData || []}
                      selectedId={row.batch_id}
                      onSelect={(val) => updateRow(row.id, "batch_id", val.id)}
                      onClear={() => updateRow(row.id, "batch_id", null)}
                      displayKey="batch_code,quantity"
                      idKey="id"
                      placeholder="Batch"
                    />
                  </div>

                  {/* Qty Input - Turns red on over-allocation */}
                  <div className="w-20 md:w-80 shrink-0">
                    <input
                      type="number"
                      value={row.qty || ""}
                      onChange={(e) =>
                        updateRow(row.id, "qty", Number(e.target.value))
                      }
                      className={`w-full bg-white border outline-none rounded-xl shadow-sm py-4 px-3 text-sm text-gunmetal transition-all ${
                        isOverAllocated
                          ? "border-red-300 focus:border-red-500"
                          : "border-alabaster-grey focus:border-gunmetal"
                      }`}
                      placeholder="Qty"
                    />
                  </div>
                </div>

                {/* Compact Action Buttons */}
                <div className="md:w-40 shrink-0 flex gap-1">
                  {i === 0 ? (
                    <button
                      type="button"
                      onClick={addRow}
                      className="w-full flex justify-center cursor-pointer bg-gunmetal p-3.5 rounded-lg hover:bg-shadow-grey transition-colors shadow-sm"
                    >
                      <Plus className="text-white" size={24} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="w-full flex justify-center cursor-pointer bg-white border border-red-100 p-3.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Minus className="text-red-500" size={24} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Validation Feedback Messages */}
          {isOverAllocated && (
            <p className="mt-2 text-[10px] text-red-500 font-bold flex items-center gap-1">
              <AlertCircle size={10} /> Total exceeds ordered quantity by{" "}
              {totalAllocated - totalOrdered} units.
            </p>
          )}
          {isPerfectMatch && (
            <p className="mt-2 text-[10px] text-green-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={10} /> Allocation quantity matched.
            </p>
          )}
        </div>

        {/* Global Save Button for the Item */}
        <div className="mt-4 flex justify-end">
          <button
            disabled={!isPerfectMatch || submitted}
            onClick={handleConfirm}
            className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-lg transition-all ${
              isPerfectMatch
                ? "bg-gunmetal text-white cursor-pointer shadow-md active:scale-95"
                : "bg-platinum text-pale-slate-2 cursor-not-allowed"
            }`}
          >
            <Save size={14} />
            Confirm Allocation
          </button>
        </div>
      </div>
    </div>
  );
}
