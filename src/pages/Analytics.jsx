import ReactApexChart from "react-apexcharts";
import { impressionsTrendData, revenueChartData, trafficChartData } from "../data/mockData";

const lineOptions = (categories, color) => ({
  chart: { type: "line", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
  colors: [color],
  stroke: { curve: "smooth", width: 2.5 },
  fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0, stops: [0, 100] } },
  xaxis: {
    categories,
    labels: { style: { fontFamily: "Inter, sans-serif", fontSize: "11px", colors: "#9ca3af" } },
    axisBorder: { show: false }, axisTicks: { show: false },
  },
  yaxis: { labels: { style: { fontFamily: "Inter, sans-serif", fontSize: "11px", colors: "#9ca3af" } } },
  grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
  dataLabels: { enabled: false },
  tooltip: { theme: "light" },
});

const kpiMetrics = [
  { label: "Avg. Impressions/Day", value: "80,000", trend: "+4.2%", positive: true },
  { label: "Cost Per Acquisition", value: "$3.76", trend: "-8.1%", positive: true },
  { label: "Return on Ad Spend", value: "2.3x", trend: "+12%", positive: true },
  { label: "View-Through Rate", value: "3.4%", trend: "+0.8%", positive: true },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Analytics</h1>
        <p className="text-sm text-base-content/50 mt-0.5">Deep-dive performance metrics across all campaigns</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((m) => (
          <div key={m.label} className="stat-card">
            <p className="text-2xl font-bold text-base-content">{m.value}</p>
            <p className="text-xs text-base-content/50 mt-1">{m.label}</p>
            <span className={`badge badge-sm mt-2 ${m.positive ? "badge-success" : "badge-error"}`}>{m.trend}</span>
          </div>
        ))}
      </div>

      {/* Impressions trend */}
      <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
        <h3 className="font-semibold text-base-content mb-0.5">Impressions Trend</h3>
        <p className="text-xs text-base-content/50 mb-4">Monthly impression volume — 2024</p>
        <ReactApexChart
          options={lineOptions(impressionsTrendData.categories, "#570DF8")}
          series={[{ name: "Impressions", data: impressionsTrendData.series[0].data }]}
          type="area"
          height={260}
        />
      </div>

      {/* Revenue + Traffic side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
          <h3 className="font-semibold text-base-content mb-0.5">Revenue Trend</h3>
          <p className="text-xs text-base-content/50 mb-4">Monthly revenue growth</p>
          <ReactApexChart
            options={lineOptions(revenueChartData.categories, "#F000B8")}
            series={[{ name: "Revenue", data: revenueChartData.series[0].data }]}
            type="area"
            height={220}
          />
        </div>

        <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
          <h3 className="font-semibold text-base-content mb-0.5">Traffic Distribution</h3>
          <p className="text-xs text-base-content/50 mb-4">Channel split across campaigns</p>
          <ReactApexChart
            options={{
              chart: { type: "bar", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
              colors: ["#570DF8"],
              plotOptions: { bar: { borderRadius: 6, horizontal: true } },
              xaxis: { labels: { style: { fontFamily: "Inter, sans-serif", fontSize: "12px", colors: "#9ca3af" } }, categories: trafficChartData.labels },
              yaxis: { labels: { style: { fontFamily: "Inter, sans-serif", fontSize: "12px", colors: "#9ca3af" } } },
              grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
              dataLabels: { enabled: true, formatter: (v) => `${v}%` },
              tooltip: { theme: "light", y: { formatter: (v) => `${v}%` } },
            }}
            series={[{ name: "Share", data: trafficChartData.series }]}
            type="bar"
            height={220}
          />
        </div>
      </div>

      {/* Funnel table */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="p-5 border-b border-base-200">
          <h3 className="font-semibold text-base-content">Conversion Funnel</h3>
          <p className="text-xs text-base-content/50 mt-0.5">Step-by-step user journey performance</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="text-base-content/50 text-xs">
                <th>Stage</th>
                <th className="text-right">Users</th>
                <th className="text-right">Rate</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {[
                { stage: "Ad Impressions", users: "2,400,000", rate: "100%", pct: 100 },
                { stage: "Ad Clicks", users: "184,320", rate: "7.68%", pct: 7.68 },
                { stage: "Landing Page Views", users: "158,200", rate: "6.59%", pct: 6.59 },
                { stage: "Product Views", users: "89,400", rate: "3.73%", pct: 3.73 },
                { stage: "Add to Cart", users: "34,600", rate: "1.44%", pct: 1.44 },
                { stage: "Purchases", users: "12,840", rate: "0.54%", pct: 0.54 },
              ].map((row) => (
                <tr key={row.stage} className="hover">
                  <td className="font-medium text-sm">{row.stage}</td>
                  <td className="text-right text-sm">{row.users}</td>
                  <td className="text-right text-sm font-medium text-primary">{row.rate}</td>
                  <td className="w-48">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-base-200 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
