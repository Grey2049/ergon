import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ── Sidebar nav ── */
const NAV_ITEMS = [
  { label: "Dashboard",    to: "/campaign-dashboard" },
  { label: "Campaigns",    to: "/campaign-dashboard" },
  { label: "New Campaign", to: "/campaign-dashboard/new" },
  { label: "Reporting",    to: "/campaign-dashboard/reporting" },
  { label: "Billing",      to: "/campaign-dashboard/billing" },
  { label: "Settings",     to: "/campaign-dashboard" },
];

/* ── Spend alerts ── */
const INITIAL_ALERTS = [
  { id: 1, title: "Alert at 50% daily budget", sub: "Email notification", on: true },
  { id: 2, title: "Alert at 80% daily budget", sub: "Email notification", on: true },
  { id: 3, title: "Weekly performance digest",  sub: "Every Monday at 9 AM", on: false },
];

/* ── Invoice history ── */
const INVOICES = [
  { number: "INV-0041", period: "March 2026",    amount: "$2,140.00", status: "Paid" },
  { number: "INV-0038", period: "February 2026", amount: "$1,870.00", status: "Paid" },
  { number: "INV-0035", period: "January 2026",  amount: "$1,540.00", status: "Paid" },
  { number: "INV-0032", period: "December 2025", amount: "$980.00",   status: "Paid" },
];

const TOP_UP_OPTIONS = ["$50", "$100", "$500", "$1,000"];

export default function BillingPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Billing");
  const [selectedTopUp, setSelectedTopUp] = useState("$50");
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const toggleAlert = (id) =>
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, on: !a.on } : a))
    );

  /* Balance data */
  const totalBudget = 1000;
  const remaining   = 341.60;
  const used        = totalBudget - remaining;
  const pct         = Math.round((remaining / totalBudget) * 100);

  return (
    <div className="flex h-screen font-sans" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: "#111827" }}>
        <div className="px-6 pt-7 pb-5">
          <p className="text-white text-xl font-bold leading-tight">AppAds</p>
          <p className="text-gray-400 text-xs mt-0.5">Mobile Ads Platform</p>
        </div>
        <hr className="border-gray-700 mx-4" />

        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, to }) => (
            <button
              key={label}
              onClick={() => { setActiveNav(label); navigate(to); }}
              className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition-colors ${
                activeNav === label
                  ? "bg-violet-600 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-5 flex items-center gap-3 border-t border-gray-700/60">
          <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-semibold">NA</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">Newton (Affle)</p>
            <p className="text-gray-400 text-xs">Pro Plan</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-7 pb-2">
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
            + Add Funds
          </button>
        </div>

        {/* Top cards row */}
        <div className="px-8 pt-4 grid grid-cols-2 gap-6 mb-6">
          {/* Prepaid Balance card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Prepaid Balance</h2>

            <p className="text-4xl font-bold text-violet-600 leading-tight">
              ${remaining.toFixed(2)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              remaining of ${totalBudget.toLocaleString()}
            </p>

            {/* Progress bar */}
            <div className="mt-4 w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-600 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {pct}% remaining · ${used.toFixed(2)} used this cycle
            </p>

            {/* Top up buttons */}
            <p className="text-xs text-gray-400 mt-5 mb-2">Top up amount</p>
            <div className="flex items-center gap-2">
              {TOP_UP_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedTopUp(opt)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedTopUp === opt
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Spend Alerts card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Spend Alerts</h2>

            <div className="space-y-0">
              {alerts.map((alert, idx) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between py-4 ${
                    idx < alerts.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{alert.sub}</p>
                  </div>
                  {/* Toggle */}
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      alert.on ? "bg-violet-600" : "bg-gray-200"
                    }`}
                    aria-label={`Toggle ${alert.title}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        alert.on ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Invoice History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Invoice #", "Period", "Amount", "Status", ""].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-xs font-medium text-gray-400 text-left"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVOICES.map((inv) => (
                    <tr
                      key={inv.number}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{inv.number}</td>
                      <td className="px-6 py-4 text-gray-700">{inv.period}</td>
                      <td className="px-6 py-4 text-gray-700">{inv.amount}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors">
                          Download PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
