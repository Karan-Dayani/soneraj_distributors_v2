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
            <p className="text-iron-grey font-bold text-sm">
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
          <div className="divide-y divide-platinum">
            {item.Order_Item_Batches.map((row: any) => (
              <div
                key={row.id}
                className="flex items-center px-4 py-2.5 hover:bg-bright-snow transition-colors group cursor-default"
              >
                {/* Batch Code */}
                <div className="flex items-center gap-2 text-gunmetal font-medium font-mono text-sm">
                  <Hash
                    size={14}
                    className="text-pale-slate-2 group-hover:text-slate-grey transition-colors shrink-0"
                  />
                  {row.Stock_Batches.batch_code}
                </div>

                {/* Dotted Connector - Solves visual separation on wide cards */}
                <div className="grow mx-3 border-b-2 border-dotted border-platinum relative -top-0.5"></div>

                {/* Quantity */}
                <div className="flex items-center gap-1.5 text-sm font-bold text-iron-grey font-mono">
                  {row.quantity}
                  <span className="text-[10px] font-normal text-pale-slate-2 font-sans">
                    qty
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
