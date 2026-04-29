import { useState } from "react";
import { campaignsTableData } from "../data/mockData";

const statusBadge = {
  active: "badge-success",
  paused: "badge-warning",
  draft: "badge-ghost",
  completed: "badge-info",
};

const platformColors = {
  "Google Ads": "bg-blue-100 text-blue-700",
  "Meta Ads": "bg-indigo-100 text-indigo-700",
  "TikTok Ads": "bg-pink-100 text-pink-700",
};

export default function Campaigns() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = campaignsTableData.filter((c) => {
    const matchesFilter = filter === "all" || c.status === filter;
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: campaignsTableData.length,
    active: campaignsTableData.filter((c) => c.status === "active").length,
    paused: campaignsTableData.filter((c) => c.status === "paused").length,
    draft: campaignsTableData.filter((c) => c.status === "draft").length,
    completed: campaignsTableData.filter((c) => c.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Campaigns</h1>
          <p className="text-sm text-base-content/50 mt-0.5">Manage and monitor all ad campaigns</p>
        </div>
        <button className="btn btn-primary btn-sm gap-2 self-start sm:self-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Budget", value: "$40,200", icon: "💰" },
          { label: "Total Spent", value: "$19,770", icon: "📤" },
          { label: "Avg. CTR", value: "8.7%", icon: "📊" },
          { label: "Total Conversions", value: "2,670", icon: "✅" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <span className="text-xl mb-2 block">{s.icon}</span>
            <p className="text-xl font-bold text-base-content">{s.value}</p>
            <p className="text-xs text-base-content/50">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="p-5 border-b border-base-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Status filter tabs */}
          <div className="tabs tabs-boxed tabs-sm flex-wrap">
            {["all", "active", "paused", "draft", "completed"].map((s) => (
              <button
                key={s}
                className={`tab gap-1 capitalize ${filter === s ? "tab-active" : ""}`}
                onClick={() => setFilter(s)}
              >
                {s}
                <span className="badge badge-sm">{counts[s]}</span>
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered input-sm pl-9 w-48 focus:w-64 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="text-base-content/50 text-xs border-b border-base-200">
                <th>Campaign Name</th>
                <th>Platform</th>
                <th>Status</th>
                <th className="text-right">Budget</th>
                <th className="text-right">Spent</th>
                <th className="text-right">CTR</th>
                <th className="text-right">Conversions</th>
                <th className="text-right">Revenue</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="hover border-b border-base-100">
                  <td>
                    <span className="font-medium text-sm text-base-content">{c.name}</span>
                  </td>
                  <td>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${platformColors[c.platform] || "bg-base-200 text-base-content"}`}>
                      {c.platform}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-sm capitalize ${statusBadge[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="text-right text-sm">{c.budget}</td>
                  <td className="text-right text-sm">{c.spent}</td>
                  <td className="text-right text-sm font-medium">{c.ctr}</td>
                  <td className="text-right text-sm">{c.conversions.toLocaleString()}</td>
                  <td className="text-right text-sm font-semibold text-base-content">{c.revenue}</td>
                  <td>
                    <div className="dropdown dropdown-end">
                      <label tabIndex={0} className="btn btn-ghost btn-xs btn-square">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </label>
                      <ul tabIndex={0} className="dropdown-content menu menu-sm shadow bg-base-100 rounded-box w-36 border border-base-200">
                        <li><a>Edit</a></li>
                        <li><a>Duplicate</a></li>
                        <li><a>Pause</a></li>
                        <li><a className="text-error">Delete</a></li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-base-content/40">
              <p className="text-sm">No campaigns match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
