import { useState } from "react";

const STEPS = [
  { num: "01", label: "App" },
  { num: "02", label: "Campaign" },
  { num: "03", label: "Ad Group" },
  { num: "04", label: "Keywords" },
  { num: "05", label: "Creative" },
];

const INITIAL_COUNTRIES = ["United States", "Canada", "United Kingdom"];
const INITIAL_KEYWORDS  = ["task manager", "to do list", "productivity", "taskflow"];

export default function NewCampaignPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [campaignName, setCampaignName] = useState("");
  const [dailyBudget, setDailyBudget]   = useState("$50.00");
  const [totalBudget, setTotalBudget]   = useState("");
  const [countries, setCountries] = useState(INITIAL_COUNTRIES);
  const [device, setDevice]       = useState("iPhone + iPad");
  const [ageFilter, setAgeFilter] = useState("All ages");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate]     = useState("");
  const [maxCpt, setMaxCpt]           = useState("$0.85");
  const [searchMatch, setSearchMatch] = useState("Auto");
  const [keywords, setKeywords]       = useState(INITIAL_KEYWORDS);
  const [kwInput, setKwInput]         = useState("");
  const [subtitle, setSubtitle] = useState("");

  const removeCountry = (c) => setCountries((prev) => prev.filter((x) => x !== c));
  const removeKeyword = (k) => setKeywords((prev) => prev.filter((x) => x !== k));

  const handleKwKeyDown = (e) => {
    if (e.key === "Enter" && kwInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(kwInput.trim())) setKeywords((prev) => [...prev, kwInput.trim()]);
      setKwInput("");
    }
  };

  const stepClass = (idx) => {
    if (idx < currentStep) return "done";
    if (idx === currentStep) return "current";
    return "";
  };

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <h1 className="text-2xl font-bold text-base-content">New Campaign</h1>
        <div className="flex items-center gap-3">
          <button className="btn btn-outline btn-sm">Save Draft</button>
          <button className="btn btn-primary btn-sm">Launch Campaign</button>
        </div>
      </div>

      {/* Step indicator */}
      <div className="pb-6">
        <div className="flex rounded-xl overflow-hidden border border-base-300">
          {STEPS.map((s, idx) => (
            <button
              key={s.num}
              onClick={() => setCurrentStep(idx)}
              className={`flex-1 py-3 text-center text-xs font-medium transition-colors border-r last:border-r-0 border-base-300 ${
                stepClass(idx) === "done"
                  ? "bg-success text-success-content"
                  : stepClass(idx) === "current"
                  ? "bg-primary text-primary-content"
                  : "bg-base-100 text-base-content/40"
              }`}
            >
              <span className="block text-[10px] opacity-70 mb-0.5">{s.num}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content — two-column */}
      <div className="grid grid-cols-3 gap-6 pb-4">
        {/* Left column */}
        <div className="col-span-2 space-y-6">
          {/* Campaign Settings */}
          <section className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
            <h2 className="text-sm font-semibold text-base-content mb-5">Campaign Settings</h2>
            <div className="mb-4">
              <label className="block text-xs text-base-content/50 mb-1.5">Campaign name</label>
              <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g. TaskFlow — Brand US" className="input input-bordered input-sm w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-base-content/50 mb-1.5">Daily budget</label>
                <input type="text" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} placeholder="$50.00" className="input input-bordered input-sm w-full" />
              </div>
              <div>
                <label className="block text-xs text-base-content/50 mb-1.5">Total budget (optional)</label>
                <input type="text" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} placeholder="No limit" className="input input-bordered input-sm w-full" />
              </div>
            </div>
          </section>

          {/* Targeting */}
          <section className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
            <h2 className="text-sm font-semibold text-base-content mb-5">Targeting</h2>
            <div className="mb-4">
              <label className="block text-xs text-base-content/50 mb-1.5">Countries / Regions</label>
              <div className="flex flex-wrap items-center gap-2">
                {countries.map((c) => (
                  <span key={c} className="badge badge-primary badge-outline gap-1.5">
                    {c}
                    <button onClick={() => removeCountry(c)} className="hover:opacity-70" aria-label={`Remove ${c}`}>×</button>
                  </span>
                ))}
                <button className="text-xs text-primary font-medium hover:underline">+ Add country</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-base-content/50 mb-1.5">Device type</label>
                <select value={device} onChange={(e) => setDevice(e.target.value)} className="select select-bordered select-sm w-full">
                  <option>iPhone + iPad</option>
                  <option>iPhone only</option>
                  <option>iPad only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-base-content/50 mb-1.5">Age filter</label>
                <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} className="select select-bordered select-sm w-full">
                  <option>All ages</option>
                  <option>18+</option>
                  <option>25+</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-base-content/50 mb-1.5">Start date</label>
                <input type="text" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Apr 29, 2026" className="input input-bordered input-sm w-full" />
              </div>
              <div>
                <label className="block text-xs text-base-content/50 mb-1.5">End date (optional)</label>
                <input type="text" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="No end date" className="input input-bordered input-sm w-full" />
              </div>
            </div>
          </section>

          {/* Keywords & Bidding */}
          <section className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
            <h2 className="text-sm font-semibold text-base-content mb-5">Keywords &amp; Bidding</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-base-content/50 mb-1.5">Max CPT Bid</label>
                <input type="text" value={maxCpt} onChange={(e) => setMaxCpt(e.target.value)} placeholder="$0.85" className="input input-bordered input-sm w-full" />
              </div>
              <div>
                <label className="block text-xs text-base-content/50 mb-1.5">Search match type</label>
                <select value={searchMatch} onChange={(e) => setSearchMatch(e.target.value)} className="select select-bordered select-sm w-full">
                  <option>Auto</option>
                  <option>Broad</option>
                  <option>Exact</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-base-content/50 mb-1.5">Keywords</label>
              <input type="text" value={kwInput} onChange={(e) => setKwInput(e.target.value)} onKeyDown={handleKwKeyDown} placeholder="Type keyword and press Enter…" className="input input-bordered input-sm w-full" />
              <div className="flex flex-wrap gap-2 mt-3">
                {keywords.map((k) => (
                  <span key={k} className="badge badge-primary badge-outline gap-1.5">
                    {k}
                    <button onClick={() => removeKeyword(k)} className="hover:opacity-70" aria-label={`Remove keyword ${k}`}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Creative Preview */}
          <section className="bg-base-100 rounded-xl shadow-sm border border-base-300 p-6">
            <h2 className="text-sm font-semibold text-base-content mb-5">Creative Preview</h2>
            <p className="text-[10px] uppercase tracking-wider text-base-content/40 mb-3">Search result mockup</p>
            <div className="border border-base-300 rounded-xl p-4 bg-base-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">TF</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-base-content">TaskFlow</p>
                  <p className="text-[11px] text-base-content/60">Smart task &amp; project planner</p>
                  <p className="text-[9px] text-base-content/40 mt-0.5">Sponsored · Productivity</p>
                </div>
                <span className="btn btn-primary btn-xs">Get</span>
              </div>
            </div>
            <div className="mt-5">
              <label className="block text-xs text-base-content/50 mb-1.5">Custom subtitle override</label>
              <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Leave blank to use store subtitle" className="input input-bordered input-sm w-full" />
              <p className="text-[10px] text-base-content/40 mt-1.5">Max 30 characters. Currently using: store default.</p>
            </div>
          </section>

          {/* Keyword Tips */}
          <section className="rounded-xl p-5 bg-primary/10 border border-primary/20">
            <h3 className="text-sm font-semibold text-primary mb-3">Keyword Tips</h3>
            <ul className="space-y-2 text-xs text-primary/80">
              <li className="flex items-start gap-2"><span className="mt-0.5">•</span>Use exact match for high-intent brand terms.</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">•</span>Broad match drives volume and discovery.</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">•</span>Negative keywords prevent wasted spend.</li>
              <li className="flex items-start gap-2"><span className="mt-0.5">•</span>Min bid $0.10 | Suggested: $0.70 to $1.20</li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
