// Set today's date as default
const today = new Date().toISOString().split("T")[0];
document.getElementById("lender_date").value = today;
document.getElementById("borrower_date").value = today;

// Form field mappings
const fieldMappings = {
  lender_name: ["display_lender_name", "display_lender_name_sig"],
  lender_address: ["display_lender_address"],
  lender_email: ["display_lender_email"],
  borrower_name: ["display_borrower_name", "display_borrower_name_sig"],
  borrower_business: ["display_borrower_business"],
  borrower_address: ["display_borrower_address"],
  borrower_email: ["display_borrower_email"],
  credit_limit: ["display_credit_limit"],
  lender_date: ["display_lender_date"],
  borrower_date: ["display_borrower_date"],
};

// Update contract display when form fields change
function updateContractDisplay(fieldId, value) {
  const displayIds = fieldMappings[fieldId];
  if (displayIds) {
    displayIds.forEach((displayId) => {
      const element = document.getElementById(displayId);
      if (element) {
        if (value.trim() === "") {
          element.textContent = `[${fieldId
            .replace("_", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}]`;
        } else {
          if (fieldId === "credit_limit") {
            element.textContent = parseInt(value).toLocaleString();
          } else {
            element.textContent = value;
          }
        }
      }
    });
  }
}

// Add event listeners to all form fields
Object.keys(fieldMappings).forEach((fieldId) => {
  const element = document.getElementById(fieldId);
  if (element) {
    element.addEventListener("input", (e) => {
      updateContractDisplay(fieldId, e.target.value);
    });
    element.addEventListener("change", (e) => {
      updateContractDisplay(fieldId, e.target.value);
    });
  }
});

// PDF Export Function using browser print
function exportToPDF() {
  const button = document.querySelector(".export-btn");
  const successMessage = document.getElementById("successMessage");

  // Show loading state
  button.classList.add("loading");
  button.textContent = "Preparing PDF...";

  // Validate required fields
  const requiredFields = ["lender_name", "borrower_name", "credit_limit"];
  const missingFields = [];

  requiredFields.forEach((fieldId) => {
    const element = document.getElementById(fieldId);
    if (!element || !element.value.trim()) {
      missingFields.push(
        fieldId.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
      );
    }
  });

  if (missingFields.length > 0) {
    alert(
      `Please fill in the following required fields:\n• ${missingFields.join(
        "\n• "
      )}`
    );
    button.classList.remove("loading");
    button.textContent = "🖨️ Generate PDF";
    return;
  }

  // Create a temporary print window with just the contract
  const printWindow = window.open("", "_blank");
  const contractContent = document.getElementById("contractContent").innerHTML;
  const contractTitle = document.querySelector(".contract-title").innerHTML;

  // Get current form values for filename
  const borrowerName =
    document.getElementById("borrower_name").value || "Draft";
  const currentDate = new Date().toISOString().split("T")[0];

  printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Line of Credit Agreement - ${borrowerName}</title>
            <style>
                body {
                    font-family: 'Times New Roman', serif;
                    line-height: 1.6;
                    color: black;
                    margin: 0.5in;
                    font-size: 12pt;
                }
                
                h1 {
                    font-size: 18pt;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid black;
                }
                
                h3 {
                    font-size: 14pt;
                    font-weight: bold;
                    margin: 25px 0 15px 0;
                    page-break-after: avoid;
                }
                
                p {
                    margin-bottom: 12px;
                    text-align: justify;
                }
                
                ul {
                    margin: 15px 0;
                    padding-left: 20px;
                }
                
                li {
                    margin-bottom: 6px;
                }
                
                .field-highlight {
                    background: #f8f9fa;
                    padding: 2px 6px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    font-weight: bold;
                    display: inline-block;
                    min-width: 80px;
                    text-align: center;
                }
                
                .section-divider {
                    border: none;
                    height: 1px;
                    background: black;
                    margin: 20px 0;
                    page-break-after: avoid;
                }
                
                .signature-section {
                    background: #fafafa;
                    padding: 20px;
                    border: 1px solid #ddd;
                    margin-top: 30px;
                    page-break-inside: avoid;
                }
                
                .signature-block {
                    margin-bottom: 25px;
                }
                
                .signature-line {
                    border-bottom: 1px solid black;
                    width: 250px;
                    height: 16px;
                    display: inline-block;
                    margin: 0 5px;
                }
                
                .footer-text {
                    text-align: center;
                    font-style: italic;
                    margin-top: 30px;
                    font-size: 10pt;
                    color: #666;
                }
                
                @page {
                    margin: 0.75in;
                    size: letter;
                }
                
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <h1>${contractTitle}</h1>
            <div class="contract-content">
                ${contractContent}
            </div>
        </body>
        </html>
    `);

  printWindow.document.close();

  // Wait for content to load then trigger print
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();

    // Clean up and show success
    setTimeout(() => {
      printWindow.close();
      button.classList.remove("loading");
      button.textContent = "🖨️ Generate PDF";
      successMessage.textContent =
        "PDF ready! Use your browser's print dialog to save as PDF.";
      successMessage.classList.add("show");

      setTimeout(() => {
        successMessage.classList.remove("show");
      }, 5000);
    }, 1000);
  }, 500);
}
