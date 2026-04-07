"use client";
import Error from "@/app/components/Error";
import Loader from "@/app/components/Loader";
import { createRequirementPDF } from "@/app/components/PDFs/RequiermentPDF";
import { useRequirement, useShortage } from "@/app/utils/hooks/useStock";
import { ArrowDownToLine } from "lucide-react";

export default function Requierment() {
  const { data: requirementData, isLoading, error } = useRequirement();

  if (isLoading) {
    return <Loader />;
  }

  if (error || !requirementData || requirementData.length <= 0) {
    return <Error error={error?.message || "No shortage"} />;
  }

  console.log(requirementData);

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-0 bg-bright-snow z-10 pt-6 md:pt-8 px-6 md:px-8">
          <div className="w-full flex items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gunmetal">
                Total Requirement
              </h1>
              <p className="text-slate-grey text-sm mt-1">
                Total Order Quantity.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  createRequirementPDF(requirementData);
                }}
                className="p-3 bg-white hover:bg-bright-snow rounded-xl border border-alabaster-grey cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ArrowDownToLine className="" />
              </button>
            </div>
          </div>

          <div className="py-4 bg-gunmetal text-bright-snow border border-alabaster-grey flex justify-between divide-x divide-alabaster-grey">
            {/* 1. Name: 4/12 mobile, 1/5 desktop */}
            <div className="basis-6/12 md:basis-2/4 flex items-center justify-left px-2">
              Product
            </div>
            {/* 2. Size: 2/12 mobile, 1/5 desktop */}
            <div className="basis-3/12 md:basis-1/4 flex items-center justify-center">
              Size
            </div>
            {/* 3. Batch: 3/12 mobile, 1/5 desktop */}
            <div className="basis-3/12 md:basis-1/4 flex items-center justify-center">
              <span className="md:hidden">R</span>
              <span className="hidden md:block">Required</span>
            </div>
          </div>
        </div>
        <div className="px-6 md:px-8">
          {requirementData?.map((item, i) => (
            <div
              key={i}
              className="py-4 bg-bright-snow border-b border-l border-r border-alabaster-grey flex justify-between divide-x divide-alabaster-grey"
            >
              {/* Matches Header Col 1 */}
              <div className="basis-6/12 md:basis-2/4 flex items-center justify-start px-2">
                {item.product_name}
              </div>

              {/* Matches Header Col 2 */}
              <div className="basis-3/12 md:basis-1/4 flex items-center justify-center">
                {item.size_ml}
              </div>

              {/* Matches Header Col 3 */}
              <div className="basis-3/12 md:basis-1/4 flex items-center justify-center font-extrabold">
                {item.total_required}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 md:px-8 pb-8">
          <div className="py-4 bg-gunmetal text-bright-snow font-extrabold border-b border-l border-r border-alabaster-grey flex justify-between divide-x divide-alabaster-grey">
            {/* Matches Header Col 1 */}
            <div className="basis-9/12 md:basis-3/4 flex items-center justify-start px-2">
              Total
            </div>

            {/* Matches Header Col 3 */}
            <div className="basis-3/12 md:basis-1/4 flex items-center justify-center">
              {requirementData.reduce(
                (acc, item) => acc + item.total_required,
                0,
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
