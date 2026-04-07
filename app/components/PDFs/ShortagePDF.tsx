export type ShortageItem = {
  product_name: string;
  size_ml: string;
  total_available: number;
  shortage: number;
};

export const createShortagePDF = (shortageData: ShortageItem[]) => {
  const date = new Date().toLocaleDateString("en-GB");

  const rows = shortageData
    .map(
      (item) => `
      <tr>
        <td>${item.product_name}</td>
        <td>${item.size_ml}</td>
        <td>${item.total_available}</td>
        <td>${item.shortage}</td>
      </tr>
    `,
    )
    .join("");

  const totalAvailable = shortageData.reduce(
    (sum, item) => sum + item.total_available,
    0,
  );

  const totalShortage = shortageData.reduce(
    (sum, item) => sum + item.shortage,
    0,
  );

  const totalRow = `
      <tr>
        <td colspan="2" style="text-align: right; font-weight: bold;">Total</td>
        <td style="font-weight: bold;">${totalAvailable}</td>
        <td style="font-weight: bold;">${totalShortage}</td>
      </tr>
    `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Shortage - ${date}</title>
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
      <div class="title">Shortage</div>
      <div class="date-sub">${date}</div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 40%;">Product</th>
            <th style="width: 20%;">Size</th>
            <th style="width: 20%;">Available</th>
            <th style="width: 20%;">Shortage</th>
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
    printWindow.document.title = `Shortage_${date.replace(/\//g, "_")}`;
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
