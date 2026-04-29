import ReactApexChart from "react-apexcharts";
import { trafficChartData } from "../../data/mockData";

export default function TrafficDonut() {
  const options = {
    chart: { type: "donut", fontFamily: "Inter, sans-serif" },
    colors: ["#570DF8", "#F000B8", "#FF6B35", "#00C49F"],
    labels: trafficChartData.labels,
    legend: {
      position: "bottom",
      fontFamily: "Inter, sans-serif",
      fontSize: "13px",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              color: "#6b7280",
              formatter: () => "100%",
            },
            value: {
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: "#111827",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { theme: "light", y: { formatter: (v) => `${v}%` } },
  };

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
      <h3 className="font-semibold text-base-content mb-0.5">Traffic Sources</h3>
      <p className="text-xs text-base-content/50 mb-2">Channel breakdown</p>
      <ReactApexChart
        options={options}
        series={trafficChartData.series}
        type="donut"
        height={280}
      />
    </div>
  );
}
