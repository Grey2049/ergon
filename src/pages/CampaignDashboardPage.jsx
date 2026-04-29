import { useState } from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard",    to: "/campaign-dashboard" },
  { label: "Campaigns",    to: "/campaign-dashboard" },
  { label: "New Campaign", to: "/campaign-dashboard" },
  { label: "Reporting",    to: "/campaign-dashboard" },
  { label: "Billing",      to: "/campaign-dashboard" },
  { label: "Settings",     to: "/campaign-dashboard" },
];

const STAT_CARDS = [
  {
    label: "Total Spend",
    value: "$8,240",
    sub: "+12% vs prev period",
    color: "text-violet-600",
    border: "border-t-violet-500",
  },
  {
    label: "Impressions",
    value: "1.24M",
    sub: "TTR 3.4%",
    color: "text-teal-500",
    border: "border-t-teal-400",
  },
  {
    label: "Taps",
    value: "41,100",
    sub: "CR 6.8%",
    color: "text-emerald-500",
    border: "border-t-emerald-400",
  },
  {
    label: "Installs",
    value: "2,795",
    sub: "Avg CPI $2.95",
    color: "text-amber-500",
    border: "border-t-amber-400",
  },
];

const CAMPAIGNS = [
  {
    name: "TaskFlow — Brand KW",
    sub: "iOS · US, CA, GB",
    status: "Active",
    budget: "$50",
    spend: "$1,840",
    impressions: "320K",
    taps: "11,200",
    installs: "762",
    cpi: "$2.42",
  },
  {
    name: "TaskFlow — Competitor",
    sub: "iOS · US",
    status: "Active",
    budget: "$30",
    spend: "$920",
    impressions: "140K",
    taps: "4,901",
    installs: "289",
    cpi: "$3.17",
  },
  {
    name: "MoodTrack — Discovery",
    sub: "iOS · AU, NZ",
    status: "Paused",
    budget: "$20",
    spend: "$3,102",
    impressions: "582K",
    taps: "19,270",
    installs: "1,244",
    cpi: "$2.49",
  },
  {
    name: "MoodTrack — Search",
    sub: "iOS · US",
    status: "Draft",
    budget: "$15",
    spend: "—",
    impressions: "—",
    taps: "—",
    installs: "—",
    cpi: null,
  },
];

const STATUS_STYLE = {
  Active: "bg-teal-100 text-teal-700",
  Paused: "bg-gray-100 text-gray-500",
  Draft:  "bg-amber-100 text-amber-600",
};

const FILTER_STYLE = {
  All:    "bg-violet-600 text-white",
  Active: "bg-teal-100 text-teal-700",
  Paused: "bg-gray-100 text-gray-500",
  Draft:  "bg-amber-100 text-amber-600",
};

export default function CampaignDashboardPage() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All" ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.status === filter);

  return (
    <div className="flex h-screen font-sans" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: "#111827" }}>
        {/* Logo */}
        <div className="px-6 pt-7 pb-5">
          <p className="text-white text-xl font-bold leading-tight">AppAds</p>
          <p className="text-gray-400 text-xs mt-0.5">Mobile Ads Platform</p>
        </div>
        <hr className="border-gray-700 mx-4" />

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {NAV_ITEMS.map(({ label }) => (
            <button
              key={label}
              onClick={() => setActiveNav(label)}
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

        {/* User */}
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

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-end gap-3 px-8 pt-7 pb-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Last 30 days
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + New Campaign
          </button>
        </div>

        {/* Heading */}
        <div className="px-8 pt-2 pb-6">
          <h1 className="text-2xl font-bold text-gray-900">Campaign Dashboard</h1>
        </div>

        {/* Stat cards */}
        <div className="px-8 grid grid-cols-4 gap-5 mb-8">
          {STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className={`bg-white rounded-xl p-5 border-t-4 shadow-sm ${s.border}`}
            >
              <p className="text-xs text-gray-400 font-medium mb-2">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Campaigns table */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Table header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">All Campaigns</h2>
              <div className="flex items-center gap-2">
                {["All", "Active", "Paused", "Draft"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      filter === f ? FILTER_STYLE[f] : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Campaign", "Status", "Budget/day", "Spend", "Impressions", "Taps", "Installs", "CPI"].map(
                      (h) => (
                        <th
                          key={h}
                          className={`px-6 py-3 text-xs font-medium text-gray-400 ${
                            h === "Campaign" ? "text-left" : "text-right"
                          }`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[c.status]}`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700">{c.budget}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{c.spend}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{c.impressions}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{c.taps}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{c.installs}</td>
                      <td className="px-6 py-4 text-right">
                        {c.cpi ? (
                          <span className="text-violet-600 font-medium">{c.cpi}</span>
                        ) : (
                          <button className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors">
                            Launch
                          </button>
                        )}
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
