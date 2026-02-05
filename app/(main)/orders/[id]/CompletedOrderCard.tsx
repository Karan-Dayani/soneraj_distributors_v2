import { Box, Hash, Layers } from "lucide-react";

export default function CompletedOrderCard({ item }: any) {
  return (
    <div
      className={`bg-white border border-alabaster-grey rounded-xl shadow-sm transition-all`}
    >
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
            <p className="text-iron-grey text-sm font-medium">
              {item.Product_Stock?.Bottle_Sizes?.size_ml}ml
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-grey mb-0.5">
              Ordered
            </p>
            <p className="text-gunmetal text-sm font-bold">
              {item["quantity-ordered"]} units
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-grey mb-0.5">
              Available
            </p>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-bold text-green-600`}>
                {item.Product_Stock?.quantity}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full bg-white rounded-xl border border-platinum shadow-sm overflow-hidden">
          {/* Header Section */}
          <div className="px-5 py-4 bg-bright-snow border-b border-platinum flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-platinum text-slate-grey shadow-sm">
                <Box size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gunmetal leading-none">
                  Allocated Batches
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-platinum text-[10px] font-bold text-slate-grey">
              <Layers size={10} />
              <span>{item.Order_Item_Batches.length}</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5">
            {/* Column Headers */}
            <div className="flex gap-4 mb-2 px-3">
              <div className="w-16 text-center text-[10px] font-bold text-pale-slate-2 uppercase tracking-widest">
                Qty
              </div>
              <div className="grow text-[10px] font-bold text-pale-slate-2 uppercase tracking-widest pl-1">
                Batch Code
              </div>
            </div>

            {/* Batches List - Clean Read-Only Rows */}
            <div className="flex flex-col border border-platinum rounded-lg overflow-hidden divide-y divide-platinum">
              {item.Order_Item_Batches.map((row: any) => (
                <div
                  key={row.id}
                  className="flex gap-4 items-center px-3 py-3 bg-white hover:bg-bright-snow transition-colors group"
                >
                  {/* Quantity (Plain Text) */}
                  <div className="w-16 shrink-0 text-center">
                    <span className="font-mono font-bold text-sm text-gunmetal">
                      {row.quantity}
                    </span>
                  </div>

                  {/* Batch Code (Plain Text with Icon) */}
                  <div className="grow min-w-0 flex items-center gap-3">
                    <Hash
                      size={14}
                      className="text-pale-slate-2 group-hover:text-gunmetal transition-colors"
                    />
                    <span className="text-sm font-medium text-iron-grey font-mono truncate group-hover:text-gunmetal transition-colors">
                      {row.Stock_Batches.batch_code}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
