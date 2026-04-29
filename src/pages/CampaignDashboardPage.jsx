import { useState } from "react";

const STAT_CARDS = [
  {
    label: "Total Spend",
    value: "$8,240",
    sub: "+12% vs prev period",
    accent: "border-t-primary text-primary",
  },
  {
    label: "Impressions",
    value: "1.24M",
    sub: "TTR 3.4%",
    accent: "border-t-secondary text-secondary",
  },
  {
    label: "Taps",
    value: "41,100",
    sub: "CR 6.8%",
    accent: "border-t-accent text-accent",
  },
  {
    label: "Installs",
    value: "2,795",
    sub: "Avg CPI $2.95",
    accent: "border-t-warning text-warning",
  },
];

const CAMPAIGNS = [
  { name: "TaskFlow — Brand KW", sub: "iOS · US, CA, GB", status: "Active", budget: "$50", spend: "$1,840", impressions: "320K", taps: "11,200", installs: "762", cpi: "$2.42" },
  { name: "TaskFlow — Competitor", sub: "iOS · US", status: "Active", budget: "$30", spend: "$920", impressions: "140K", taps: "4,901", installs: "289", cpi: "$3.17" },
  { name: "MoodTrack — Discovery", sub: "iOS · AU, NZ", status: "Paused", budget: "$20", spend: "$3,102", impressions: "582K", taps: "19,270", installs: "1,244", cpi: "$2.49" },
  { name: "MoodTrack — Search", sub: "iOS · US", status: "Draft", budget: "$15", spend: "—", impressions: "—", taps: "—", installs: "—", cpi: null },
];

const STATUS_STYLE = { Active: "badge-success", Paused: "badge-ghost", Draft: "badge-warning" };
const FILTER_STYLE = { All: "btn-primary", Active: "btn-success", Paused: "btn-ghost", Draft: "btn-warning" };

export default function CampaignDashboardPage() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.status === filter);

  return (
    <>
      {/* Heading */}
      <div className="pt-2 pb-6">
        <h1 className="text-2xl font-bold text-base-content">Campaign Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map((s) => {
          const [borderClass, textClass] = s.accent.split(" ");
          return (
            <div key={s.label} className={`bg-base-100 rounded-xl p-5 border-t-4 shadow-sm ${borderClass}`}>
              <p className="text-xs text-base-content/50 font-medium mb-2">{s.label}</p>
              <p className={`text-2xl font-bold ${textClass}`}>{s.value}</p>
              <p className="text-xs text-base-content/50 mt-1">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Campaigns table */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
          <h2 className="text-base font-semibold text-base-content">All Campaigns</h2>
          <div className="flex items-center gap-2">
            {["All", "Active", "Paused", "Draft"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`btn btn-xs ${filter === f ? FILTER_STYLE[f] : "btn-ghost"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                {["Campaign", "Status", "Budget/day", "Spend", "Impressions", "Taps", "Installs", "CPI"].map((h) => (
                  <th key={h} className={h === "Campaign" ? "text-left" : "text-right"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} className="hover">
                  <td>
                    <p className="font-medium text-base-content text-sm">{c.name}</p>
                    <p className="text-xs text-base-content/50 mt-0.5">{c.sub}</p>
                  </td>
                  <td className="text-right">
                    <span className={`badge badge-sm ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="text-right text-base-content/70">{c.budget}</td>
                  <td className="text-right text-base-content/70">{c.spend}</td>
                  <td className="text-right text-base-content/70">{c.impressions}</td>
                  <td className="text-right text-base-content/70">{c.taps}</td>
                  <td className="text-right text-base-content/70">{c.installs}</td>
                  <td className="text-right">
                    {c.cpi ? (
                      <span className="text-primary font-medium">{c.cpi}</span>
                    ) : (
                      <button className="btn btn-primary btn-xs">Launch</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
