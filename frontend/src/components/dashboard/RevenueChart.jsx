import ReactApexChart from "react-apexcharts";
import { revenueChartData } from "../../data/mockData";

export default function RevenueChart() {
  const options = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
      sparkline: { enabled: false },
    },
    colors: ["#570DF8", "#F000B8"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    stroke: { curve: "smooth", width: 2.5 },
    xaxis: {
      categories: revenueChartData.categories,
      labels: { style: { fontFamily: "Inter, sans-serif", fontSize: "12px", colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontFamily: "Inter, sans-serif", fontSize: "12px", colors: "#9ca3af" },
        formatter: (v) => `$${(v / 1000).toFixed(0)}k`,
      },
    },
    grid: { borderColor: "#f3f4f6", strokeDashArray: 4 },
    tooltip: {
      theme: "light",
      y: { formatter: (v) => `$${v.toLocaleString()}` },
    },
    legend: {
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
    },
    dataLabels: { enabled: false },
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base-content">Revenue vs Ad Spend</h3>
          <p className="text-xs text-base-content/50 mt-0.5">Annual overview — 2024</p>
        </div>
        <div className="tabs tabs-boxed tabs-sm">
          <a className="tab tab-active">Year</a>
          <a className="tab">Month</a>
          <a className="tab">Week</a>
        </div>
      </div>
      <ReactApexChart
        options={options}
        series={revenueChartData.series}
        type="area"
        height={280}
      />
    </div>
  );
}
