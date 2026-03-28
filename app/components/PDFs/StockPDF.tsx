type RawStockItem = {
  id: number;
  quantity: number;
  Products: {
    name: string; //1
    short_name: string | null;
  };
  Bottle_Sizes: {
    name: string | null;
    size_ml: string; //2
  };
  Stock_Batches: {
    id: number;
    batch_code: string; //3
    quantity: number; //4
    created_at: string;
  }[];
};

export const createStockPDF = (stockData: RawStockItem[]) => {
  const date = new Date().toLocaleDateString("en-GB");

  // Flatten the data so every batch is a separate row
  const rows = stockData
    .flatMap((item) => {
      if (item.Stock_Batches.length === 0) {
        return `
        <tr>
          <td>${item.Products.name} (${item.Bottle_Sizes.size_ml})</td>
          <td>-</td>
          <td>0</td>
        </tr>`;
      }

      return item.Stock_Batches.map(
        (batch) => `
      <tr>
        <td>${item.Products.name} (${item.Bottle_Sizes.size_ml})</td>
        <td>${batch.batch_code}</td>
        <td>${batch.quantity}</td>
      </tr>
    `,
      );
    })
    .join("");
  const totalQuantity = stockData.reduce((sum, item) => {
    return (
      sum +
      item.Stock_Batches.reduce(
        (batchSum, batch) => batchSum + batch.quantity,
        0,
      )
    );
  }, 0);

  const totalRow = `
      <tr>
        <td colspan="2" style="text-align: right; font-weight: bold;">Total</td>
        <td style="font-weight: bold;">${totalQuantity}</td>
      </tr>
    `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Stock Inventory - ${date}</title>
      <style>
        @page { size: A4; margin: 10mm; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          color: #000; 
          margin: 0; 
          padding: 20px; 
        }
        
        .title { 
          font-size: 20px; 
          font-weight: bold; 
          margin-bottom: 5px; 
        }
        
        .date-sub { 
          font-size: 14px; 
          margin-bottom: 20px;
        }

        table { 
          width: 100%; 
          border-collapse: collapse; 
          border: 1px solid #bcbcbc; 
        }
        
        th { 
          background-color: #e2e2e2; 
          color: #000; 
          font-weight: bold; 
          border: 1px solid #bcbcbc; 
          padding: 8px; 
          text-align: left;
          font-size: 13px;
        }
        
        td { 
          border: 1px solid #bcbcbc; 
          padding: 6px 8px; 
          font-size: 13px;
          font-weight: 500;
        }

        /* Excel alternating row effect */
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }

        tr:hover {
          background-color: #f1f1f1;
        }
      </style>
    </head>
    <body>
      <div class="title">Stock</div>
      <div class="date-sub">${date}</div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Product Name (Size)</th>
            <th style="width: 30%;">Batch Code</th>
            <th style="width: 20%;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          ${totalRow}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.title = `Stock_Inventory_${date.replace(/ /g, "_")}`;
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
