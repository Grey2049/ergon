export const statsData = [
  { label: "Total Revenue", value: "$48,295", change: "+12.5%", positive: true, icon: "💰" },
  { label: "Impressions", value: "2.4M", change: "+8.3%", positive: true, icon: "👁️" },
  { label: "Clicks", value: "184,320", change: "+5.1%", positive: true, icon: "🖱️" },
  { label: "CTR", value: "7.68%", change: "-0.4%", positive: false, icon: "📊" },
  { label: "Conversions", value: "12,840", change: "+18.2%", positive: true, icon: "✅" },
  { label: "Avg. CPC", value: "$0.26", change: "-3.2%", positive: true, icon: "💡" },
];

export const revenueChartData = {
  series: [
    {
      name: "Revenue",
      data: [18200, 22400, 19800, 27600, 24100, 31500, 28900, 35200, 30100, 38400, 42100, 48295],
    },
    {
      name: "Ad Spend",
      data: [8100, 9500, 8700, 11200, 10400, 13800, 12300, 15100, 13200, 16800, 18500, 21000],
    },
  ],
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export const trafficChartData = {
  series: [44, 25, 18, 13],
  labels: ["Organic", "Paid Search", "Social Media", "Direct"],
};

export const campaignPerformanceData = {
  series: [
    { name: "Clicks", data: [4200, 3800, 5100, 4700, 6200, 5800] },
    { name: "Conversions", data: [820, 740, 1100, 960, 1340, 1180] },
  ],
  categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

export const impressionsTrendData = {
  series: [
    {
      name: "Impressions",
      data: [310000, 290000, 420000, 380000, 510000, 470000, 590000, 540000, 620000, 580000, 710000, 680000],
    },
  ],
  categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export const campaignsTableData = [
  { id: 1, name: "Summer Sale 2024", platform: "Google Ads", status: "active", budget: "$5,000", spent: "$3,240", ctr: "8.2%", conversions: 420, revenue: "$12,600" },
  { id: 2, name: "Brand Awareness Q2", platform: "Meta Ads", status: "active", budget: "$8,000", spent: "$6,110", ctr: "6.5%", conversions: 310, revenue: "$9,300" },
  { id: 3, name: "Retargeting - Cart", platform: "Google Ads", status: "paused", budget: "$2,500", spent: "$2,500", ctr: "12.1%", conversions: 890, revenue: "$26,700" },
  { id: 4, name: "New User Acquisition", platform: "TikTok Ads", status: "active", budget: "$6,000", spent: "$1,820", ctr: "4.8%", conversions: 140, revenue: "$4,200" },
  { id: 5, name: "Holiday Special", platform: "Meta Ads", status: "draft", budget: "$10,000", spent: "$0", ctr: "-", conversions: 0, revenue: "$0" },
  { id: 6, name: "Product Launch - X1", platform: "Google Ads", status: "active", budget: "$7,500", spent: "$4,900", ctr: "9.4%", conversions: 680, revenue: "$20,400" },
  { id: 7, name: "Email Re-engagement", platform: "Meta Ads", status: "completed", budget: "$1,200", spent: "$1,200", ctr: "11.3%", conversions: 230, revenue: "$6,900" },
];

export const topPublishers = [
  { name: "Google Ads", revenue: "$21,400", share: 44, color: "bg-primary" },
  { name: "Meta Ads", revenue: "$15,600", share: 32, color: "bg-secondary" },
  { name: "TikTok Ads", revenue: "$6,800", share: 14, color: "bg-accent" },
  { name: "Others", revenue: "$4,495", share: 10, color: "bg-neutral" },
];
