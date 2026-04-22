export type SalesItem = {
  id?: number | string;
  name: string;
  address: string;
  username: string;
  total_quantity: number;
};

export const createSalesPDF = (salesData: SalesItem[]) => {
  const date = new Date().toLocaleDateString("en-GB");

  const rows = salesData
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.address}</td>
        <td>${item.username || "N/A"}</td>
        <td style="text-align: center;">${item.total_quantity}</td>
      </tr>
    `,
    )
    .join("");

  const totalQuantity = salesData.reduce(
    (sum, item) => sum + (Number(item.total_quantity) || 0),
    0,
  );

  const totalRow = `
      <tr>
        <td colspan="3" style="text-align: right; font-weight: bold;">Total Quantity</td>
        <td style="font-weight: bold; text-align: center;">${totalQuantity}</td>
      </tr>
    `;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sales Report - ${date}</title>
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
      <div class="title">Sales Report</div>
      <div class="date-sub">${date}</div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 30%;">Retailer Name</th>
            <th style="width: 40%;">Address</th>
            <th style="width: 15%;">Sales Rep</th>
            <th style="width: 15%; text-align: center;">Total Qty</th>
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
    printWindow.document.title = `Sales_Report_\${date.replace(/\\//g, "_")}`;
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
