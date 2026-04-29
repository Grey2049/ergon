import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ── Steps ── */
const STEPS = [
  { num: "01", label: "App" },
  { num: "02", label: "Campaign" },
  { num: "03", label: "Ad Group" },
  { num: "04", label: "Keywords" },
  { num: "05", label: "Creative" },
];

/* ── Sidebar nav (shared with dashboard) ── */
const NAV_ITEMS = [
  { label: "Dashboard",    to: "/campaign-dashboard" },
  { label: "Campaigns",    to: "/campaign-dashboard" },
  { label: "New Campaign", to: "/campaign-dashboard/new" },
  { label: "Reporting",    to: "/campaign-dashboard" },
  { label: "Billing",      to: "/campaign-dashboard" },
  { label: "Settings",     to: "/campaign-dashboard" },
];

const INITIAL_COUNTRIES = ["United States", "Canada", "United Kingdom"];
const INITIAL_KEYWORDS  = ["task manager", "to do list", "productivity", "taskflow"];

export default function NewCampaignPage() {
  const navigate = useNavigate();

  /* ── Wizard step ── */
  const [currentStep, setCurrentStep] = useState(1); // 0-based completed, 1 = current

  /* ── Campaign settings ── */
  const [campaignName, setCampaignName] = useState("");
  const [dailyBudget, setDailyBudget]   = useState("$50.00");
  const [totalBudget, setTotalBudget]   = useState("");

  /* ── Targeting ── */
  const [countries, setCountries] = useState(INITIAL_COUNTRIES);
  const [device, setDevice]       = useState("iPhone + iPad");
  const [ageFilter, setAgeFilter] = useState("All ages");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");

  /* ── Keywords & Bidding ── */
  const [maxCpt, setMaxCpt]           = useState("$0.85");
  const [searchMatch, setSearchMatch] = useState("Auto");
  const [keywords, setKeywords]       = useState(INITIAL_KEYWORDS);
  const [kwInput, setKwInput]         = useState("");

  /* ── Creative ── */
  const [subtitle, setSubtitle] = useState("");

  /* ── Helpers ── */
  const removeCountry = (c) => setCountries((prev) => prev.filter((x) => x !== c));
  const removeKeyword = (k) => setKeywords((prev) => prev.filter((x) => x !== k));

  const handleKwKeyDown = (e) => {
    if (e.key === "Enter" && kwInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(kwInput.trim())) {
        setKeywords((prev) => [...prev, kwInput.trim()]);
      }
      setKwInput("");
    }
  };

  const stepClass = (idx) => {
    if (idx < currentStep) return "done";
    if (idx === currentStep) return "current";
    return "";
  };

  return (
    <div className="flex h-screen font-sans" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: "#111827" }}>
        <div className="px-6 pt-7 pb-5">
          <p className="text-white text-xl font-bold leading-tight">AppAds</p>
          <p className="text-gray-400 text-xs mt-0.5">Mobile Ads Platform</p>
        </div>
        <hr className="border-gray-700 mx-4" />

        <nav className="flex-1 px-3 pt-4 space-y-0.5">
          {NAV_ITEMS.map(({ label, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className={`w-full text-left text-sm px-3 py-2.5 rounded-lg transition-colors ${
                label === "New Campaign"
                  ? "bg-violet-600 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-5 flex items-center gap-3 border-t border-gray-700/60">
          <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-semibold">NA</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">Newton (Affle)</p>
            <p className="text-gray-400 text-xs">Pro Plan</p>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-7 pb-2">
          <h1 className="text-2xl font-bold text-gray-900">New Campaign</h1>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Save Draft
            </button>
            <button className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
              Launch Campaign
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="px-8 pt-4 pb-6">
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {STEPS.map((s, idx) => (
              <button
                key={s.num}
                onClick={() => setCurrentStep(idx)}
                className={`flex-1 py-3 text-center text-xs font-medium transition-colors border-r last:border-r-0 border-gray-200 ${
                  stepClass(idx) === "done"
                    ? "bg-emerald-500 text-white"
                    : stepClass(idx) === "current"
                    ? "bg-violet-600 text-white"
                    : "bg-white text-gray-400"
                }`}
              >
                <span className="block text-[10px] opacity-70 mb-0.5">{s.num}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area — two-column layout */}
        <div className="px-8 pb-10 grid grid-cols-3 gap-6">
          {/* Left column (2/3) */}
          <div className="col-span-2 space-y-6">
            {/* Campaign Settings */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-5">Campaign Settings</h2>

              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1.5">Campaign name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. TaskFlow — Brand US"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Daily budget</label>
                  <input
                    type="text"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(e.target.value)}
                    placeholder="$50.00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Total budget (optional)</label>
                  <input
                    type="text"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="No limit"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  />
                </div>
              </div>
            </section>

            {/* Targeting */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-5">Targeting</h2>

              {/* Countries */}
              <div className="mb-4">
                <label className="block text-xs text-gray-500 mb-1.5">Countries / Regions</label>
                <div className="flex flex-wrap items-center gap-2">
                  {countries.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium"
                    >
                      {c}
                      <button
                        onClick={() => removeCountry(c)}
                        className="hover:text-violet-900 transition-colors"
                        aria-label={`Remove ${c}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button className="text-xs text-violet-600 font-medium hover:underline">
                    + Add country
                  </button>
                </div>
              </div>

              {/* Device & Age */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Device type</label>
                  <select
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  >
                    <option>iPhone + iPad</option>
                    <option>iPhone only</option>
                    <option>iPad only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Age filter</label>
                  <select
                    value={ageFilter}
                    onChange={(e) => setAgeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  >
                    <option>All ages</option>
                    <option>18+</option>
                    <option>25+</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Start date</label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Apr 29, 2026"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">End date (optional)</label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="No end date"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  />
                </div>
              </div>
            </section>

            {/* Keywords & Bidding */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-5">Keywords &amp; Bidding</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Max CPT Bid</label>
                  <input
                    type="text"
                    value={maxCpt}
                    onChange={(e) => setMaxCpt(e.target.value)}
                    placeholder="$0.85"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Search match type</label>
                  <select
                    value={searchMatch}
                    onChange={(e) => setSearchMatch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                  >
                    <option>Auto</option>
                    <option>Broad</option>
                    <option>Exact</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Keywords</label>
                <input
                  type="text"
                  value={kwInput}
                  onChange={(e) => setKwInput(e.target.value)}
                  onKeyDown={handleKwKeyDown}
                  placeholder="Type keyword and press Enter…"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {keywords.map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium"
                    >
                      {k}
                      <button
                        onClick={() => removeKeyword(k)}
                        className="hover:text-violet-900 transition-colors"
                        aria-label={`Remove keyword ${k}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6">
            {/* Creative Preview */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-5">Creative Preview</h2>

              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-3">Search result mockup</p>

              <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                    <span className="text-violet-600 text-xs font-bold">TF</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">TaskFlow</p>
                    <p className="text-[11px] text-gray-500">Smart task &amp; project planner</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Sponsored · Productivity</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-[10px] font-medium shrink-0">
                    Get
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-xs text-gray-500 mb-1.5">Custom subtitle override</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Leave blank to use store subtitle"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 transition"
                />
                <p className="text-[10px] text-gray-400 mt-1.5">
                  Max 30 characters. Currently using: store default.
                </p>
              </div>
            </section>

            {/* Keyword Tips */}
            <section className="rounded-xl p-5 bg-violet-50 border border-violet-100">
              <h3 className="text-sm font-semibold text-violet-700 mb-3">Keyword Tips</h3>
              <ul className="space-y-2 text-xs text-violet-600">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  Use exact match for high-intent brand terms.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  Broad match drives volume and discovery.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  Negative keywords prevent wasted spend.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  Min bid $0.10 | Suggested: $0.70 to $1.20
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
