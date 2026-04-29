import { useState } from "react";

const INITIAL_ALERTS = [
  { id: 1, title: "Alert at 50% daily budget", sub: "Email notification", on: true },
  { id: 2, title: "Alert at 80% daily budget", sub: "Email notification", on: true },
  { id: 3, title: "Weekly performance digest",  sub: "Every Monday at 9 AM", on: false },
];

const INVOICES = [
  { number: "INV-0041", period: "March 2026",    amount: "$2,140.00", status: "Paid" },
  { number: "INV-0038", period: "February 2026", amount: "$1,870.00", status: "Paid" },
  { number: "INV-0035", period: "January 2026",  amount: "$1,540.00", status: "Paid" },
  { number: "INV-0032", period: "December 2025", amount: "$980.00",   status: "Paid" },
];

const TOP_UP_OPTIONS = ["$50", "$100", "$500", "$1,000"];

export default function BillingPage() {
  const [selectedTopUp, setSelectedTopUp] = useState("$50");
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const toggleAlert = (id) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, on: !a.on } : a)));

  const totalBudget = 1000;
  const remaining   = 341.60;
  const used        = totalBudget - remaining;
  const pct         = Math.round((remaining / totalBudget) * 100);

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <h1 className="text-2xl font-bold text-base-content">Billing</h1>
        <button className="btn btn-primary btn-sm">+ Add Funds</button>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Prepaid Balance */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
          <h2 className="text-base font-semibold text-base-content mb-4">Prepaid Balance</h2>
          <p className="text-4xl font-bold text-primary leading-tight">${remaining.toFixed(2)}</p>
          <p className="text-sm text-base-content/50 mt-1">remaining of ${totalBudget.toLocaleString()}</p>

          <div className="mt-4 w-full h-2.5 bg-base-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-base-content/50 mt-2">{pct}% remaining · ${used.toFixed(2)} used this cycle</p>

          <p className="text-xs text-base-content/50 mt-5 mb-2">Top up amount</p>
          <div className="flex items-center gap-2">
            {TOP_UP_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedTopUp(opt)}
                className={`btn btn-xs ${selectedTopUp === opt ? "btn-primary" : "btn-ghost"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Spend Alerts */}
        <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
          <h2 className="text-base font-semibold text-base-content mb-4">Spend Alerts</h2>
          <div className="space-y-0">
            {alerts.map((alert, idx) => (
              <div key={alert.id} className={`flex items-center justify-between py-4 ${idx < alerts.length - 1 ? "border-b border-base-300" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-base-content">{alert.title}</p>
                  <p className="text-xs text-base-content/50 mt-0.5">{alert.sub}</p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={alert.on}
                  onChange={() => toggleAlert(alert.id)}
                  aria-label={`Toggle ${alert.title}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300">
        <div className="px-6 py-4 border-b border-base-300">
          <h2 className="text-base font-semibold text-base-content">Invoice History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                {["Invoice #", "Period", "Amount", "Status", ""].map((h) => (
                  <th key={h} className="text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => (
                <tr key={inv.number} className="hover">
                  <td className="font-medium text-base-content">{inv.number}</td>
                  <td className="text-base-content/70">{inv.period}</td>
                  <td className="text-base-content/70">{inv.amount}</td>
                  <td><span className="badge badge-success badge-sm">{inv.status}</span></td>
                  <td><button className="text-sm text-primary hover:underline font-medium">Download PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
