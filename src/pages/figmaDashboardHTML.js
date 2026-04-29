// Self-contained multi-page HTML generator for Figma → HTML conversion
// Includes: Dashboard, New Campaign, Reporting, Billing
// Uses: DaisyUI, ApexCharts, Inter font, Tailwind CSS

export default function buildFigmaDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<title>AppAds — Campaign Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.24/dist/full.min.css" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"><\/script>
<script src="https://cdn.jsdelivr.net/npm/apexcharts"><\/script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body,html{height:100%;font-family:'Inter',system-ui,sans-serif}
.screen{display:none}
.screen.active{display:block}
.nav-btn{width:100%;text-align:left;font-size:14px;padding:10px 12px;border-radius:8px;color:#9ca3af;border:none;background:none;cursor:pointer;transition:all .15s}
.nav-btn:hover{color:#e5e7eb;background:rgba(255,255,255,0.05)}
.nav-btn.active{background:#7c3aed;color:#fff;font-weight:500}
.sbt{border-top:4px solid}
.sbt-v{border-top-color:#7c3aed}.sbt-t{border-top-color:#14b8a6}.sbt-e{border-top-color:#10b981}.sbt-a{border-top-color:#f59e0b}
.sbt-b{border-top-color:#3b82f6}.sbt-o{border-top-color:#f97316}.sbt-p{border-top-color:#ec4899}.sbt-g{border-top-color:#22c55e}
.tag{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:500}
.tag-active{background:#ccfbf1;color:#0d9488}.tag-paused{background:#f3f4f6;color:#6b7280}.tag-draft{background:#fef3c7;color:#d97706}.tag-paid{background:#ccfbf1;color:#0d9488}
.kw-tag{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:9999px;background:#ede9fe;color:#7c3aed;font-size:12px;font-weight:500}
.toggle{position:relative;width:44px;height:24px;border-radius:12px;cursor:pointer;transition:background .2s;border:none}
.toggle.on{background:#7c3aed}.toggle.off{background:#d1d5db}
.toggle::after{content:'';position:absolute;width:20px;height:20px;background:#fff;border-radius:50%;top:2px;left:2px;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.15)}
.toggle.on::after{transform:translateX(20px)}
</style>
</head>
<body class="bg-gray-50">
<div style="display:flex;height:100vh;font-family:'Inter',system-ui,sans-serif">

<!-- ═══ SIDEBAR ═══ -->
<aside style="width:224px;flex-shrink:0;display:flex;flex-direction:column;background:#111827">
  <div style="padding:28px 24px 20px">
    <p style="color:#fff;font-size:20px;font-weight:700">AppAds</p>
    <p style="color:#9ca3af;font-size:12px;margin-top:2px">Mobile Ads Platform</p>
  </div>
  <hr style="border-color:#374151;margin:0 16px">
  <nav id="sidebar-nav" style="flex:1;padding:16px 12px 0;display:flex;flex-direction:column;gap:2px">
    <button class="nav-btn active" onclick="showPage('dashboard',this)">Dashboard</button>
    <button class="nav-btn" onclick="showPage('newcampaign',this)">New Campaign</button>
    <button class="nav-btn" onclick="showPage('reporting',this)">Reporting</button>
    <button class="nav-btn" onclick="showPage('billing',this)">Billing</button>
  </nav>
  <div style="padding:20px 16px;display:flex;align-items:center;gap:12px;border-top:1px solid rgba(55,65,81,0.6)">
    <div style="width:36px;height:36px;border-radius:50%;background:#7c3aed;display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <span style="color:#fff;font-size:14px;font-weight:600">NA</span>
    </div>
    <div style="min-width:0">
      <p style="color:#fff;font-size:14px;font-weight:500">Newton (Affle)</p>
      <p style="color:#9ca3af;font-size:12px">Pro Plan</p>
    </div>
  </div>
</aside>

<!-- ═══ MAIN ═══ -->
<div style="flex:1;display:flex;flex-direction:column;background:#f9fafb;min-width:0;overflow-y:auto">

<!-- ══ PAGE: DASHBOARD ══ -->
<div id="pg-dashboard" class="screen active">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:28px 32px 8px">
    <h1 style="font-size:24px;font-weight:700;color:#111827">Campaign Dashboard</h1>
    <div style="display:flex;gap:12px">
      <button class="btn btn-outline btn-sm gap-2" style="font-family:'Inter',sans-serif">Last 30 days <svg style="width:14px;height:14px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></button>
      <button class="btn btn-sm gap-2" style="background:#7c3aed;border-color:#7c3aed;color:#fff;font-family:'Inter',sans-serif" onclick="showPage('newcampaign',document.querySelectorAll('.nav-btn')[1])">+ New Campaign</button>
    </div>
  </div>
  <div style="padding:16px 32px 0;display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-bottom:24px">
    <div class="card bg-base-100 shadow-sm sbt sbt-v" style="padding:20px"><p style="font-size:12px;color:#9ca3af;font-weight:500;margin-bottom:8px">Total Spend</p><p style="font-size:24px;font-weight:700;color:#7c3aed">$8,240</p><p style="font-size:12px;color:#9ca3af;margin-top:4px">+12% vs prev period</p></div>
    <div class="card bg-base-100 shadow-sm sbt sbt-t" style="padding:20px"><p style="font-size:12px;color:#9ca3af;font-weight:500;margin-bottom:8px">Impressions</p><p style="font-size:24px;font-weight:700;color:#14b8a6">1.24M</p><p style="font-size:12px;color:#9ca3af;margin-top:4px">TTR 3.4%</p></div>
    <div class="card bg-base-100 shadow-sm sbt sbt-e" style="padding:20px"><p style="font-size:12px;color:#9ca3af;font-weight:500;margin-bottom:8px">Taps</p><p style="font-size:24px;font-weight:700;color:#10b981">41,100</p><p style="font-size:12px;color:#9ca3af;margin-top:4px">CR 6.8%</p></div>
    <div class="card bg-base-100 shadow-sm sbt sbt-a" style="padding:20px"><p style="font-size:12px;color:#9ca3af;font-weight:500;margin-bottom:8px">Installs</p><p style="font-size:24px;font-weight:700;color:#f59e0b">2,795</p><p style="font-size:12px;color:#9ca3af;margin-top:4px">Avg CPI $2.95</p></div>
  </div>
  <div style="padding:0 32px;margin-bottom:24px"><div class="card bg-base-100 shadow-sm" style="padding:20px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><h2 style="font-size:15px;font-weight:600;color:#111827">Daily Spend — Last 30 Days</h2><div class="badge badge-ghost" style="font-size:11px">ApexCharts</div></div><div id="spendChart"></div></div></div>
  <div style="padding:0 32px 32px">
    <div class="card bg-base-100 shadow-sm" style="overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #f3f4f6"><h2 style="font-size:16px;font-weight:600;color:#111827">All Campaigns</h2><div style="display:flex;gap:8px"><button class="btn btn-xs" style="background:#7c3aed;color:#fff;border:none;border-radius:9999px;font-size:12px">All</button><button class="btn btn-xs btn-ghost" style="border-radius:9999px;font-size:12px">Active</button><button class="btn btn-xs btn-ghost" style="border-radius:9999px;font-size:12px">Paused</button><button class="btn btn-xs btn-ghost" style="border-radius:9999px;font-size:12px">Draft</button></div></div>
      <div style="overflow-x:auto"><table class="table" style="font-size:14px"><thead><tr style="border-bottom:1px solid #f3f4f6"><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:left">Campaign</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">Status</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">Budget/day</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">Spend</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">Impressions</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">Taps</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">Installs</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">CPI</th></tr></thead><tbody>
        <tr><td><p style="font-weight:500;color:#111827">TaskFlow — Brand KW</p><p style="font-size:12px;color:#9ca3af;margin-top:2px">iOS · US, CA, GB</p></td><td style="text-align:right"><span class="tag tag-active">Active</span></td><td style="text-align:right;color:#374151">$50</td><td style="text-align:right;color:#374151">$1,840</td><td style="text-align:right;color:#374151">320K</td><td style="text-align:right;color:#374151">11,200</td><td style="text-align:right;color:#374151">762</td><td style="text-align:right;color:#7c3aed;font-weight:500">$2.42</td></tr>
        <tr><td><p style="font-weight:500;color:#111827">TaskFlow — Competitor</p><p style="font-size:12px;color:#9ca3af;margin-top:2px">iOS · US</p></td><td style="text-align:right"><span class="tag tag-active">Active</span></td><td style="text-align:right;color:#374151">$30</td><td style="text-align:right;color:#374151">$920</td><td style="text-align:right;color:#374151">140K</td><td style="text-align:right;color:#374151">4,901</td><td style="text-align:right;color:#374151">289</td><td style="text-align:right;color:#7c3aed;font-weight:500">$3.17</td></tr>
        <tr><td><p style="font-weight:500;color:#111827">MoodTrack — Discovery</p><p style="font-size:12px;color:#9ca3af;margin-top:2px">iOS · AU, NZ</p></td><td style="text-align:right"><span class="tag tag-paused">Paused</span></td><td style="text-align:right;color:#374151">$20</td><td style="text-align:right;color:#374151">$3,102</td><td style="text-align:right;color:#374151">582K</td><td style="text-align:right;color:#374151">19,270</td><td style="text-align:right;color:#374151">1,244</td><td style="text-align:right;color:#7c3aed;font-weight:500">$2.49</td></tr>
        <tr><td><p style="font-weight:500;color:#111827">MoodTrack — Search</p><p style="font-size:12px;color:#9ca3af;margin-top:2px">iOS · US</p></td><td style="text-align:right"><span class="tag tag-draft">Draft</span></td><td style="text-align:right;color:#374151">$15</td><td style="text-align:right;color:#374151">—</td><td style="text-align:right;color:#374151">—</td><td style="text-align:right;color:#374151">—</td><td style="text-align:right;color:#374151">—</td><td style="text-align:right"><button class="btn btn-xs" style="background:#7c3aed;color:#fff;border:none;font-size:12px;border-radius:8px">Launch</button></td></tr>
      </tbody></table></div>
    </div>
  </div>
</div>

<!-- ══ PAGE: NEW CAMPAIGN ══ -->
<div id="pg-newcampaign" class="screen">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:28px 32px 8px">
    <h1 style="font-size:24px;font-weight:700;color:#111827">New Campaign</h1>
    <div style="display:flex;gap:12px">
      <button class="btn btn-outline btn-sm" style="font-family:'Inter',sans-serif">Save Draft</button>
      <button class="btn btn-sm" style="background:#7c3aed;border-color:#7c3aed;color:#fff;font-family:'Inter',sans-serif">Launch Campaign</button>
    </div>
  </div>
  <!-- Steps -->
  <div style="padding:16px 32px 24px">
    <div style="display:flex;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
      <div style="flex:1;padding:12px;text-align:center;font-size:12px;font-weight:500;background:#10b981;color:#fff;border-right:1px solid #e5e7eb"><span style="display:block;font-size:10px;opacity:.7;margin-bottom:2px">01</span>App</div>
      <div style="flex:1;padding:12px;text-align:center;font-size:12px;font-weight:500;background:#7c3aed;color:#fff;border-right:1px solid #e5e7eb"><span style="display:block;font-size:10px;opacity:.7;margin-bottom:2px">02</span>Campaign</div>
      <div style="flex:1;padding:12px;text-align:center;font-size:12px;font-weight:500;background:#fff;color:#9ca3af;border-right:1px solid #e5e7eb"><span style="display:block;font-size:10px;opacity:.7;margin-bottom:2px">03</span>Ad Group</div>
      <div style="flex:1;padding:12px;text-align:center;font-size:12px;font-weight:500;background:#fff;color:#9ca3af;border-right:1px solid #e5e7eb"><span style="display:block;font-size:10px;opacity:.7;margin-bottom:2px">04</span>Keywords</div>
      <div style="flex:1;padding:12px;text-align:center;font-size:12px;font-weight:500;background:#fff;color:#9ca3af"><span style="display:block;font-size:10px;opacity:.7;margin-bottom:2px">05</span>Creative</div>
    </div>
  </div>
  <div style="padding:0 32px 32px;display:grid;grid-template-columns:2fr 1fr;gap:24px">
    <!-- Left column -->
    <div>
      <!-- Campaign Settings -->
      <div class="card bg-base-100 shadow-sm" style="padding:24px;margin-bottom:24px">
        <h2 style="font-size:14px;font-weight:600;color:#111827;margin-bottom:20px">Campaign Settings</h2>
        <div style="margin-bottom:16px"><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Campaign name</label><input class="input input-bordered w-full input-sm" style="font-family:'Inter',sans-serif" value="TaskFlow — Brand US" /></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Daily budget</label><input class="input input-bordered w-full input-sm" style="font-family:'Inter',sans-serif" value="$50.00" /></div>
          <div><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Total budget (optional)</label><input class="input input-bordered w-full input-sm" style="font-family:'Inter',sans-serif" placeholder="No limit" /></div>
        </div>
      </div>
      <!-- Targeting -->
      <div class="card bg-base-100 shadow-sm" style="padding:24px;margin-bottom:24px">
        <h2 style="font-size:14px;font-weight:600;color:#111827;margin-bottom:20px">Targeting</h2>
        <div style="margin-bottom:16px"><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Countries / Regions</label><div style="display:flex;flex-wrap:wrap;gap:8px"><span class="kw-tag">United States ×</span><span class="kw-tag">Canada ×</span><span class="kw-tag">United Kingdom ×</span><span style="font-size:12px;color:#7c3aed;font-weight:500;cursor:pointer;align-self:center">+ Add country</span></div></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
          <div><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Device type</label><select class="select select-bordered w-full select-sm" style="font-family:'Inter',sans-serif"><option>iPhone + iPad</option><option>iPhone only</option><option>iPad only</option></select></div>
          <div><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Age filter</label><select class="select select-bordered w-full select-sm" style="font-family:'Inter',sans-serif"><option>All ages</option><option>18+</option><option>25+</option></select></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Start date</label><input class="input input-bordered w-full input-sm" style="font-family:'Inter',sans-serif" value="Apr 29, 2026" /></div>
          <div><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">End date (optional)</label><input class="input input-bordered w-full input-sm" style="font-family:'Inter',sans-serif" placeholder="No end date" /></div>
        </div>
      </div>
      <!-- Keywords -->
      <div class="card bg-base-100 shadow-sm" style="padding:24px">
        <h2 style="font-size:14px;font-weight:600;color:#111827;margin-bottom:20px">Keywords &amp; Bidding</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
          <div><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Max CPT Bid</label><input class="input input-bordered w-full input-sm" style="font-family:'Inter',sans-serif" value="$0.85" /></div>
          <div><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Search match type</label><select class="select select-bordered w-full select-sm" style="font-family:'Inter',sans-serif"><option>Auto</option><option>Broad</option><option>Exact</option></select></div>
        </div>
        <div><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Keywords</label><input class="input input-bordered w-full input-sm" style="font-family:'Inter',sans-serif" placeholder="Type keyword and press Enter…" /><div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px"><span class="kw-tag">task manager ×</span><span class="kw-tag">to do list ×</span><span class="kw-tag">productivity ×</span><span class="kw-tag">taskflow ×</span></div></div>
      </div>
    </div>
    <!-- Right column -->
    <div>
      <div class="card bg-base-100 shadow-sm" style="padding:24px;margin-bottom:24px">
        <h2 style="font-size:14px;font-weight:600;color:#111827;margin-bottom:20px">Creative Preview</h2>
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-bottom:12px">Search result mockup</p>
        <div style="border:1px solid #f3f4f6;border-radius:12px;padding:16px;background:#f9fafb">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:12px;background:#ede9fe;display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="color:#7c3aed;font-size:12px;font-weight:700">TF</span></div>
            <div style="flex:1;min-width:0"><p style="font-size:14px;font-weight:600;color:#111827">TaskFlow</p><p style="font-size:11px;color:#6b7280">Smart task &amp; project planner</p><p style="font-size:9px;color:#9ca3af;margin-top:2px">Sponsored · Productivity</p></div>
            <span style="padding:4px 12px;border-radius:9999px;background:#7c3aed;color:#fff;font-size:10px;font-weight:500;flex-shrink:0">Get</span>
          </div>
        </div>
        <div style="margin-top:20px"><label style="display:block;font-size:12px;color:#6b7280;margin-bottom:6px">Custom subtitle override</label><input class="input input-bordered w-full input-sm" style="font-family:'Inter',sans-serif" placeholder="Leave blank to use store subtitle" /><p style="font-size:10px;color:#9ca3af;margin-top:6px">Max 30 characters. Currently using: store default.</p></div>
      </div>
      <div style="border-radius:12px;padding:20px;background:#f5f3ff;border:1px solid #ede9fe">
        <h3 style="font-size:14px;font-weight:600;color:#7c3aed;margin-bottom:12px">Keyword Tips</h3>
        <ul style="font-size:12px;color:#7c3aed;list-style:disc;padding-left:16px;line-height:2">
          <li>Use exact match for high-intent brand terms.</li>
          <li>Broad match drives volume and discovery.</li>
          <li>Negative keywords prevent wasted spend.</li>
          <li>Min bid $0.10 | Suggested: $0.70 – $1.20</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<!-- ══ PAGE: REPORTING ══ -->
<div id="pg-reporting" class="screen">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:28px 32px 8px">
    <h1 style="font-size:24px;font-weight:700;color:#111827">Reporting</h1>
    <div style="display:flex;gap:12px">
      <button class="btn btn-outline btn-sm gap-2" style="font-family:'Inter',sans-serif">Last 30 days <svg style="width:14px;height:14px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg></button>
      <button class="btn btn-outline btn-sm" style="font-family:'Inter',sans-serif">Export CSV</button>
    </div>
  </div>
  <!-- 7 stat cards -->
  <div style="padding:16px 32px 0;display:grid;grid-template-columns:repeat(7,1fr);gap:16px;margin-bottom:24px">
    <div class="card bg-base-100 shadow-sm sbt sbt-v" style="padding:16px"><p style="font-size:11px;color:#9ca3af;font-weight:500;margin-bottom:6px">Total Spend</p><p style="font-size:20px;font-weight:700;color:#7c3aed">$8,240</p></div>
    <div class="card bg-base-100 shadow-sm sbt sbt-t" style="padding:16px"><p style="font-size:11px;color:#9ca3af;font-weight:500;margin-bottom:6px">Impressions</p><p style="font-size:20px;font-weight:700;color:#14b8a6">1.24M</p></div>
    <div class="card bg-base-100 shadow-sm sbt sbt-e" style="padding:16px"><p style="font-size:11px;color:#9ca3af;font-weight:500;margin-bottom:6px">Taps</p><p style="font-size:20px;font-weight:700;color:#10b981">41,100</p></div>
    <div class="card bg-base-100 shadow-sm sbt sbt-b" style="padding:16px"><p style="font-size:11px;color:#9ca3af;font-weight:500;margin-bottom:6px">Installs</p><p style="font-size:20px;font-weight:700;color:#3b82f6">2,795</p></div>
    <div class="card bg-base-100 shadow-sm sbt sbt-o" style="padding:16px"><p style="font-size:11px;color:#9ca3af;font-weight:500;margin-bottom:6px">TTR</p><p style="font-size:20px;font-weight:700;color:#f97316">3.4%</p></div>
    <div class="card bg-base-100 shadow-sm sbt sbt-p" style="padding:16px"><p style="font-size:11px;color:#9ca3af;font-weight:500;margin-bottom:6px">CR</p><p style="font-size:20px;font-weight:700;color:#ec4899">6.8%</p></div>
    <div class="card bg-base-100 shadow-sm sbt sbt-g" style="padding:16px"><p style="font-size:11px;color:#9ca3af;font-weight:500;margin-bottom:6px">Avg CPI</p><p style="font-size:20px;font-weight:700;color:#22c55e">$2.95</p></div>
  </div>
  <!-- Bar chart -->
  <div style="padding:0 32px;margin-bottom:24px">
    <div class="card bg-base-100 shadow-sm" style="padding:20px">
      <div style="display:flex;align-items:center;gap:24px;margin-bottom:4px;border-bottom:1px solid #f3f4f6;padding-bottom:12px">
        <button class="rpt-tab active" onclick="setRptTab(this)" data-metric="Installs" style="font-size:14px;font-weight:500;padding-bottom:4px;border-bottom:2px solid #7c3aed;color:#7c3aed;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer">Installs</button>
        <button class="rpt-tab" onclick="setRptTab(this)" data-metric="Spend" style="font-size:14px;font-weight:500;padding-bottom:4px;border-bottom:2px solid transparent;color:#9ca3af;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer">Spend</button>
        <button class="rpt-tab" onclick="setRptTab(this)" data-metric="Impressions" style="font-size:14px;font-weight:500;padding-bottom:4px;border-bottom:2px solid transparent;color:#9ca3af;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer">Impressions</button>
        <button class="rpt-tab" onclick="setRptTab(this)" data-metric="Taps" style="font-size:14px;font-weight:500;padding-bottom:4px;border-bottom:2px solid transparent;color:#9ca3af;background:none;border-top:none;border-left:none;border-right:none;cursor:pointer">Taps</button>
      </div>
      <p id="rpt-chart-label" style="font-size:12px;color:#9ca3af;margin:12px 0 4px">Daily installs — last 30 days</p>
      <div id="reportingChart"></div>
    </div>
  </div>
  <!-- Breakdown table -->
  <div style="padding:0 32px 32px">
    <div class="card bg-base-100 shadow-sm" style="overflow:hidden">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #f3f4f6"><h2 style="font-size:16px;font-weight:600;color:#111827">Breakdown</h2><div style="display:flex;gap:8px"><button class="btn btn-xs" style="background:#7c3aed;color:#fff;border:none;border-radius:9999px;font-size:12px">Campaign</button><button class="btn btn-xs btn-ghost" style="border-radius:9999px;font-size:12px">Ad Group</button><button class="btn btn-xs btn-ghost" style="border-radius:9999px;font-size:12px">Keyword</button><button class="btn btn-xs btn-ghost" style="border-radius:9999px;font-size:12px">Country</button><button class="btn btn-xs btn-ghost" style="border-radius:9999px;font-size:12px">Device</button></div></div>
      <div style="overflow-x:auto"><table class="table" style="font-size:14px"><thead><tr style="border-bottom:1px solid #f3f4f6"><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:left">Campaign</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">Impressions</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">Taps</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">TTR</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">Installs</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">CR</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">Spend</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:right">CPI</th></tr></thead><tbody>
        <tr><td style="font-weight:500;color:#111827">TaskFlow — Brand KW</td><td style="text-align:right;color:#374151">320,410</td><td style="text-align:right;color:#374151">11,214</td><td style="text-align:right;color:#374151">3.5%</td><td style="text-align:right;color:#374151">762</td><td style="text-align:right;color:#374151">6.8%</td><td style="text-align:right;color:#374151">$1,843</td><td style="text-align:right;color:#374151">$2.42</td></tr>
        <tr><td style="font-weight:500;color:#111827">TaskFlow — Competitor KW</td><td style="text-align:right;color:#374151">141,200</td><td style="text-align:right;color:#374151">4,901</td><td style="text-align:right;color:#374151">3.5%</td><td style="text-align:right;color:#374151">289</td><td style="text-align:right;color:#374151">5.9%</td><td style="text-align:right;color:#374151">$916</td><td style="text-align:right;color:#374151">$3.17</td></tr>
        <tr><td style="font-weight:500;color:#111827">MoodTrack — Discovery</td><td style="text-align:right;color:#374151">582,000</td><td style="text-align:right;color:#374151">19,270</td><td style="text-align:right;color:#374151">3.3%</td><td style="text-align:right;color:#374151">1,244</td><td style="text-align:right;color:#374151">6.5%</td><td style="text-align:right;color:#374151">$3,102</td><td style="text-align:right;color:#374151">$2.49</td></tr>
        <tr style="background:#f9fafb;font-weight:600"><td style="color:#111827">Total</td><td style="text-align:right;color:#111827">1,043,610</td><td style="text-align:right;color:#111827">35,385</td><td style="text-align:right;color:#111827">3.4%</td><td style="text-align:right;color:#111827">2,295</td><td style="text-align:right;color:#111827">6.5%</td><td style="text-align:right;color:#111827">$5,861</td><td style="text-align:right;color:#111827">$2.55</td></tr>
      </tbody></table></div>
    </div>
  </div>
</div>

<!-- ══ PAGE: BILLING ══ -->
<div id="pg-billing" class="screen">
  <div style="display:flex;align-items:center;justify-content:space-between;padding:28px 32px 8px">
    <h1 style="font-size:24px;font-weight:700;color:#111827">Billing</h1>
    <button class="btn btn-sm" style="background:#7c3aed;border-color:#7c3aed;color:#fff;font-family:'Inter',sans-serif">+ Add Funds</button>
  </div>
  <div style="padding:16px 32px 0;display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
    <!-- Prepaid Balance -->
    <div class="card bg-base-100 shadow-sm" style="padding:24px">
      <h2 style="font-size:16px;font-weight:600;color:#111827;margin-bottom:16px">Prepaid Balance</h2>
      <p style="font-size:36px;font-weight:700;color:#7c3aed;line-height:1.1">$341.60</p>
      <p style="font-size:14px;color:#9ca3af;margin-top:4px">remaining of $1,000</p>
      <div style="margin-top:16px;width:100%;height:10px;background:#f3f4f6;border-radius:5px;overflow:hidden"><div style="width:34%;height:100%;background:#7c3aed;border-radius:5px"></div></div>
      <p style="font-size:12px;color:#9ca3af;margin-top:8px">34% remaining · $658.40 used this cycle</p>
      <p style="font-size:12px;color:#9ca3af;margin-top:20px;margin-bottom:8px">Top up amount</p>
      <div style="display:flex;gap:8px">
        <button class="btn btn-xs" style="background:#7c3aed;color:#fff;border:none;border-radius:9999px;font-size:12px">$50</button>
        <button class="btn btn-xs btn-ghost" style="border-radius:9999px;font-size:12px">$100</button>
        <button class="btn btn-xs btn-ghost" style="border-radius:9999px;font-size:12px">$500</button>
        <button class="btn btn-xs btn-ghost" style="border-radius:9999px;font-size:12px">$1,000</button>
      </div>
    </div>
    <!-- Spend Alerts -->
    <div class="card bg-base-100 shadow-sm" style="padding:24px">
      <h2 style="font-size:16px;font-weight:600;color:#111827;margin-bottom:16px">Spend Alerts</h2>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #f3f4f6"><div><p style="font-size:14px;font-weight:500;color:#111827">Alert at 50% daily budget</p><p style="font-size:12px;color:#9ca3af;margin-top:2px">Email notification</p></div><div class="toggle on" onclick="this.classList.toggle('on');this.classList.toggle('off')"></div></div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid #f3f4f6"><div><p style="font-size:14px;font-weight:500;color:#111827">Alert at 80% daily budget</p><p style="font-size:12px;color:#9ca3af;margin-top:2px">Email notification</p></div><div class="toggle on" onclick="this.classList.toggle('on');this.classList.toggle('off')"></div></div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0"><div><p style="font-size:14px;font-weight:500;color:#111827">Weekly performance digest</p><p style="font-size:12px;color:#9ca3af;margin-top:2px">Every Monday at 9 AM</p></div><div class="toggle off" onclick="this.classList.toggle('on');this.classList.toggle('off')"></div></div>
    </div>
  </div>
  <!-- Invoice History -->
  <div style="padding:0 32px 32px">
    <div class="card bg-base-100 shadow-sm" style="overflow:hidden">
      <div style="padding:16px 24px;border-bottom:1px solid #f3f4f6"><h2 style="font-size:16px;font-weight:600;color:#111827">Invoice History</h2></div>
      <div style="overflow-x:auto"><table class="table" style="font-size:14px"><thead><tr style="border-bottom:1px solid #f3f4f6"><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:left">Invoice #</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:left">Period</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:left">Amount</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:left">Status</th><th style="font-size:12px;font-weight:500;color:#9ca3af;text-align:left"></th></tr></thead><tbody>
        <tr><td style="font-weight:500;color:#111827">INV-0041</td><td style="color:#374151">March 2026</td><td style="color:#374151">$2,140.00</td><td><span class="tag tag-paid">Paid</span></td><td><span style="font-size:14px;color:#7c3aed;font-weight:500;cursor:pointer">Download PDF</span></td></tr>
        <tr><td style="font-weight:500;color:#111827">INV-0038</td><td style="color:#374151">February 2026</td><td style="color:#374151">$1,870.00</td><td><span class="tag tag-paid">Paid</span></td><td><span style="font-size:14px;color:#7c3aed;font-weight:500;cursor:pointer">Download PDF</span></td></tr>
        <tr><td style="font-weight:500;color:#111827">INV-0035</td><td style="color:#374151">January 2026</td><td style="color:#374151">$1,540.00</td><td><span class="tag tag-paid">Paid</span></td><td><span style="font-size:14px;color:#7c3aed;font-weight:500;cursor:pointer">Download PDF</span></td></tr>
        <tr><td style="font-weight:500;color:#111827">INV-0032</td><td style="color:#374151">December 2025</td><td style="color:#374151">$980.00</td><td><span class="tag tag-paid">Paid</span></td><td><span style="font-size:14px;color:#7c3aed;font-weight:500;cursor:pointer">Download PDF</span></td></tr>
      </tbody></table></div>
    </div>
  </div>
</div>

<!-- Tech stack badges (visible on all pages) -->
<div style="padding:0 32px 24px;display:flex;gap:8px;flex-wrap:wrap;margin-top:auto">
  <div class="badge badge-outline gap-1" style="font-size:11px;padding:10px 12px"><span style="color:#7c3aed">●</span> DaisyUI 4.x</div>
  <div class="badge badge-outline gap-1" style="font-size:11px;padding:10px 12px"><span style="color:#10b981">●</span> Tailwind CSS</div>
  <div class="badge badge-outline gap-1" style="font-size:11px;padding:10px 12px"><span style="color:#f59e0b">●</span> ApexCharts</div>
  <div class="badge badge-outline gap-1" style="font-size:11px;padding:10px 12px"><span style="color:#3b82f6">●</span> Inter Font</div>
  <div class="badge badge-outline gap-1" style="font-size:11px;padding:10px 12px"><span style="color:#ef4444">●</span> React-ready</div>
</div>

</div><!-- /main -->
</div><!-- /flex root -->

<script>
// ── Page switching ──
function showPage(id, btn) {
  document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
  document.querySelectorAll('.nav-btn').forEach(function(n) { n.classList.remove('active'); });
  var el = document.getElementById('pg-' + id);
  if (el) el.classList.add('active');
  if (btn) btn.classList.add('active');
  // Render charts when switching to their page
  if (id === 'dashboard' && !window._dashChartRendered) renderDashChart();
  if (id === 'reporting' && !window._rptChartRendered) renderRptChart();
}

// ── Dashboard area chart ──
var _dashChartRendered = false;
function renderDashChart() {
  var days = [], data = [];
  for (var i = 1; i <= 30; i++) { days.push('Apr ' + i); data.push(Math.round(180 + Math.random() * 160)); }
  new ApexCharts(document.querySelector('#spendChart'), {
    chart: { type: 'area', height: 220, fontFamily: 'Inter, sans-serif', toolbar: { show: false }, zoom: { enabled: false } },
    series: [{ name: 'Spend', data: data }],
    xaxis: { categories: days, labels: { style: { fontSize: '10px', colors: '#9ca3af' }, rotate: 0, hideOverlappingLabels: true }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { fontSize: '11px', colors: '#9ca3af' }, formatter: function(v) { return '$' + v; } } },
    colors: ['#7c3aed'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 100] } },
    stroke: { curve: 'smooth', width: 2.5 },
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: function(v) { return '$' + v; } } }
  }).render();
  window._dashChartRendered = true;
}

// ── Reporting bar chart ──
var _rptChartRendered = false;
var _rptChart = null;
var _rptData = {
  Installs:    [62,78,55,90,84,72,68,95,88,76,81,70,65,92,110,98,86,74,69,105,130,160,120,95,88,82,78,91,85,80],
  Spend:       [180,210,165,240,225,195,185,255,235,205,220,190,175,250,295,265,230,200,188,280,350,430,320,255,235,220,210,245,228,215],
  Impressions: [32,38,28,42,40,36,34,45,42,38,40,35,33,44,52,47,41,37,35,50,62,75,57,45,42,39,37,43,40,38],
  Taps:        [1100,1350,980,1480,1400,1250,1180,1580,1470,1320,1390,1220,1140,1530,1820,1640,1430,1280,1210,1740,2160,2620,1980,1570,1460,1360,1290,1500,1400,1320]
};
var _rptDays = [];
for (var i = 1; i <= 30; i++) _rptDays.push('Apr ' + i);

function renderRptChart() {
  _rptChart = new ApexCharts(document.querySelector('#reportingChart'), {
    chart: { type: 'bar', height: 240, fontFamily: 'Inter, sans-serif', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 3, columnWidth: '55%' } },
    series: [{ name: 'Installs', data: _rptData.Installs }],
    xaxis: { categories: _rptDays, labels: { style: { fontSize: '10px', colors: '#9ca3af' }, rotate: 0, hideOverlappingLabels: true }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { fontSize: '11px', colors: '#9ca3af' } } },
    colors: ['#8b5cf6'],
    grid: { borderColor: '#f3f4f6', strokeDashArray: 4 },
    dataLabels: { enabled: false },
    tooltip: { theme: 'light' }
  });
  _rptChart.render();
  window._rptChartRendered = true;
}

function setRptTab(btn) {
  document.querySelectorAll('.rpt-tab').forEach(function(t) { t.style.borderBottomColor = 'transparent'; t.style.color = '#9ca3af'; });
  btn.style.borderBottomColor = '#7c3aed'; btn.style.color = '#7c3aed';
  var metric = btn.getAttribute('data-metric');
  document.getElementById('rpt-chart-label').textContent = 'Daily ' + metric.toLowerCase() + ' \\u2014 last 30 days';
  if (_rptChart) _rptChart.updateSeries([{ name: metric, data: _rptData[metric] }]);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', function() {
  renderDashChart();
});
<\/script>
</body>
</html>`;
}
