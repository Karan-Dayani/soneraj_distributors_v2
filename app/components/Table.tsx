import React from "react";

export type MatrixRow = {
  id: string | number;
  label: React.ReactNode;
  cells: Record<string, React.ReactNode>;
  action?: React.ReactNode;
};

// ---------------------------------------------------------
// 1. THE HEADER
// ---------------------------------------------------------
export const TableHeader = ({
  sizes,
  actionCell = true,
}: {
  sizes: string[];
  actionCell?: boolean;
}) => (
  <thead className="bg-iron-grey text-white sticky top-0">
    <tr>
      <th
        scope="col"
        className="bg-iron-grey px-4 py-3 text-left text-xs font-bold tracking-wider uppercase border-b border-gunmetal border-r"
        style={{ minWidth: "150px" }}
      >
        Product name
      </th>

      {sizes.map((size, i) => (
        <th
          key={i}
          scope="col"
          className="bg-iron-grey text-center text-xs font-bold tracking-wider uppercase border-b border-gunmetal border-r"
          style={{ minWidth: "50px" }}
        >
          {size}
        </th>
      ))}

      {actionCell && (
        <th
          scope="col"
          className="bg-iron-grey px-2 py-3 w-16 border-b border-gunmetal"
        >
          {/* Empty Header */}
        </th>
      )}
    </tr>
  </thead>
);
// ---------------------------------------------------------
// 2. THE BODY
// ---------------------------------------------------------
export const TableBody = ({
  rows,
  sizes,
  actionCell = true,
}: {
  sizes: string[];
  rows: MatrixRow[];
  actionCell?: boolean;
}) => (
  <tbody className="bg-white">
    {rows.map((row) => (
      <tr
        key={row.id}
        className="border-b border-alabaster-grey last:border-b-0 hover:bg-bright-snow transition-colors duration-150"
      >
        {/* PRODUCT NAME (Standard Cell) */}
        <td className="px-4 py-4 text-sm font-bold text-gunmetal border-b border-r border-alabaster-grey">
          {row.label}
        </td>

        {/* DATA CELLS */}
        {sizes.map((size) => {
          const cellContent = row.cells[size];
          return (
            <td
              key={`${row.id}-${size}`}
              className="text-center border-b border-r border-alabaster-grey"
            >
              {cellContent ? (
                cellContent
              ) : (
                <span className="text-pale-slate-2 text-lg select-none">
                  &mdash;
                </span>
              )}
            </td>
          );
        })}

        {/* ACTION COLUMN */}
        {actionCell && (
          <td className="px-2 py-4 text-center w-16 border-b border-alabaster-grey">
            <div className="flex items-center justify-center">{row.action}</div>
          </td>
        )}
      </tr>
    ))}
  </tbody>
);

export const TableFooter = ({
  total,
  colSpanCount, // This should equal sizes.length
  actionCell = true, // Pass this prop so it matches Body/Header!
}: {
  total: number;
  colSpanCount: number;
  actionCell?: boolean;
}) => (
  // Use bottom-0 for standard sticky footer
  <tfoot className="bg-platinum font-bold border-t-2 border-pale-slate sticky bottom-0 z-10">
    <tr>
      {/* 1. Label Column */}
      <td className="px-4 py-4 text-shodow-grey text-sm font-black uppercase tracking-wider border-r border-pale-slate bg-platinum">
        Total
      </td>

      {/* 2. Total Value Column (Spans ALL sizes) */}
      <td
        colSpan={colSpanCount}
        className="px-2 py-4 border-r border-pale-slate text-left"
      >
        <span className=" text-shodow-grey px-3 py-1 rounded-md text-sm font-black">
          {total}
        </span>
      </td>

      {/* 3. Action Column (Conditional) */}
      {actionCell && (
        <td className="px-2 py-4 bg-platinum border-pale-slate"></td>
      )}
    </tr>
  </tfoot>
);
