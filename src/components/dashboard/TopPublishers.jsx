import { topPublishers } from "../../data/mockData";

export default function TopPublishers() {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
      <h3 className="font-semibold text-base-content mb-0.5">Top Publishers</h3>
      <p className="text-xs text-base-content/50 mb-5">Revenue by platform</p>
      <div className="space-y-4">
        {topPublishers.map((pub) => (
          <div key={pub.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-base-content">{pub.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-base-content/60">{pub.share}%</span>
                <span className="text-sm font-semibold text-base-content">{pub.revenue}</span>
              </div>
            </div>
            <div className="w-full bg-base-200 rounded-full h-2">
              <div
                className={`${pub.color} h-2 rounded-full transition-all duration-700`}
                style={{ width: `${pub.share}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="divider my-4"></div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-base-content/60">Total Revenue</span>
        <span className="font-bold text-base-content">$48,295</span>
      </div>
    </div>
  );
}
