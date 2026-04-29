import { statsData } from "../../data/mockData";

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsData.map((stat) => (
        <div key={stat.label} className="stat-card">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{stat.icon}</span>
            <span
              className={`badge badge-sm font-medium ${
                stat.positive ? "badge-success" : "badge-error"
              }`}
            >
              {stat.change}
            </span>
          </div>
          <p className="text-2xl font-bold text-base-content">{stat.value}</p>
          <p className="text-xs text-base-content/50 mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
