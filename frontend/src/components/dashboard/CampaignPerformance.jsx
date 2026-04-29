import ReactApexChart from "react-apexcharts";
import { campaignPerformanceData } from "../../data/mockData";

export default function CampaignPerformance() {
  const options = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    colors: ["#570DF8", "#F000B8"],
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: "55%", grouped: true },
    },
    xaxis: {
      categories: campaignPerformanceData.categories,
      labels: { style: { fontFamily: "Inter, sans-serif", fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontFamily: "Inter, sans-serif", fontSize: "12px", colors: "#9ca3af" },
      },
    },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
    dataLabels: { enabled: false },
    legend: { fontFamily: "Inter, sans-serif", fontSize: "13px" },
    tooltip: { theme: "light" },
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base-content">Weekly Performance</h3>
          <p className="text-xs text-base-content/50 mt-0.5">Clicks vs Conversions</p>
        </div>
        <button className="btn btn-ghost btn-xs gap-1">
          Export
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
      <ReactApexChart
        options={options}
        series={campaignPerformanceData.series}
        type="bar"
        height={260}
      />
    </div>
  );
}
