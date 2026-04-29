import ReactApexChart from "react-apexcharts";

const ageData = { series: [18, 27, 31, 16, 8], labels: ["18-24", "25-34", "35-44", "45-54", "55+"] };
const deviceData = { series: [62, 28, 10], labels: ["Mobile", "Desktop", "Tablet"] };

export default function Audience() {
  const donutOpts = (labels, colors) => ({
    chart: { type: "donut", fontFamily: "Inter, sans-serif" },
    labels,
    colors,
    legend: { position: "bottom", fontFamily: "Inter, sans-serif", fontSize: "12px" },
    plotOptions: { pie: { donut: { size: "65%" } } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { theme: "light", y: { formatter: (v) => `${v}%` } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Audience</h1>
        <p className="text-sm text-base-content/50 mt-0.5">Understand who's engaging with your ads</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Reach", value: "1.8M", icon: "🌍" },
          { label: "New Users", value: "42%", icon: "👤" },
          { label: "Returning Users", value: "58%", icon: "🔁" },
          { label: "Avg. Session", value: "3m 42s", icon: "⏱️" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <span className="text-xl mb-2 block">{s.icon}</span>
            <p className="text-xl font-bold text-base-content">{s.value}</p>
            <p className="text-xs text-base-content/50">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
          <h3 className="font-semibold text-base-content mb-0.5">Age Distribution</h3>
          <p className="text-xs text-base-content/50 mb-2">User breakdown by age group</p>
          <ReactApexChart
            options={donutOpts(ageData.labels, ["#570DF8", "#F000B8", "#FF6B35", "#00C49F", "#FFB800"])}
            series={ageData.series}
            type="donut"
            height={280}
          />
        </div>
        <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
          <h3 className="font-semibold text-base-content mb-0.5">Device Breakdown</h3>
          <p className="text-xs text-base-content/50 mb-2">Sessions by device type</p>
          <ReactApexChart
            options={donutOpts(deviceData.labels, ["#570DF8", "#F000B8", "#FF6B35"])}
            series={deviceData.series}
            type="donut"
            height={280}
          />
        </div>
      </div>

      {/* Geo table */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="p-5 border-b border-base-200">
          <h3 className="font-semibold text-base-content">Top Geographies</h3>
          <p className="text-xs text-base-content/50 mt-0.5">Traffic by country</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="text-base-content/50 text-xs">
                <th>#</th><th>Country</th><th className="text-right">Users</th><th className="text-right">Revenue</th><th>Share</th>
              </tr>
            </thead>
            <tbody>
              {[
                { rank: 1, country: "United States", flag: "🇺🇸", users: "680,000", revenue: "$21,200", share: 44 },
                { rank: 2, country: "India", flag: "🇮🇳", users: "340,000", revenue: "$9,800", share: 20 },
                { rank: 3, country: "United Kingdom", flag: "🇬🇧", users: "190,000", revenue: "$6,400", share: 13 },
                { rank: 4, country: "Germany", flag: "🇩🇪", users: "140,000", revenue: "$4,100", share: 8 },
                { rank: 5, country: "Canada", flag: "🇨🇦", users: "110,000", revenue: "$3,200", share: 7 },
              ].map((row) => (
                <tr key={row.rank} className="hover">
                  <td className="text-base-content/40 text-sm">{row.rank}</td>
                  <td><span className="text-sm font-medium">{row.flag} {row.country}</span></td>
                  <td className="text-right text-sm">{row.users}</td>
                  <td className="text-right text-sm font-semibold">{row.revenue}</td>
                  <td className="w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-base-200 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${row.share}%` }} />
                      </div>
                      <span className="text-xs text-base-content/50">{row.share}%</span>
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
