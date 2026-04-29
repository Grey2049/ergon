import StatsGrid from "../components/dashboard/StatsGrid";
import RevenueChart from "../components/dashboard/RevenueChart";
import TrafficDonut from "../components/dashboard/TrafficDonut";
import CampaignPerformance from "../components/dashboard/CampaignPerformance";
import TopPublishers from "../components/dashboard/TopPublishers";
import RecentCampaigns from "../components/dashboard/RecentCampaigns";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Dashboard</h1>
          <p className="text-sm text-base-content/50 mt-0.5">Welcome back, Upendra. Here's what's happening.</p>
        </div>
        <button className="btn btn-primary btn-sm gap-2 sm:hidden">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </button>
      </div>

      {/* Stats */}
      <StatsGrid />

      {/* Main charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RevenueChart />
        </div>
        <TrafficDonut />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CampaignPerformance />
        </div>
        <TopPublishers />
      </div>

      {/* Recent campaigns */}
      <RecentCampaigns />
    </div>
  );
}
