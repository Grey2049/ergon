export default function Reports() {
  const reports = [
    { name: "Monthly Revenue Report", date: "Apr 1, 2026", type: "Revenue", size: "2.4 MB" },
    { name: "Campaign Performance Q1", date: "Mar 31, 2026", type: "Performance", size: "1.8 MB" },
    { name: "Audience Insights - March", date: "Mar 28, 2026", type: "Audience", size: "3.1 MB" },
    { name: "Ad Spend Summary", date: "Mar 25, 2026", type: "Finance", size: "0.9 MB" },
    { name: "CTR Analysis Report", date: "Mar 20, 2026", type: "Performance", size: "1.2 MB" },
  ];

  const badgeColor = { Revenue: "badge-success", Performance: "badge-primary", Audience: "badge-secondary", Finance: "badge-warning" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-base-content">Reports</h1>
          <p className="text-sm text-base-content/50 mt-0.5">Download and manage your reports</p>
        </div>
        <button className="btn btn-primary btn-sm gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Generate Report
        </button>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr className="text-base-content/50 text-xs border-b border-base-200">
                <th>Report Name</th><th>Type</th><th>Date</th><th>Size</th><th></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i} className="hover border-b border-base-100">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-base-200 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-base-content/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="font-medium text-sm">{r.name}</span>
                    </div>
                  </td>
                  <td><span className={`badge badge-sm ${badgeColor[r.type]}`}>{r.type}</span></td>
                  <td className="text-sm text-base-content/60">{r.date}</td>
                  <td className="text-sm text-base-content/60">{r.size}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
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
