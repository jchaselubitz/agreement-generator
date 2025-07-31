// Date fields will be blank by default - users must select dates

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

// Tab Navigation
function initializeTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.getAttribute("data-tab");

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      button.classList.add("active");
      document.getElementById(`${targetTab}-tab`).classList.add("active");
    });
  });
}

// Update contract display when form fields change
function updateContractDisplay(fieldId, value) {
  const displayIds = fieldMappings[fieldId];
  if (displayIds) {
    displayIds.forEach((displayId) => {
      const element = document.getElementById(displayId);
      if (element) {
        if (value.trim() === "") {
          // For date and email fields, show blank space for writing in
          if (fieldId.includes("date") || fieldId.includes("email")) {
            element.innerHTML = '<span class="blank-field"></span>';
          } else {
            element.textContent = `[${fieldId
              .replace("_", " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}]`;
          }
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

// Calculator Configuration
const ANNUAL_RATE = 0.1; // 10% per annum
const MONTHLY_RATE = ANNUAL_RATE / 12;
const END_DATE = new Date(2027, 7, 1); // JS months are 0-based: 7 → August
const PAYEES = ["Jake", "Parents", "Alex"];

let drawsState = [];
let paymentsState = [];

// Calculator Helper Functions
function firstOfNextMonth(from) {
  const year =
    from.getMonth() === 11 ? from.getFullYear() + 1 : from.getFullYear();
  const month = (from.getMonth() + 1) % 12;
  return new Date(year, month, 1);
}

function monthsBetween(from, to) {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    1 // include the month of "to" as a payment
  );
}

function monthsDiff(from, to) {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth())
  );
}

function addMonths(date, months) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function monthlyPayment(principal, nMonths) {
  const r = MONTHLY_RATE;
  // standard amortization formula: P * [r (1+r)^N] / [(1+r)^N – 1]
  return (
    (principal * (r * Math.pow(1 + r, nMonths))) /
    (Math.pow(1 + r, nMonths) - 1)
  );
}

// Calculator UI Functions
function initializeCalculator() {
  const addDrawBtn = document.getElementById("add_draw");
  const addPaymentBtn = document.getElementById("add_payment");

  if (addDrawBtn) {
    addDrawBtn.addEventListener("click", () => {
      drawsState.push({ amount: "", date: "", payee: PAYEES[0] });
      renderDraws();
    });
  }

  if (addPaymentBtn) {
    addPaymentBtn.addEventListener("click", () => {
      paymentsState.push({ amount: "", date: "", payee: PAYEES[0] });
      renderPayments();
    });
  }

  if (drawsState.length === 0) {
    drawsState.push({ amount: "", date: "", payee: PAYEES[0] });
  }

  renderDraws();
  renderPayments();
}

function renderDraws() {
  const container = document.getElementById("draws-container");
  container.innerHTML = "";
  const payeeOptions = PAYEES.map(
    (p) => `<option value="${p}">${p}</option>`
  ).join("");

  drawsState.forEach((draw, index) => {
    const drawGroup = document.createElement("div");
    drawGroup.className = "draw-input-group";
    drawGroup.innerHTML = `
      <h4>Draw #${index + 1}</h4>
      <div class="draw-input-row">
        <div class="form-group">
          <label for="draw_amount_${index}">Amount (USD)</label>
          <input type="number" id="draw_amount_${index}" placeholder="5000" min="3000" step="100" value="${draw.amount || ""}" />
        </div>
        <div class="form-group">
          <label for="draw_date_${index}">Date</label>
          <input type="date" id="draw_date_${index}" value="${draw.date || ""}" />
        </div>
        <div class="form-group">
          <label for="draw_payee_${index}">Payee</label>
          <select id="draw_payee_${index}">${payeeOptions}</select>
        </div>
        <button type="button" class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;
    container.appendChild(drawGroup);

    document.getElementById(`draw_payee_${index}`).value = draw.payee || PAYEES[0];
    document
      .getElementById(`draw_amount_${index}`)
      .addEventListener("input", (e) => {
        drawsState[index].amount = e.target.value;
      });
    document
      .getElementById(`draw_date_${index}`)
      .addEventListener("change", (e) => {
        drawsState[index].date = e.target.value;
      });
    document
      .getElementById(`draw_payee_${index}`)
      .addEventListener("change", (e) => {
        drawsState[index].payee = e.target.value;
      });
    drawGroup.querySelector(".delete-btn").addEventListener("click", () => {
      drawsState.splice(index, 1);
      renderDraws();
    });
  });
}

function renderPayments() {
  const container = document.getElementById("payments-container");
  container.innerHTML = "";
  const payeeOptions = PAYEES.map(
    (p) => `<option value="${p}">${p}</option>`
  ).join("");

  paymentsState.forEach((payment, index) => {
    const paymentGroup = document.createElement("div");
    paymentGroup.className = "draw-input-group";
    paymentGroup.innerHTML = `
      <h4>Payment #${index + 1}</h4>
      <div class="draw-input-row">
        <div class="form-group">
          <label for="payment_amount_${index}">Amount (USD)</label>
          <input type="number" id="payment_amount_${index}" placeholder="500" step="0.01" min="0" value="${payment.amount || ""}" />
        </div>
        <div class="form-group">
          <label for="payment_date_${index}">Date</label>
          <input type="date" id="payment_date_${index}" value="${payment.date || ""}" />
        </div>
        <div class="form-group">
          <label for="payment_payee_${index}">Payee</label>
          <select id="payment_payee_${index}">${payeeOptions}</select>
        </div>
        <button type="button" class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;
    container.appendChild(paymentGroup);

    document.getElementById(`payment_payee_${index}`).value = payment.payee || PAYEES[0];
    document
      .getElementById(`payment_amount_${index}`)
      .addEventListener("input", (e) => {
        paymentsState[index].amount = e.target.value;
      });
    document
      .getElementById(`payment_date_${index}`)
      .addEventListener("change", (e) => {
        paymentsState[index].date = e.target.value;
      });
    document
      .getElementById(`payment_payee_${index}`)
      .addEventListener("change", (e) => {
        paymentsState[index].payee = e.target.value;
      });
    paymentGroup.querySelector(".delete-btn").addEventListener("click", () => {
      paymentsState.splice(index, 1);
      renderPayments();
    });
  });
}

function exportCSV() {
  const rows = [["type", "amount", "date", "payee"]];

  drawsState.forEach((d) => {
    if (d.amount && d.date) {
      rows.push(["draw", d.amount, d.date, d.payee]);
    }
  });

  paymentsState.forEach((p) => {
    if (p.amount && p.date) {
      rows.push(["payment", p.amount, p.date, p.payee]);
    }
  });

  if (rows.length === 1) {
    alert("No draws or payments to export.");
    return;
  }

  const csvContent = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importCSV(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const text = e.target.result;
    const lines = text.trim().split(/\r?\n/).slice(1);
    drawsState = [];
    paymentsState = [];

    lines.forEach((line) => {
      const [type, amount, date, payee] = line.split(",");
      if (type === "draw") {
        drawsState.push({ amount, date, payee });
      } else if (type === "payment") {
        paymentsState.push({ amount, date, payee });
      }
    });

    if (drawsState.length === 0) {
      drawsState.push({ amount: "", date: "", payee: PAYEES[0] });
    }

    renderDraws();
    renderPayments();
  };

  reader.readAsText(file);
  event.target.value = "";
}

function calculatePayments() {
  const draws = drawsState
    .filter((d) => d.amount && d.date)
    .map((d) => ({
      amount: parseFloat(d.amount),
      date: new Date(d.date),
      payee: d.payee,
    }));

  if (draws.length === 0) {
    alert("Please enter at least one draw with amount and date.");
    return;
  }

  const payments = paymentsState
    .filter((p) => p.amount && p.date)
    .map((p) => ({
      amount: parseFloat(p.amount),
      date: new Date(p.date),
      payee: p.payee,
    }));

  // Calculate next due date
  const today = new Date();
  const nextDue = firstOfNextMonth(today);

  // Build draw breakdown
  const drawBreakdowns = [];
  for (const { amount, date, payee } of draws) {
    const firstPay = firstOfNextMonth(date);
    if (nextDue < firstPay) {
      drawBreakdowns.push({
        amount,
        date,
        payee,
        firstPayment: firstPay,
        monthlyPayment: 0,
        status: "Not yet due",
      });
      continue;
    }
    const nRem = monthsBetween(nextDue, END_DATE);
    const pmt = monthlyPayment(amount, nRem);
    drawBreakdowns.push({
      amount,
      date,
      payee,
      firstPayment: firstPay,
      monthlyPayment: pmt,
      status: "Active",
    });
  }

  // Compute balance and payment breakdown
  const events = [
    ...draws.map((d) => ({ type: "draw", ...d })),
    ...payments.map((p) => ({ type: "payment", ...p })),
  ].sort((a, b) => a.date - b.date);

  const payeeTotals = {};
  PAYEES.forEach((p) => (payeeTotals[p] = { balance: 0, interestDue: 0 }));
  events.forEach((e) => {
    if (!payeeTotals[e.payee]) {
      payeeTotals[e.payee] = { balance: 0, interestDue: 0 };
    }
  });

  let balance = 0;
  let interestDue = 0;
  const paymentBreakdowns = [];
  let lastDate = events[0] ? events[0].date : today;

  for (const ev of events) {
    const monthsPassed = monthsDiff(lastDate, ev.date);
    if (monthsPassed > 0) {
      for (const p in payeeTotals) {
        const interestAccrued =
          payeeTotals[p].balance *
          (Math.pow(1 + MONTHLY_RATE, monthsPassed) - 1);
        payeeTotals[p].interestDue += interestAccrued;
        interestDue += interestAccrued;
      }
      lastDate = addMonths(lastDate, monthsPassed);
    }

    if (ev.type === "draw") {
      balance += ev.amount;
      payeeTotals[ev.payee].balance += ev.amount;
    } else {
      let remaining = ev.amount;
      const payeeData = payeeTotals[ev.payee];
      const interestPaid = Math.min(payeeData.interestDue, remaining);
      payeeData.interestDue -= interestPaid;
      interestDue -= interestPaid;
      remaining -= interestPaid;
      const principalPaid = Math.min(payeeData.balance, remaining);
      payeeData.balance -= principalPaid;
      balance -= principalPaid;
      paymentBreakdowns.push({
        amount: ev.amount,
        date: ev.date,
        interestPaid,
        principalPaid,
        payee: ev.payee,
      });
    }
  }

  const monthsToToday = monthsDiff(lastDate, today);
  if (monthsToToday > 0) {
    for (const p in payeeTotals) {
      const interestAccrued =
        payeeTotals[p].balance *
        (Math.pow(1 + MONTHLY_RATE, monthsToToday) - 1);
      payeeTotals[p].interestDue += interestAccrued;
      interestDue += interestAccrued;
    }
    lastDate = addMonths(lastDate, monthsToToday);
  }

  const payeeBalances = {};
  for (const p in payeeTotals) {
    payeeBalances[p] = payeeTotals[p].balance + payeeTotals[p].interestDue;
  }

  const currentBalance = balance + interestDue;

  // Update UI
  updateCalculatorDisplay(
    nextDue,
    currentBalance,
    drawBreakdowns,
    paymentBreakdowns,
    payeeBalances
  );

  // Show success message
  const message = document.getElementById("calculatorMessage");
  message.textContent = "Calculation complete!";
  message.classList.add("show");
  setTimeout(() => message.classList.remove("show"), 3000);
}

function updateCalculatorDisplay(
  nextDue,
  currentBalance,
  drawBreakdowns,
  paymentBreakdowns,
  payeeBalances
) {
  // Update summary section
  document.getElementById("nextDueDate").textContent = nextDue
    .toISOString()
    .slice(0, 10);
  document.getElementById(
    "currentBalance"
  ).textContent = `$${currentBalance.toFixed(2)}`;
  const payeeContainer = document.getElementById("payeeSummary");
  payeeContainer.innerHTML = "";
  Object.entries(payeeBalances).forEach(([p, amt]) => {
    const line = document.createElement("p");
    line.textContent = `${p}: $${amt.toFixed(2)}`;
    payeeContainer.appendChild(line);
  });

  // Update draw breakdown
  const breakdownContainer = document.getElementById("drawsBreakdown");
  breakdownContainer.innerHTML = "";

  drawBreakdowns.forEach((draw, index) => {
    const drawItem = document.createElement("div");
    drawItem.className = "draw-item";
    drawItem.innerHTML = `
      <h4>Draw #${index + 1}</h4>
      <div class="draw-details">
        <div class="draw-detail">
          <strong>Amount:</strong>
          <span>$${draw.amount.toLocaleString()}</span>
        </div>
        <div class="draw-detail">
          <strong>Draw Date:</strong>
          <span>${draw.date.toISOString().slice(0, 10)}</span>
        </div>
        <div class="draw-detail">
          <strong>Payee:</strong>
          <span>${draw.payee}</span>
        </div>
        <div class="draw-detail">
          <strong>First Payment:</strong>
          <span>${draw.firstPayment.toISOString().slice(0, 10)}</span>
        </div>
        <div class="draw-detail">
          <strong>Monthly Payment:</strong>
          <span>$${draw.monthlyPayment.toFixed(2)}</span>
        </div>
        <div class="draw-detail">
          <strong>Status:</strong>
          <span>${draw.status}</span>
        </div>
      </div>
    `;
    breakdownContainer.appendChild(drawItem);
  });

  // Update payment breakdown
  const paymentContainer = document.getElementById("paymentsBreakdown");
  paymentContainer.innerHTML = "";

  paymentBreakdowns.forEach((pay, index) => {
    const payItem = document.createElement("div");
    payItem.className = "draw-item";
    payItem.innerHTML = `
      <h4>Payment #${index + 1}</h4>
      <div class="draw-details">
        <div class="draw-detail">
          <strong>Amount:</strong>
          <span>$${pay.amount.toFixed(2)}</span>
        </div>
        <div class="draw-detail">
          <strong>Date:</strong>
          <span>${pay.date.toISOString().slice(0, 10)}</span>
        </div>
        <div class="draw-detail">
          <strong>Payee:</strong>
          <span>${pay.payee}</span>
        </div>
        <div class="draw-detail">
          <strong>Interest Paid:</strong>
          <span>$${pay.interestPaid.toFixed(2)}</span>
        </div>
        <div class="draw-detail">
          <strong>Principal Paid:</strong>
          <span>$${pay.principalPaid.toFixed(2)}</span>
        </div>
      </div>
    `;
    paymentContainer.appendChild(payItem);
  });
}

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

                .field {
                    margin-bottom: 10px;
                    margin-top: 10px;
                    display: block;
                    align-items: center;
                }
                
                .field-highlight {
                    background: #f8f9fa;
                    padding: 2px 6px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    font-weight: bold;
                    display: inline-block;
                    min-width: 220px;
                    min-height: 1.5rem;
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
                    border: 1px solid #ddd;
                    margin-top: 20px;
                    page-break-inside: avoid;
                }
                
                .signature-block {
                    margin-bottom: 25px;
                }
                
                .signature-line {
                    border-bottom: 1px solid black;
                    width: 350px;
                    height: 2.5rem;
                    display: block;
                    margin: 10px 0 0 0;
                }
                
                .blank-field {
                    border-bottom: 1px solid black;
                    width: 200px;
                    height: 5rem;
                    display: inline-block;
                    margin: 0 0.25rem;
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

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initializeTabs();
  initializeCalculator();
});
