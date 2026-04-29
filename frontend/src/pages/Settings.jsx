export default function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-base-content">Settings</h1>
        <p className="text-sm text-base-content/50 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="card bg-base-100 shadow-sm border border-base-200 p-6">
        <h2 className="font-semibold text-base-content mb-4">Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="avatar placeholder">
            <div className="w-16 rounded-full bg-primary text-primary-content text-xl font-bold">
              <span>UP</span>
            </div>
          </div>
          <div>
            <p className="font-semibold text-base-content">Upendra Parashar</p>
            <p className="text-sm text-base-content/50">upendra.parashar@affle.com</p>
          </div>
          <button className="btn btn-ghost btn-sm ml-auto">Change Photo</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label"><span className="label-text text-xs font-medium">First Name</span></label>
            <input type="text" defaultValue="Upendra" className="input input-bordered input-sm" />
          </div>
          <div className="form-control">
            <label className="label"><span className="label-text text-xs font-medium">Last Name</span></label>
            <input type="text" defaultValue="Parashar" className="input input-bordered input-sm" />
          </div>
          <div className="form-control sm:col-span-2">
            <label className="label"><span className="label-text text-xs font-medium">Email</span></label>
            <input type="email" defaultValue="upendra.parashar@affle.com" className="input input-bordered input-sm" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary btn-sm">Save Changes</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card bg-base-100 shadow-sm border border-base-200 p-6">
        <h2 className="font-semibold text-base-content mb-4">Notifications</h2>
        <div className="space-y-3">
          {[
            { label: "Campaign performance alerts", desc: "Get notified when CTR drops below threshold" },
            { label: "Weekly summary emails", desc: "Receive a weekly digest of your ad performance" },
            { label: "Budget alerts", desc: "Notify when campaign budget is 80% consumed" },
            { label: "New feature updates", desc: "Stay informed about new AppAds features" },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-4 py-2 border-b border-base-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-base-content">{item.label}</p>
                <p className="text-xs text-base-content/50 mt-0.5">{item.desc}</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle toggle-primary toggle-sm mt-0.5 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card bg-base-100 shadow-sm border border-error/20 p-6">
        <h2 className="font-semibold text-error mb-1">Danger Zone</h2>
        <p className="text-xs text-base-content/50 mb-4">These actions are irreversible. Please proceed with caution.</p>
        <button className="btn btn-error btn-sm btn-outline">Delete Account</button>
      </div>
    </div>
  );
}
