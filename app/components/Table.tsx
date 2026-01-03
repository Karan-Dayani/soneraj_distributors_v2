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
export const TableHeader = ({ sizes }: { sizes: string[] }) => (
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
          className="bg-iron-grey px-2 py-3 text-center text-xs font-bold tracking-wider uppercase border-b border-gunmetal border-r"
          style={{ minWidth: "80px" }}
        >
          {size}
        </th>
      ))}

      <th
        scope="col"
        className="bg-iron-grey px-2 py-3 w-16 border-b border-l border-gunmetal"
      >
        {/* Empty Header */}
      </th>
    </tr>
  </thead>
);
// ---------------------------------------------------------
// 2. THE BODY
// ---------------------------------------------------------
export const TableBody = ({
  rows,
  sizes,
}: {
  sizes: string[];
  rows: MatrixRow[];
}) => (
  <tbody className="bg-white">
    {rows.map((row) => (
      <tr
        key={row.id}
        className="border-b border-alabaster-grey last:border-b-0 hover:bg-bright-snow transition-colors duration-150"
      >
        {/* PRODUCT NAME (Standard Cell) */}
        <td className="px-4 py-4 text-sm font-bold text-gunmetal border-r border-alabaster-grey">
          {row.label}
        </td>

        {/* DATA CELLS */}
        {sizes.map((size) => {
          const cellContent = row.cells[size];
          return (
            <td
              key={`${row.id}-${size}`}
              className="px-2 py-4 text-center border-r border-alabaster-grey"
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
        <td className="px-2 py-4 text-center w-16">
          <div className="flex items-center justify-center">{row.action}</div>
        </td>
      </tr>
    ))}
  </tbody>
);

export const TableFooter = ({
  total,
  colSpanCount,
}: {
  total: number;
  colSpanCount: number;
}) => (
  <tfoot className="bg-platinum font-bold border-t-2 border-pale-slate sticky bottom-[-1] left-0">
    <tr>
      <td className="px-4 py-4 text-sm uppercase tracking-wider border-r border-pale-slate">
        Total
      </td>

      <td
        colSpan={1}
        className="px-2 py-4 text-left border-r border-pale-slate"
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm">{total}</span>
        </div>
      </td>

      <td colSpan={colSpanCount} className="px-2 py-4"></td>
    </tr>
  </tfoot>
);
