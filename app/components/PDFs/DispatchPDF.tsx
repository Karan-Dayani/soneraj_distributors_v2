"use client";

export interface OrderRow {
  customer_name: string;
  product_short_name: string;
  size_ml: string;
  weight_kg: number;
  batch_code: string;
  qty: number;
}

export interface BatchQty {
  batch_code: string;
  qty: number;
}

export interface ProductCell {
  product_short_name: string;
  batches: BatchQty[];
  total_qty: number;
}

export interface SizeCell {
  size_ml: string;
  weight_kg: number;
  products: ProductCell[];
  total_qty: number;
}

export interface CustomerRow {
  customer_name: string;
  sizes: SizeCell[];
  total_qty: number;
}

export function buildCustomerTable(rows: OrderRow[]): {
  columns: SizeCell[]; // column meta
  data: CustomerRow[];
} {
  // get unique sizes
  const sizeMap = new Map<string, SizeCell>();

  rows.forEach((r) => {
    if (!sizeMap.has(r.size_ml)) {
      sizeMap.set(r.size_ml, {
        size_ml: r.size_ml,
        weight_kg: r.weight_kg,
        products: [],
        total_qty: 0,
      });
    }
  });

  const columns = Array.from(sizeMap.values()).sort(
    (a, b) => parseInt(a.size_ml) - parseInt(b.size_ml),
  );

  const customerMap = new Map<string, CustomerRow>();

  rows.forEach((row) => {
    if (!customerMap.has(row.customer_name)) {
      customerMap.set(row.customer_name, {
        customer_name: row.customer_name,
        sizes: columns.map((col) => ({
          size_ml: col.size_ml,
          weight_kg: col.weight_kg,
          products: [],
          total_qty: 0,
        })),
        total_qty: 0,
      });
    }

    const customer = customerMap.get(row.customer_name)!;

    const sizeCell = customer.sizes.find((s) => s.size_ml === row.size_ml)!;

    let product = sizeCell.products.find(
      (p) => p.product_short_name === row.product_short_name,
    );

    if (!product) {
      product = {
        product_short_name: row.product_short_name,
        batches: [],
        total_qty: 0,
      };
      sizeCell.products.push(product);
    }

    let batch = product.batches.find((b) => b.batch_code === row.batch_code);

    if (!batch) {
      batch = { batch_code: row.batch_code, qty: 0 };
      product.batches.push(batch);
    }

    batch.qty += row.qty;
    product.total_qty += row.qty;
    sizeCell.total_qty += row.qty;
    customer.total_qty += row.qty;
  });

  return {
    columns,
    data: Array.from(customerMap.values()),
  };
}

