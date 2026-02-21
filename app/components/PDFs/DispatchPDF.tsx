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
  // Helper to get the base size (e.g., "90P" -> "90", "WC ml" -> "WC")
  const getBaseSize = (size: string) => {
    const match = size.match(/\d+/);
    return match ? match[0] : size.replace(" ml", "").trim();
  };

  // get unique base sizes
  const sizeMap = new Map<string, SizeCell>();

  rows.forEach((r) => {
    const baseSize = getBaseSize(r.size_ml);
    if (!sizeMap.has(baseSize)) {
      sizeMap.set(baseSize, {
        size_ml: baseSize,
        weight_kg: r.weight_kg,
        products: [],
        total_qty: 0,
      });
    }
  });

  const columns = Array.from(sizeMap.values()).sort((a, b) => {
    const aNum = parseInt(a.size_ml);
    const bNum = parseInt(b.size_ml);
    if (isNaN(aNum)) return 1;
    if (isNaN(bNum)) return -1;
    return aNum - bNum;
  });

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
    const baseSize = getBaseSize(row.size_ml);
    const sizeCell = customer.sizes.find((s) => s.size_ml === baseSize)!;

    // Append the suffix (P/G) to the product name if it exists and isn't WC
    const suffix = row.size_ml.replace(/\d+/g, "").replace(" ml", "").trim();
    const displayProductName =
      suffix && baseSize !== "WC"
        ? `${row.product_short_name} (${suffix})`
        : row.product_short_name;

    let product = sizeCell.products.find(
      (p) => p.product_short_name === displayProductName,
    );

    if (!product) {
      product = {
        product_short_name: displayProductName,
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

  // Adjusted weight calculation to handle mixed weights in one column
  const grandTotalWeight = rows.reduce(
    (acc, r) => acc + r.qty * r.weight_kg,
    0,
  );

  const gridTemplate = `1fr repeat(${columns.length}, 1fr) 80px`;

  const rowsHTML = data
    .map((row) => {
      // Weight calculated per row from the original rows for accuracy
      const rowWeight = rows
        .filter((r) => r.customer_name === row.customer_name)
        .reduce((acc, r) => acc + r.qty * r.weight_kg, 0);

      return `
      <div class="grid-row border-b" style="grid-template-columns: ${gridTemplate}">
        <div class="text-left bold border-right">${row.customer_name}</div>
        ${columns
          .map((col) => {
            const size = row.sizes.find((s) => s.size_ml === col.size_ml);
            if (!size || size.products.length === 0)
              return "<div class='border-right'></div>";
            return `
            <div class="flex-center flex-wrap gap-5 border-right">
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
          <div class="subtext">${rowWeight.toFixed(2)} kg</div>
        </div>
      </div>
    `;
    })
    .join("");

  const totalRowHTML = totalsBySize
    .map((size) => {
      return `
      <div class="flex-center flex-wrap gap-5 border-right">
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
        .border-right { border-right: 1px solid #000; height: 100%; }
      </style>
    </head>
    <body>
      <h2 style="text-align: center;">${info.title || "Dispatch"} - ${new Date().toLocaleDateString()}</h2>
      <div class="grid-container">
        <div class="grid-row header-row" style="grid-template-columns: ${gridTemplate}">
          <div class="border-right">Retailer</div>
          ${columns.map((c) => `<div class="text-center border-right">${c.size_ml}${isNaN(parseInt(c.size_ml)) ? "" : " ml"}</div>`).join("")}
          <div class="text-center">Total</div>
        </div>

        ${rowsHTML}

        <div class="grid-row total-footer" style="grid-template-columns: ${gridTemplate}">
          <div class="bold border-right">GRAND TOTAL</div>
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
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
