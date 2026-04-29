import { useState, useMemo } from "react";
import Chart from "react-apexcharts";

const STAT_CARDS = [
  { label: "Total Spend", value: "$8,240",  accent: "border-t-primary text-primary" },
  { label: "Impressions", value: "1.24M",   accent: "border-t-secondary text-secondary" },
  { label: "Taps",        value: "41,100",  accent: "border-t-accent text-accent" },
  { label: "Installs",    value: "2,795",   accent: "border-t-info text-info" },
  { label: "TTR",         value: "3.4%",    accent: "border-t-warning text-warning" },
  { label: "CR",          value: "6.8%",    accent: "border-t-error text-error" },
  { label: "Avg CPI",     value: "$2.95",   accent: "border-t-success text-success" },
];

const DAYS = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 3, i + 1);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
});

const CHART_DATA = {
  Installs:    [62,78,55,90,84,72,68,95,88,76,81,70,65,92,110,98,86,74,69,105,130,160,120,95,88,82,78,91,85,80],
  Spend:       [180,210,165,240,225,195,185,255,235,205,220,190,175,250,295,265,230,200,188,280,350,430,320,255,235,220,210,245,228,215],
  Impressions: [32000,38000,28000,42000,40000,36000,34000,45000,42000,38000,40000,35000,33000,44000,52000,47000,41000,37000,35000,50000,62000,75000,57000,45000,42000,39000,37000,43000,40000,38000],
  Taps:        [1100,1350,980,1480,1400,1250,1180,1580,1470,1320,1390,1220,1140,1530,1820,1640,1430,1280,1210,1740,2160,2620,1980,1570,1460,1360,1290,1500,1400,1320],
};

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
  const [chartTab, setChartTab]         = useState("Installs");
  const [breakdownTab, setBreakdownTab] = useState("Campaign");

  const chartOptions = useMemo(() => ({
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Inter, system-ui, sans-serif" },
    plotOptions: { bar: { borderRadius: 3, columnWidth: "55%" } },
    dataLabels: { enabled: false },
    xaxis: {
      categories: DAYS,
      labels: { style: { colors: "#9ca3af", fontSize: "11px" }, rotate: 0, hideOverlappingLabels: true, tickAmount: 6 },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "11px" } } },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
    colors: ["#8b5cf6"],
    tooltip: { theme: "light", y: { formatter: (val) => val.toLocaleString() } },
  }), [chartTab]);

  const chartSeries = useMemo(() => [{ name: chartTab, data: CHART_DATA[chartTab] }], [chartTab]);

  const handleExport = () => {
    const header = TABLE_COLS.join(",");
    const rows = BREAKDOWN_DATA.map((r) =>
      [r.campaign, r.impressions, r.taps, r.ttr, r.installs, r.cr, r.spend, r.cpi].join(",")
    );
    const csv = [header, ...rows, [BREAKDOWN_TOTAL.campaign, BREAKDOWN_TOTAL.impressions, BREAKDOWN_TOTAL.taps, BREAKDOWN_TOTAL.ttr, BREAKDOWN_TOTAL.installs, BREAKDOWN_TOTAL.cr, BREAKDOWN_TOTAL.spend, BREAKDOWN_TOTAL.cpi].join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "reporting.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <h1 className="text-2xl font-bold text-base-content">Reporting</h1>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline btn-sm gap-2">
            Last 30 days
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={handleExport} className="btn btn-outline btn-sm">Export CSV</button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {STAT_CARDS.map((s) => {
          const [borderClass, textClass] = s.accent.split(" ");
          return (
            <div key={s.label} className={`bg-base-100 rounded-xl p-4 border-t-4 shadow-sm ${borderClass}`}>
              <p className="text-[11px] text-base-content/50 font-medium mb-1.5">{s.label}</p>
              <p className={`text-xl font-bold ${textClass}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6 mb-6">
        <div className="flex items-center gap-6 mb-1 border-b border-base-300 pb-3">
          {Object.keys(CHART_DATA).map((tab) => (
            <button key={tab} onClick={() => setChartTab(tab)} className={`text-sm font-medium pb-1 transition-colors ${chartTab === tab ? "text-primary border-b-2 border-primary" : "text-base-content/40 hover:text-base-content/60"}`}>
              {tab}
            </button>
          ))}
        </div>
        <p className="text-xs text-base-content/40 mt-3 mb-2">Daily {chartTab.toLowerCase()} — last 30 days</p>
        <Chart options={chartOptions} series={chartSeries} type="bar" height={240} />
      </div>

      {/* Breakdown table */}
      <div className="bg-base-100 rounded-xl shadow-sm border border-base-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
          <h2 className="text-base font-semibold text-base-content">Breakdown</h2>
          <div className="flex items-center gap-2">
            {BREAKDOWN_TABS.map((tab) => (
              <button key={tab} onClick={() => setBreakdownTab(tab)} className={`btn btn-xs ${breakdownTab === tab ? "btn-primary" : "btn-ghost"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                {TABLE_COLS.map((h) => (
                  <th key={h} className={h === "Campaign" ? "text-left" : "text-right"}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BREAKDOWN_DATA.map((row, i) => (
                <tr key={i} className="hover">
                  <td className="font-medium text-base-content">{row.campaign}</td>
                  <td className="text-right text-base-content/70">{row.impressions}</td>
                  <td className="text-right text-base-content/70">{row.taps}</td>
                  <td className="text-right text-base-content/70">{row.ttr}</td>
                  <td className="text-right text-base-content/70">{row.installs}</td>
                  <td className="text-right text-base-content/70">{row.cr}</td>
                  <td className="text-right text-base-content/70">{row.spend}</td>
                  <td className="text-right text-base-content/70">{row.cpi}</td>
                </tr>
              ))}
              <tr className="font-semibold bg-base-200/50">
                <td className="text-base-content">{BREAKDOWN_TOTAL.campaign}</td>
                <td className="text-right text-base-content">{BREAKDOWN_TOTAL.impressions}</td>
                <td className="text-right text-base-content">{BREAKDOWN_TOTAL.taps}</td>
                <td className="text-right text-base-content">{BREAKDOWN_TOTAL.ttr}</td>
                <td className="text-right text-base-content">{BREAKDOWN_TOTAL.installs}</td>
                <td className="text-right text-base-content">{BREAKDOWN_TOTAL.cr}</td>
                <td className="text-right text-base-content">{BREAKDOWN_TOTAL.spend}</td>
                <td className="text-right text-base-content">{BREAKDOWN_TOTAL.cpi}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