export const createDispatchPDF = (
  rows: OrderRow[],
  info: { title: string; name: string },
) => {
  const { columns, data } = buildCustomerTable(rows);

  // Calculate Grand Totals
  const totalsBySize: SizeCell[] = columns.map((col) => {
    const productMap: Record<string, ProductCell> = {};

    data.forEach((row: CustomerRow) => {
      const size = row.sizes.find((s) => s.size_ml === col.size_ml);
      if (!size) return;

      size.products.forEach((prod) => {
        if (!productMap[prod.product_short_name]) {
          productMap[prod.product_short_name] = {
            product_short_name: prod.product_short_name,
            batches: [],
            total_qty: 0,
          };
        }

        const productEntry = productMap[prod.product_short_name];

        prod.batches.forEach((batch) => {
          let batchEntry = productEntry.batches.find(
            (b) => b.batch_code === batch.batch_code,
          );

          if (!batchEntry) {
            batchEntry = { batch_code: batch.batch_code, qty: 0 };
            productEntry.batches.push(batchEntry);
          }

          batchEntry.qty += batch.qty;
          productEntry.total_qty += batch.qty;
        });
      });
    });

    const products = Object.values(productMap);

    const sizeTotal = products.reduce((acc, p) => acc + p.total_qty, 0);

    return {
      size_ml: col.size_ml,
      weight_kg: col.weight_kg ?? 0,
      products,
      total_qty: sizeTotal,
    };
  });

  const grandTotalQty = data.reduce((acc, row) => acc + row.total_qty, 0);
  const grandTotalWeight = data.reduce((acc, row) => {
    return (
      acc +
      row.sizes.reduce(
        (sAcc, size) => sAcc + size.total_qty * size.weight_kg,
        0,
      )
    );
  }, 0);

  // Helper to generate the Grid Template string
  const gridTemplate = `1fr repeat(${columns.length}, 1fr) 80px`;

  // Generate Rows HTML
  const rowsHTML = data
    .map((row, rowIndex) => {
      const totalWeight = row.sizes.reduce(
        (acc, size) => acc + size.total_qty * size.weight_kg,
        0,
      );

      return `
      <div class="grid-row border-b" style="grid-template-columns: ${gridTemplate}">
        <div class="text-left bold">${row.customer_name}</div>
        ${columns
          .map((col) => {
            const size = row.sizes.find((s) => s.size_ml === col.size_ml);
            if (!size) return "<div></div>";
            return `
            <div class="flex-center flex-wrap gap-5">
              ${size.products
                .map(
                  (prod) => `
                <div class="product-block">
                  ${prod.batches
                    .map(
                      (b) => `
                    <div class="batch-line">
                      ${b.batch_code ? `<span>${b.batch_code} / </span>` : ""}
                      <span class="bold">${b.qty}</span>
                    </div>
                  `,
                    )
                    .join("")}
                  <div class="separator"></div>
                  <div class="product-name bold">${prod.product_short_name}</div>
                </div>
              `,
                )
                .join("")}
            </div>`;
          })
          .join("")}
        <div class="text-center bold">
          <div>${row.total_qty}</div>
          <div class="subtext">${totalWeight.toFixed(2)} kg</div>
        </div>
      </div>
    `;
    })
    .join("");

  const totalRowHTML = totalsBySize
    .map((size) => {
      return `
      <div class="flex-center flex-wrap gap-5">
        ${size.products
          .map(
            (prod) => `
          <div class="product-block">
            ${prod.batches
              .map(
                (b) => `
              <div class="batch-line">
                ${b.batch_code ? `<span>${b.batch_code} / </span>` : ""}
                <span class="bold">${b.qty}</span>
              </div>
            `,
              )
              .join("")}
            <div class="separator"></div>
            <div class="product-name bold">${prod.product_short_name}</div>
          </div>
        `,
          )
          .join("")}
      </div>`;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${info.name || "Dispatch"} - ${new Date().toLocaleDateString()}</title>
      <style>
        @page { size: A4 landscape; margin: 0; }
        body { font-family: sans-serif; font-size: 16px; color: #333; }
        .grid-container { display: grid; width: 100%; }
        .grid-row { display: grid; align-items: center; padding: 10px 0; border-bottom: 1px solid #000; }
        .header-row { font-weight: bold; border-bottom: 2px solid #000; margin-bottom: 5px; }
        .flex-center { display: flex; justify-content: center; align-items: end; }
        .flex-wrap { flex-wrap: wrap; }
        .product-block { display: flex; flex-direction: column; align-items: center; min-width: 50px; margin-bottom: 5px; }
        .batch-line { font-size: 16px; }
        .separator { width: 80%; height: 1px; background: #000; margin: 4px 0; }
        .product-name { font-size: 13px; text-transform: uppercase; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
        .subtext { font-size: 14px; }
        .gap-5 { gap: 5px; }
        .total-footer { background: #f9f9f9; border-top: 2px solid #000; }
      </style>
    </head>
    <body>
      <h2 style="text-align: center;">${info.title || "Dispatch"} - ${new Date().toLocaleDateString()}</h2>
      <div class="grid-container">
        <div class="grid-row header-row" style="grid-template-columns: ${gridTemplate}">
          <div>Retailer</div>
          ${columns.map((c) => `<div class="text-center">${c.size_ml} ml</div>`).join("")}
          <div class="text-center">Total</div>
        </div>

        ${rowsHTML}

        <div class="grid-row total-footer" style="grid-template-columns: ${gridTemplate}">
          <div class="bold">GRAND TOTAL</div>
          ${totalRowHTML}
          <div class="text-center bold">
            <div style="font-size: 16px;">${grandTotalQty}</div>
            <div class="subtext">${grandTotalWeight.toFixed(2)} kg</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Give images/styles a moment to settle
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
