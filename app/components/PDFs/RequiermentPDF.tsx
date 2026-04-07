export type RequirementItem = {
  product_name: string;
  size_ml: string;
  total_required: number;
};

export const createRequirementPDF = (requirementData: RequirementItem[]) => {
  const date = new Date().toLocaleDateString("en-GB");

  const rows = requirementData
    .map(
      (item) => `
      <tr>
        <td>${item.product_name}</td>
        <td>${item.size_ml}</td>
        <td>${item.total_required}</td>
      </tr>
    `,
    )
    .join("");

  const totalQuantity = requirementData.reduce(
    (sum, item) => sum + item.total_required,
    0,
  );

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
      <title>Total Requirement - ${date}</title>
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
      <div class="title">Total Requirement</div>
      <div class="date-sub">${date}</div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 50%;">Product</th>
            <th style="width: 25%;">Size</th>
            <th style="width: 25%;">Required</th>
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
    printWindow.document.title = `Total_Requirement_${date.replace(/\//g, "_")}`;
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
