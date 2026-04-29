import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";

/* ── Sidebar nav ── */
const NAV_ITEMS = [
  { label: "Dashboard",    to: "/campaign-dashboard" },
  { label: "Campaigns",    to: "/campaign-dashboard" },
  { label: "New Campaign", to: "/campaign-dashboard/new" },
  { label: "Reporting",    to: "/campaign-dashboard/reporting" },
  { label: "Billing",      to: "/campaign-dashboard" },
  { label: "Settings",     to: "/campaign-dashboard" },
];

/* ── Stat cards ── */
const STAT_CARDS = [
  { label: "Total Spend",  value: "$8,240",  color: "text-violet-600", border: "border-t-violet-500" },
  { label: "Impressions",  value: "1.24M",   color: "text-teal-500",   border: "border-t-teal-400" },
  { label: "Taps",         value: "41,100",  color: "text-emerald-500", border: "border-t-emerald-400" },
  { label: "Installs",     value: "2,795",   color: "text-blue-500",   border: "border-t-blue-400" },
  { label: "TTR",          value: "3.4%",    color: "text-orange-500",  border: "border-t-orange-400" },
  { label: "CR",           value: "6.8%",    color: "text-pink-500",    border: "border-t-pink-400" },
  { label: "Avg CPI",      value: "$2.95",   color: "text-green-600",   border: "border-t-green-500" },
];

/* ── Daily chart data (last 30 days) ── */
const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 3, i + 1);          // Apr 1 – Apr 30
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
});

const CHART_DATA = {
  Installs:    [62,78,55,90,84,72,68,95,88,76,81,70,65,92,110,98,86,74,69,105,130,160,120,95,88,82,78,91,85,80],
  Spend:       [180,210,165,240,225,195,185,255,235,205,220,190,175,250,295,265,230,200,188,280,350,430,320,255,235,220,210,245,228,215],
  Impressions: [32000,38000,28000,42000,40000,36000,34000,45000,42000,38000,40000,35000,33000,44000,52000,47000,41000,37000,35000,50000,62000,75000,57000,45000,42000,39000,37000,43000,40000,38000],
  Taps:        [1100,1350,980,1480,1400,1250,1180,1580,1470,1320,1390,1220,1140,1530,1820,1640,1430,1280,1210,1740,2160,2620,1980,1570,1460,1360,1290,1500,1400,1320],
};

/* ── Breakdown table data ── */
const BREAKDOWN_DATA = [
  { campaign: "TaskFlow — Brand KW",     impressions: "320,410", taps: "11,214", ttr: "3.5%", installs: "762",   cr: "6.8%", spend: "$1,843", cpi: "$2.42" },
  { campaign: "TaskFlow — Competitor KW", impressions: "141,200", taps: "4,901",  ttr: "3.5%", installs: "289",   cr: "5.9%", spend: "$916",   cpi: "$3.17" },
  { campaign: "MoodTrack — Discovery",    impressions: "582,000", taps: "19,270", ttr: "3.3%", installs: "1,244", cr: "6.5%", spend: "$3,102", cpi: "$2.49" },
];

const BREAKDOWN_TOTAL = {
  campaign: "Total", impressions: "1,043,610", taps: "35,385", ttr: "3.4%", installs: "2,295", cr: "6.5%", spend: "$5,861", cpi: "$2.55",
};

const BREAKDOWN_TABS = ["Campaign", "Ad Group", "Keyword", "Country", "Device"];
const TABLE_COLS     = ["Campaign", "Impressions", "Taps", "TTR", "Installs", "CR", "Spend", "CPI"];

export default function ReportingPage() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav]       = useState("Reporting");
  const [chartTab, setChartTab]         = useState("Installs");
  const [breakdownTab, setBreakdownTab] = useState("Campaign");

  /* ── ApexCharts config ── */
  const chartOptions = useMemo(() => ({
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Inter, system-ui, sans-serif",
    },
    plotOptions: {
      bar: { borderRadius: 3, columnWidth: "55%" },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: DAYS,
      labels: {
        style: { colors: "#9ca3af", fontSize: "11px" },
        rotate: 0,
        hideOverlappingLabels: true,
        tickAmount: 6,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: "#9ca3af", fontSize: "11px" } },
    },
    grid: {
      borderColor: "#f3f4f6",
      strokeDashArray: 4,
    },
    colors: ["#8b5cf6"],
    tooltip: {
      theme: "light",
      y: {
        formatter: (val) =>
          chartTab === "Spend"
            ? `$${val.toLocaleString()}`
            : val.toLocaleString(),
      },
    },
  }), [chartTab]);

  const chartSeries = useMemo(() => [
    { name: chartTab, data: CHART_DATA[chartTab] },
  ], [chartTab]);

  /* ── Export CSV stub ── */
  const handleExport = () => {
    const header = TABLE_COLS.join(",");
    const rows = BREAKDOWN_DATA.map((r) =>
      [r.campaign, r.impressions, r.taps, r.ttr, r.installs, r.cr, r.spend, r.cpi].join(",")
    );
    const csv = [header, ...rows, [BREAKDOWN_TOTAL.campaign, BREAKDOWN_TOTAL.impressions, BREAKDOWN_TOTAL.taps, BREAKDOWN_TOTAL.ttr, BREAKDOWN_TOTAL.installs, BREAKDOWN_TOTAL.cr, BREAKDOWN_TOTAL.spend, BREAKDOWN_TOTAL.cpi].join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "reporting.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Reporting</h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Last 30 days
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="px-8 pt-4 grid grid-cols-7 gap-4 mb-6">
          {STAT_CARDS.map((s) => (
            <div key={s.label} className={`bg-white rounded-xl p-4 border-t-4 shadow-sm ${s.border}`}>
              <p className="text-[11px] text-gray-400 font-medium mb-1.5">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Chart card */}
        <div className="px-8 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Chart tabs */}
            <div className="flex items-center gap-6 mb-1 border-b border-gray-100 pb-3">
              {Object.keys(CHART_DATA).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setChartTab(tab)}
                  className={`text-sm font-medium pb-1 transition-colors ${
                    chartTab === tab
                      ? "text-violet-600 border-b-2 border-violet-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-3 mb-2">
              Daily {chartTab.toLowerCase()} — last 30 days
            </p>

            <Chart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height={240}
            />
          </div>
        </div>

        {/* Breakdown table */}
        <div className="px-8 pb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Breakdown</h2>
              <div className="flex items-center gap-2">
                {BREAKDOWN_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setBreakdownTab(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      breakdownTab === tab
                        ? "bg-violet-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {TABLE_COLS.map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-medium text-gray-400 ${
                          h === "Campaign" ? "text-left" : "text-right"
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BREAKDOWN_DATA.map((row, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{row.campaign}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{row.impressions}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{row.taps}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{row.ttr}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{row.installs}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{row.cr}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{row.spend}</td>
                      <td className="px-6 py-4 text-right text-gray-700">{row.cpi}</td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-gray-50/80 font-semibold">
                    <td className="px-6 py-4 text-gray-900">{BREAKDOWN_TOTAL.campaign}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{BREAKDOWN_TOTAL.impressions}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{BREAKDOWN_TOTAL.taps}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{BREAKDOWN_TOTAL.ttr}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{BREAKDOWN_TOTAL.installs}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{BREAKDOWN_TOTAL.cr}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{BREAKDOWN_TOTAL.spend}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{BREAKDOWN_TOTAL.cpi}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
