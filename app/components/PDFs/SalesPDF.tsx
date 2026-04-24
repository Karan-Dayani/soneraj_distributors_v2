export const createSalesPDF = (salesData: any[], sortedMonths: string[]) => {
  const date = new Date().toLocaleDateString("en-GB");

  const monthNamesShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthHeaders = sortedMonths
    .map((m) => {
      const [year, month] = m.split("-");
      const formattedHeader = `${monthNamesShort[parseInt(month) - 1]}-${year.slice(2)}`;
      return `<th style="text-align: center;">${formattedHeader}</th>`;
    })
    .join("");

  const headerRow = `
    <tr>
      <th style="width: 50%;">Name / Details</th>
      ${monthHeaders}
    </tr>
  `;

  const rows = salesData
    .map((item) => {
      const nameCol = `
          <div style="font-weight: bold; font-size: 13px;">${item.name || ""}</div>
          <div style="font-size: 11px; color: #555; margin-top: 2px;">
             Route: ${item.route_no || "N/A"} | Rep: ${item.username || "N/A"}
          </div>
          <div style="font-size: 11px; color: #777; margin-top: 2px;">${item.address || ""}</div>
        `;

      const monthCols = sortedMonths
        .map(
          (m) => `
          <td style="text-align: center; vertical-align: middle;">${item[m] || 0}</td>
        `,
        )
        .join("");

      return `
        <tr>
          <td>${nameCol}</td>
          ${monthCols}
        </tr>
      `;
    })
    .join("");

  const totalCols = sortedMonths
    .map((m) => {
      const sum = salesData.reduce(
        (acc, item) => acc + (Number(item[m]) || 0),
        0,
      );
      return `<td style="font-weight: bold; text-align: center;">${sum}</td>`;
    })
    .join("");

  const totalRow = `
      <tr>
        <td style="text-align: right; font-weight: bold;">Grand Total</td>
        ${totalCols}
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
          vertical-align: top;
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
          ${headerRow}
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
