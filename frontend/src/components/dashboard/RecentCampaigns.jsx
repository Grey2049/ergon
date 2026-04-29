import { campaignsTableData } from "../../data/mockData";
import { Link } from "react-router-dom";

const statusBadge = {
  active: "badge-success",
  paused: "badge-warning",
  draft: "badge-ghost",
  completed: "badge-info",
};

export default function RecentCampaigns() {
  const recent = campaignsTableData.slice(0, 5);

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="flex items-center justify-between p-5 border-b border-base-200">
        <div>
          <h3 className="font-semibold text-base-content">Recent Campaigns</h3>
          <p className="text-xs text-base-content/50 mt-0.5">Latest campaign activity</p>
        </div>
        <Link to="/campaigns" className="btn btn-ghost btn-sm text-primary">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr className="text-base-content/50 text-xs">
              <th>Campaign</th>
              <th>Platform</th>
              <th>Status</th>
              <th className="text-right">CTR</th>
              <th className="text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((c) => (
              <tr key={c.id} className="hover">
                <td>
                  <span className="font-medium text-sm text-base-content">{c.name}</span>
                </td>
                <td>
                  <span className="text-sm text-base-content/60">{c.platform}</span>
                </td>
                <td>
                  <span className={`badge badge-sm ${statusBadge[c.status]} capitalize`}>
                    {c.status}
                  </span>
                </td>
                <td className="text-right text-sm font-medium">{c.ctr}</td>
                <td className="text-right text-sm font-semibold text-base-content">{c.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
