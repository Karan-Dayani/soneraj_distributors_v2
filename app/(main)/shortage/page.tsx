"use client";
import Error from "@/app/components/Error";
import Loader from "@/app/components/Loader";
import { createShortagePDF } from "@/app/components/PDFs/ShortagePDF";
import { useShortage } from "@/app/utils/hooks/useStock";
import { ArrowDownToLine } from "lucide-react";

export default function Shortage() {
  const { data: shortageData, isLoading, error } = useShortage();

  if (isLoading) {
    return <Loader />;
  }

  if (error || !shortageData || shortageData.length <= 0) {
    return <Error error={error?.message || "No shortage"} />;
  }

  console.log(shortageData);

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-0 bg-bright-snow z-10 pt-6 md:pt-8 px-6 md:px-8">
          <div className="w-full flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gunmetal">Shortage</h1>
              <p className="text-slate-grey text-sm mt-1">
                Buy these distillery units.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  createShortagePDF(shortageData);
                }}
                className="p-3 bg-white hover:bg-bright-snow rounded-xl border border-alabaster-grey cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ArrowDownToLine className="" />
              </button>
            </div>
          </div>

          <div className="py-4 bg-gunmetal text-bright-snow border border-alabaster-grey flex justify-between divide-x divide-alabaster-grey">
            {/* 1. Name: 4/12 mobile, 1/5 desktop */}
            <div className="basis-4/10 md:basis-1/4 flex items-center justify-left px-2">
              Product
            </div>
            {/* 2. Size: 2/12 mobile, 1/5 desktop */}
            <div className="basis-2/10 md:basis-1/4 flex items-center justify-center">
              Size
            </div>

            {/* 4. Qty: 2/12 mobile, 1/5 desktop */}
            <div className="basis-2/10 md:basis-1/4 flex items-center justify-center">
              <span className="md:hidden">A</span>
              <span className="hidden md:block">Available</span>
            </div>
            {/* 5. Edit: 1/12 mobile, 1/5 desktop */}
            <div className="basis-2/10 md:basis-1/4 flex items-center justify-center px-2">
              <span className="md:hidden">S</span>
              <span className="hidden md:block">Shortage</span>
            </div>
          </div>
        </div>
        <div className="px-6 md:px-8">
          {shortageData?.map((item, i) => (
            <div
              key={i}
              className="py-4 bg-bright-snow border-b border-l border-r border-alabaster-grey flex justify-between divide-x divide-alabaster-grey"
            >
              {/* Matches Header Col 1 */}
              <div className="basis-4/10 md:basis-1/4 flex items-center justify-start px-2">
                {item.product_name}
              </div>

              {/* Matches Header Col 2 */}
              <div className="basis-2/10 md:basis-1/4 flex items-center justify-center">
                {item.size_ml}
              </div>

              {/* Matches Header Col 4 */}
              <div className="basis-2/10 md:basis-1/4 flex items-center justify-center">
                {item.total_available}
              </div>

              {/* Matches Header Col 5 */}
              <div className="basis-2/10 md:basis-1/4 flex items-center justify-center font-extrabold">
                {item.shortage}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 md:px-8 pb-8">
          <div className="py-4 bg-gunmetal text-bright-snow font-extrabold border-b border-l border-r border-alabaster-grey flex justify-between divide-x divide-alabaster-grey">
            {/* Matches Header Col 1 */}
            <div className="basis-6/10 md:basis-2/4 flex items-center justify-start px-2">
              Total
            </div>

            {/* Matches Header Col 4 */}
            <div className="basis-2/10 md:basis-1/4 flex items-center justify-center">
              {shortageData.reduce(
                (acc, item) => acc + item.total_available,
                0,
              )}
            </div>

            {/* Matches Header Col 5 */}
            <div className="basis-2/10 md:basis-1/4 flex items-center justify-center font-extrabold">
              {shortageData.reduce((acc, item) => acc + item.shortage, 0)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
