import { useState, useRef, useEffect } from "react";
import appadsWireframeRaw from "../assets/docs/appads_wireframe.html?raw";

// ── Icon helper ───────────────────────────────────────────────────────────

const Ico = ({ d, size = 20, strokeWidth = 1.6, fill = "none", stroke = "currentColor" }) => (
  <svg width={size} height={size} fill={fill} stroke={stroke} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  sidebar:   "M4 6h16M4 12h10M4 18h16",
  plus:      "M12 4v16m8-8H4",
  search:    "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  chat:      "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  stack:     ["M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"],
  code:      "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  briefcase: ["M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"],
  palette:   "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  chevDown:  "M19 9l-7 7-7-7",
  send:      "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  x:         "M6 18L18 6M6 6l12 12",
  file:      ["M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"],
  download2: ["M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1", "M12 12V4m0 8l-4-4m4 4l4-4"],
  expand:    "M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4",
  link:      "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  sparkle:   ["M5 3l.5 2L8 6l-2.5.5L5 9l-.5-2.5L2 6l2.5-.5z","M19 3l.5 2L22 6l-2.5.5L19 9l-.5-2.5L16 6l2.5-.5z","M12 1l1 4 4 1-4 1-1 4-1-4-4-1 4-1z"],
  figma:     "M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5zM12 2h3.5a3.5 3.5 0 110 7H12V2zM12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0zM5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0zM5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z",
  prd:       ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  upload:    ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"],
};

// ── File data parser ──────────────────────────────────────────────────────

const KNOWN_COUNTRIES = [
  "United States","Canada","United Kingdom","Australia","Germany",
  "France","Japan","India","Brazil","South Korea","Singapore","UAE",
  "Netherlands","Italy","Spain","Mexico","New Zealand","Sweden","Norway",
];

const DEVICE_MAP = {
  iphone: "iPhone", ipad: "iPad", android: "Android", ios: "iPhone + iPad",
  mobile: "Mobile", tablet: "Tablet",
};

function parseFileData(files) {
  const raw = files.map((f) => f.content || "").join("\n");
  const lower = raw.toLowerCase();
  const fileName = files[0]?.name || "untitled";

  let campaignName = fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")
    .split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  let dailyBudget = "$50.00";
  let totalBudget = null;
  let countries = ["United States", "Canada", "United Kingdom"];
  let device = "iPhone + iPad";
  let startDate = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  let appName = campaignName;
  let campaignType = lower.includes("brand") ? "Brand Keywords"
    : lower.includes("compet") ? "Competitor"
    : lower.includes("discovery") ? "Discovery"
    : lower.includes("search") ? "Search"
    : "Brand US";

  let wireType = "campaign";
  if (lower.includes("revenue") || lower.includes("roas") || lower.includes("impression") || lower.includes("ctr") || lower.includes("cpi"))
    wireType = "reporting";

  const nameMatch = raw.match(/(?:campaign[ _-]*name|name)\s*[:=,\t]\s*([^\n,\r]+)/i);
  if (nameMatch) campaignName = nameMatch[1].trim();

  const dailyMatch = raw.match(/(?:daily[ _-]*budget|daily)\s*[:=,\t]\s*\$?(\d+(?:[.,]\d+)?)/i);
  if (dailyMatch) dailyBudget = "$" + parseFloat(dailyMatch[1].replace(",", "")).toFixed(2);

  const totalMatch = raw.match(/(?:total[ _-]*budget)\s*[:=,\t]\s*\$?(\d+(?:[.,]\d+)?)/i);
  if (totalMatch) totalBudget = "$" + parseFloat(totalMatch[1].replace(",", "")).toFixed(2);

  const found = KNOWN_COUNTRIES.filter((c) => lower.includes(c.toLowerCase()));
  if (found.length > 0) countries = found.slice(0, 4);

  for (const [key, val] of Object.entries(DEVICE_MAP)) {
    if (lower.includes(key)) { device = val; break; }
  }

  const dateMatch = raw.match(/(?:start[ _-]*date|date)\s*[:=,\t]\s*([^\n,\r]+)/i);
  if (dateMatch) {
    const d = new Date(dateMatch[1].trim());
    if (!isNaN(d)) startDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  const appMatch = raw.match(/(?:app|application)[ _-]*name\s*[:=,\t]\s*([^\n,\r]+)/i);
  if (appMatch) appName = appMatch[1].trim();

  return { campaignName, dailyBudget, totalBudget, countries, device, startDate, appName, campaignType, wireType };
}

// ── Reference wireframe (appads_wireframe.html) ───────────────────────────

function buildReferenceWireframe() {
  return `<!DOCTYPE html><html>
<head>
<meta charset="utf-8">
<title>AppAds Wireframe</title>
<style>
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  --color-background-primary: #ffffff;
  --color-background-secondary: #f9fafb;
  --color-background-tertiary: #f3f4f6;
  --color-background-info: #eff6ff;
  --color-background-success: #f0fdf4;
  --color-text-primary: #111827;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  --color-border-tertiary: #e5e7eb;
  --color-border-secondary: #d1d5db;
  --border-radius-md: 6px;
  --border-radius-lg: 10px;
}
html, body { margin: 0; padding: 0; height: 100%; }
</style>
</head>
<body>
${appadsWireframeRaw}
</body>
</html>`;
}

// ── Wireframe HTML generators ─────────────────────────────────────────────

function buildAppAdsWireframe({ campaignName, dailyBudget, totalBudget, countries, device, startDate }) {
  const countryTags = countries
    .map(c => `<span class="ktag">${c} <span class="ktag-x" onclick="this.parentElement.remove()">×</span></span>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>AppAds — New Campaign Wireframe</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;font-size:13px;color:#374151;background:#fff;height:100vh;overflow:hidden;}
.layout{display:flex;height:100vh;}
aside{width:196px;border-right:1px solid #e5e7eb;flex-shrink:0;padding-top:20px;}
.logo{color:#2563eb;font-weight:700;font-size:16px;padding:0 20px 20px;letter-spacing:-.3px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 20px;color:#374151;cursor:pointer;font-size:13px;user-select:none;}
.nav-item:hover{background:#f9fafb;}
.nav-item.active{color:#2563eb;}
.nav-icon{width:16px;height:16px;flex-shrink:0;}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.header{display:flex;align-items:center;padding:14px 32px;border-bottom:1px solid #e5e7eb;gap:16px;}
.header-title{font-size:14px;color:#6b7280;}
.header-actions{margin-left:auto;display:flex;gap:12px;align-items:center;}
.btn-ghost{background:none;border:none;cursor:pointer;font-size:13px;color:#374151;padding:6px 10px;border-radius:4px;}
.btn-primary{background:#1d4ed8;color:#fff;border:none;cursor:pointer;font-size:13px;padding:8px 18px;border-radius:4px;font-weight:500;}
.steps{display:flex;border-bottom:1px solid #e5e7eb;flex-shrink:0;}
.step{flex:1;text-align:center;padding:12px 0;cursor:pointer;border-right:1px solid #e5e7eb;}
.step:last-child{border-right:none;}
.step-num{font-size:11px;color:#9ca3af;margin-bottom:3px;}
.step-label{font-size:13px;color:#6b7280;}
.step.active{background:#1e3a8a;}
.step.active .step-num{color:#93c5fd;}
.step.active .step-label{color:#fff;font-weight:500;}
.step.done .step-label{color:#059669;}
.content{flex:1;overflow-y:auto;padding:28px 32px;}
.field-label{font-size:12px;color:#6b7280;margin-bottom:6px;}
.field-value{font-size:14px;color:#111827;padding-bottom:8px;border-bottom:1px solid #e5e7eb;margin-bottom:22px;}
.field-value.muted{color:#9ca3af;}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:32px;}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:22px;}
.chip{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border:1px solid #bfdbfe;background:#eff6ff;border-radius:20px;color:#2563eb;font-size:12px;}
.chip-x{color:#93c5fd;cursor:pointer;}
.add-country{display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border:1px dashed #d1d5db;border-radius:20px;color:#6b7280;font-size:12px;cursor:pointer;}
.select-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#111827;margin-bottom:22px;}
.section-title{font-size:12px;color:#6b7280;font-weight:500;margin-bottom:16px;margin-top:4px;}
.divider{border:none;border-top:1px solid #e5e7eb;margin:22px 0;}
</style>
</head>
<body>
<div class="layout">
  <aside>
    <div class="logo">AppAds</div>
    <nav>
      <div class="nav-item"><svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>
      <div class="nav-item active"><svg class="nav-icon" fill="none" stroke="#2563eb" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg><span style="color:#2563eb">New campaign</span></div>
      <div class="nav-item"><svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Reporting</div>
    </nav>
  </aside>
  <div class="main">
    <header class="header">
      <span class="header-title">New campaign</span>
      <div class="header-actions">
        <button class="btn-ghost">Save draft</button>
        <button class="btn-primary">Launch campaign</button>
      </div>
    </header>
    <div class="steps">
      <div class="step done"><div class="step-num">01</div><div class="step-label">App</div></div>
      <div class="step active"><div class="step-num">02</div><div class="step-label">Campaign</div></div>
      <div class="step"><div class="step-num">03</div><div class="step-label">Ad group</div></div>
      <div class="step"><div class="step-num">04</div><div class="step-label">Keywords</div></div>
      <div class="step"><div class="step-num">05</div><div class="step-label">Creative</div></div>
    </div>
    <div class="content">
      <div class="section-title">Campaign settings</div>
      <div class="field-label">Campaign name</div>
      <div class="field-value">${campaignName}</div>
      <div class="two-col">
        <div><div class="field-label">Daily budget</div><div class="field-value">${dailyBudget}</div></div>
        <div><div class="field-label">Total budget (optional)</div><div class="field-value muted">${totalBudget || "No limit"}</div></div>
      </div>
      <hr class="divider">
      <div class="section-title">Targeting</div>
      <div class="field-label">Countries / regions</div>
      <div class="chips">${chips}<span class="add-country">+ Add country</span></div>
      <div class="two-col">
        <div><div class="field-label">Device</div><div class="select-row">${device} <span>▾</span></div></div>
        <div><div class="field-label">Age filter</div><div class="select-row">All ages <span>▾</span></div></div>
      </div>
      <div class="two-col">
        <div><div class="field-label">Start date</div><div class="field-value">${startDate}</div></div>
        <div><div class="field-label">End date (optional)</div><div class="field-value muted">No end date</div></div>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

function buildReportingWireframe({ campaignName, countries, startDate }) {
  const rows = [
    { name: campaignName || "Campaign A", status: "Active", spend: "$1,840", imp: "320K", taps: "11,200", inst: "762", cpi: "$2.42" },
    { name: "Campaign B", status: "Paused", spend: "$920", imp: "140K", taps: "4,901", inst: "289", cpi: "$3.17" },
    { name: "Campaign C", status: "Active", spend: "$3,102", imp: "582K", taps: "19,270", inst: "1,244", cpi: "$2.49" },
  ];
  const tableRows = rows.map((r) => `
    <tr>
      <td>${r.name}</td>
      <td><span class="badge ${r.status === "Active" ? "badge-active" : "badge-paused"}">${r.status}</span></td>
      <td class="num">${r.spend}</td><td class="num">${r.imp}</td>
      <td class="num">${r.taps}</td><td class="num">${r.inst}</td>
      <td class="num blue">${r.cpi}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>AppAds — Reporting Wireframe</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;font-size:13px;color:#374151;background:#fff;height:100vh;overflow:hidden;}
.layout{display:flex;height:100vh;}
aside{width:196px;border-right:1px solid #e5e7eb;flex-shrink:0;padding-top:20px;}
.logo{color:#2563eb;font-weight:700;font-size:16px;padding:0 20px 20px;}
.nav-item{display:flex;align-items:center;gap:10px;padding:9px 20px;color:#374151;cursor:pointer;font-size:13px;}
.nav-item.active{color:#2563eb;}
.nav-icon{width:16px;height:16px;}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;}
.header{display:flex;align-items:center;padding:14px 32px;border-bottom:1px solid #e5e7eb;}
.header-title{font-size:15px;font-weight:600;color:#111827;}
.header-actions{margin-left:auto;display:flex;gap:10px;}
.btn-outline{background:#fff;border:1px solid #d1d5db;cursor:pointer;font-size:12px;color:#374151;padding:6px 12px;border-radius:6px;}
.btn-primary{background:#1d4ed8;color:#fff;border:none;cursor:pointer;font-size:12px;padding:7px 16px;border-radius:6px;font-weight:500;}
.content{flex:1;overflow-y:auto;padding:24px 32px;}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;}
.stat-card{border:1px solid #e5e7eb;border-radius:10px;padding:16px;border-top:3px solid;}
.stat-card:nth-child(1){border-top-color:#7c3aed;}
.stat-card:nth-child(2){border-top-color:#0d9488;}
.stat-card:nth-child(3){border-top-color:#059669;}
.stat-card:nth-child(4){border-top-color:#d97706;}
.stat-label{font-size:11px;color:#6b7280;margin-bottom:6px;}
.stat-value{font-size:20px;font-weight:700;}
.table-card{border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;}
.table-header{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #e5e7eb;}
.table-title{font-size:14px;font-weight:600;}
table{width:100%;border-collapse:collapse;}
th{text-align:left;padding:10px 20px;font-size:11px;color:#9ca3af;font-weight:500;border-bottom:1px solid #e5e7eb;}
th.num,td.num{text-align:right;}
td{padding:12px 20px;border-bottom:1px solid #f9fafb;font-size:13px;}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500;}
.badge-active{background:#ccfbf1;color:#0d9488;}
.badge-paused{background:#f3f4f6;color:#6b7280;}
.blue{color:#2563eb;font-weight:500;}
</style>
</head>
<body>
<div class="layout">
  <aside>
    <div class="logo">AppAds</div>
    <nav>
      <div class="nav-item"><svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div>
      <div class="nav-item"><svg class="nav-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>New campaign</div>
      <div class="nav-item active"><svg class="nav-icon" fill="none" stroke="#2563eb" stroke-width="1.8" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><span style="color:#2563eb">Reporting</span></div>
    </nav>
  </aside>
  <div class="main">
    <header class="header">
      <div><div class="header-title">Campaign Dashboard</div></div>
      <div class="header-actions">
        <button class="btn-outline">Last 30 days ▾</button>
        <button class="btn-primary">Export CSV</button>
      </div>
    </header>
    <div class="content">
      <div class="stats">
        <div class="stat-card"><div class="stat-label">Total Spend</div><div class="stat-value" style="color:#7c3aed">$8,240</div></div>
        <div class="stat-card"><div class="stat-label">Impressions</div><div class="stat-value" style="color:#0d9488">1.24M</div></div>
        <div class="stat-card"><div class="stat-label">Taps</div><div class="stat-value" style="color:#059669">41,100</div></div>
        <div class="stat-card"><div class="stat-label">Installs</div><div class="stat-value" style="color:#d97706">2,795</div></div>
      </div>
      <div class="table-card">
        <div class="table-header"><span class="table-title">All Campaigns</span></div>
        <table>
          <thead><tr><th>Campaign</th><th>Status</th><th class="num">Spend</th><th class="num">Impressions</th><th class="num">Taps</th><th class="num">Installs</th><th class="num">CPI</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

function buildFigmaWireframe({ fileName, figmaUrl }) {
  const title = fileName
    ? fileName.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Figma Design";
  const sourceLabel = figmaUrl ? figmaUrl.split("/").slice(-1)[0]?.split("?")[0] || "Figma File" : fileName || "Design File";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title} — HTML Export</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;background:#0f172a;color:#f1f5f9;min-height:100vh;}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 28px;background:#1e293b;border-bottom:1px solid #334155;}
.logo-area{display:flex;align-items:center;gap:10px;}
.figma-badge{display:flex;align-items:center;gap:6px;padding:4px 10px;background:#1a1a2e;border:1px solid #334155;border-radius:6px;font-size:11px;color:#94a3b8;}
.figma-dot{width:8px;height:8px;border-radius:50%;background:linear-gradient(135deg,#a259ff,#1abcfe);}
.page-title{font-size:15px;font-weight:600;color:#f1f5f9;}
.actions{display:flex;gap:8px;}
.btn{padding:7px 16px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:none;}
.btn-ghost{background:transparent;color:#94a3b8;border:1px solid #334155;}
.btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;}
.hero{padding:60px 48px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
.hero-text h1{font-size:36px;font-weight:800;line-height:1.15;background:linear-gradient(135deg,#e2e8f0,#a259ff,#1abcfe);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:16px;}
.hero-text p{font-size:15px;color:#94a3b8;line-height:1.7;margin-bottom:28px;}
.hero-cta{display:flex;gap:12px;}
.cta-primary{padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border-radius:10px;font-weight:600;font-size:14px;border:none;cursor:pointer;}
.cta-ghost{padding:12px 24px;background:transparent;color:#e2e8f0;border:1px solid #334155;border-radius:10px;font-weight:500;font-size:14px;cursor:pointer;}
.hero-visual{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:24px;height:280px;display:flex;flex-direction:column;gap:12px;}
.vis-bar{height:8px;border-radius:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6);}
.vis-bar.w90{width:90%;}
.vis-bar.w70{width:70%;background:linear-gradient(90deg,#06b6d4,#1abcfe);}
.vis-bar.w55{width:55%;background:linear-gradient(90deg,#10b981,#34d399);}
.vis-bar.w40{width:40%;background:linear-gradient(90deg,#f59e0b,#fbbf24);}
.vis-cards{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:auto;}
.vis-card{background:#0f172a;border:1px solid #1e293b;border-radius:10px;padding:12px;}
.vis-card-val{font-size:20px;font-weight:700;color:#6366f1;}
.vis-card-label{font-size:10px;color:#64748b;margin-top:2px;}
.features{padding:0 48px 48px;display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.feat{background:#1e293b;border:1px solid #334155;border-radius:14px;padding:24px;}
.feat-icon{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;margin-bottom:14px;font-size:20px;}
.feat h3{font-size:14px;font-weight:600;color:#f1f5f9;margin-bottom:6px;}
.feat p{font-size:13px;color:#64748b;line-height:1.6;}
.source-tag{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;background:#0f172a;border:1px solid #334155;border-radius:20px;font-size:10px;color:#64748b;margin-bottom:12px;}
</style>
</head>
<body>
<div class="topbar">
  <div class="logo-area">
    <div class="figma-badge"><div class="figma-dot"></div>Figma Export</div>
    <span class="page-title">${title}</span>
  </div>
  <div class="actions">
    <button class="btn btn-ghost">View Source</button>
    <button class="btn btn-primary">Deploy</button>
  </div>
</div>
<div class="hero">
  <div class="hero-text">
    <div class="source-tag">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2"><path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"/><path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z"/><path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z"/></svg>
      ${sourceLabel}
    </div>
    <h1>${title}</h1>
    <p>Your Figma design has been converted to production-ready HTML. Components, spacing, and design tokens have been preserved from the original design.</p>
    <div class="hero-cta">
      <button class="cta-primary">Get Started Free</button>
      <button class="cta-ghost">View Demo</button>
    </div>
  </div>
  <div class="hero-visual">
    <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Performance Overview</div>
    <div class="vis-bar w90"></div>
    <div class="vis-bar w70"></div>
    <div class="vis-bar w55"></div>
    <div class="vis-bar w40"></div>
    <div class="vis-cards">
      <div class="vis-card"><div class="vis-card-val">98%</div><div class="vis-card-label">Fidelity Score</div></div>
      <div class="vis-card"><div class="vis-card-val" style="color:#1abcfe">4.2s</div><div class="vis-card-label">Build Time</div></div>
      <div class="vis-card"><div class="vis-card-val" style="color:#34d399">A+</div><div class="vis-card-label">Accessibility</div></div>
      <div class="vis-card"><div class="vis-card-val" style="color:#fbbf24">100</div><div class="vis-card-label">Perf Score</div></div>
    </div>
  </div>
</div>
<div class="features">
  <div class="feat"><div class="feat-icon" style="background:linear-gradient(135deg,#1e1b4b,#312e81);">🎨</div><h3>Design Tokens</h3><p>Colors, typography, spacing, and shadows extracted directly from your Figma variables and styles.</p></div>
  <div class="feat"><div class="feat-icon" style="background:linear-gradient(135deg,#0c4a6e,#075985);">⚡</div><h3>Optimized Output</h3><p>Clean semantic HTML with Tailwind classes. No bloated inline styles or unnecessary wrappers.</p></div>
  <div class="feat"><div class="feat-icon" style="background:linear-gradient(135deg,#14532d,#166534);">📱</div><h3>Responsive Ready</h3><p>Breakpoints from your Figma frames are automatically mapped to responsive CSS classes.</p></div>
</div>
</body></html>`;
}

function generateWireframeHTML(files, figmaUrl) {
  if (figmaUrl) {
    return { html: buildFigmaWireframe({ figmaUrl }), type: "figma" };
  }
  const isFigma = files.some(f => f.name?.toLowerCase().endsWith(".fig") || f.figmaMode);
  if (isFigma) {
    return { html: buildFigmaWireframe({ fileName: files[0]?.name }), type: "figma" };
  }
  const data = parseFileData(files);
  if (data.wireType === "reporting") return { html: buildReportingWireframe(data), type: "reporting" };
  return { html: buildAppAdsWireframe(data), type: "campaign" };
}

// ── Wireframe renderer ────────────────────────────────────────────────────

const FIGMA_URL = "https://www.figma.com/design/6iBVr1GmTjZIh4PMBJYV55/AppAds-%E2%80%94-UI-Prototype--DaisyUI-?node-id=19-2&t=XuJeZP2vzjWrR1Fm-1";
const FIGMA_PAGES = [
  { label: "Dashboard",    from: "#3b82f6", to: "#6366f1" },
  { label: "New Campaign", from: "#7c3aed", to: "#a855f7" },
  { label: "Reporting",    from: "#0d9488", to: "#06b6d4" },
  { label: "Billing",      from: "#f97316", to: "#fb923c" },
];

function WireframeBlock({ html, type, figmaParams }) {
  const isFigmaDirect = type === "figma-direct";
  const [figmaState, setFigmaState] = useState(isFigmaDirect ? "generating" : "idle");
  const [stepIdx, setStepIdx]       = useState(0);

  const steps = [
    "Analysing wireframe structure…",
    figmaParams?.font   ? `Applying ${figmaParams.font} typography…`   : "Extracting components & tokens…",
    figmaParams?.ui     ? `Configuring ${figmaParams.ui} design tokens…` : "Building Figma layers…",
    figmaParams?.charts ? `Setting up ${figmaParams.charts} components…` : "Exporting to Figma file…",
  ];

  useEffect(() => {
    if (!isFigmaDirect) return;
    const interval = setInterval(() => setStepIdx(i => i + 1), 600);
    const timer    = setTimeout(() => { clearInterval(interval); setFigmaState("done"); }, 2600);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [isFigmaDirect]);

  const openFull = () => {
    const blob = new Blob([html], { type: "text/html" });
    window.open(URL.createObjectURL(blob), "_blank");
  };
  const download = () => {
    const blob = new Blob([html], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `appads-${type}-output.html`;
    a.click();
  };
  const handleGenerateFigma = () => {
    setFigmaState("generating");
    setStepIdx(0);
    const interval = setInterval(() => setStepIdx(i => i + 1), 600);
    setTimeout(() => { clearInterval(interval); setFigmaState("done"); }, 2600);
  };

  const typeLabel = { figma: "Figma → HTML", reporting: "Reporting Dashboard", campaign: "Campaign Creation", appads: "AppAds Wireframe", "wireframe-figma": "Wireframe → Figma", "figma-direct": "Wireframe → Figma" }[type] || type;
  const typeColor = { figma: "text-purple-600", reporting: "text-teal-600", campaign: "text-blue-600", appads: "text-blue-700", "wireframe-figma": "text-emerald-600", "figma-direct": "text-purple-600" }[type] || "text-gray-600";

  return (
    <div className="mt-3 w-full">
      {/* toolbar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className={`text-xs font-medium ml-1 ${typeColor}`}>{typeLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          {figmaState === "idle" && (
            <>
              <button onClick={download} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100">
                <Ico d={ICONS.download2} size={12} /> Download HTML
              </button>
              <button onClick={openFull} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium px-2 py-1 rounded hover:bg-indigo-50">
                <Ico d={ICONS.expand} size={12} /> Open fullscreen
              </button>
              <button onClick={handleGenerateFigma}
                className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg shadow-sm transition-all"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 2px 8px rgba(124,58,237,0.4)" }}>
                <Ico d={ICONS.figma} size={12} stroke="white" /> Generate Figma
              </button>
            </>
          )}
          {figmaState === "generating" && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-purple-600 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200">
              <svg className="animate-spin" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Generating Figma…
            </span>
          )}
          {figmaState === "done" && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7"/></svg>
              Figma ready
            </span>
          )}
        </div>
      </div>

      {/* body — iframe OR generating overlay OR figma result */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-md" style={{ minHeight: 500 }}>

        {figmaState === "idle" && (
          <iframe srcDoc={html} sandbox="allow-same-origin allow-scripts" title="Generated output"
            style={{ width: "100%", height: 500, display: "block", border: "none" }} />
        )}

        {figmaState === "generating" && (
          <div className="flex flex-col items-center justify-center gap-6 h-full"
            style={{ minHeight: 500, background: "linear-gradient(135deg,#1e1b4b 0%,#2e1065 50%,#1e1b4b 100%)" }}>
            {/* animated rings */}
            <div className="relative flex items-center justify-center" style={{ width: 96, height: 96 }}>
              <div className="absolute inset-0 rounded-full border-2 border-purple-400/30" style={{ animation: "ping 1.4s ease-out infinite" }} />
              <div className="absolute inset-2 rounded-full border-2 border-violet-400/40" style={{ animation: "ping 1.4s ease-out 0.3s infinite" }} />
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 0 32px rgba(167,85,247,0.6)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                  <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z"/>
                  <path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z"/>
                  <path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"/>
                  <path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z"/>
                  <path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z"/>
                </svg>
              </div>
            </div>
            {/* steps */}
            <div className="flex flex-col items-center gap-2">
              {steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 transition-all duration-300"
                  style={{ opacity: i <= stepIdx ? 1 : 0.25 }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: i < stepIdx ? "#10b981" : i === stepIdx ? "#a855f7" : "#374151" }}>
                    {i < stepIdx
                      ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                      : i === stepIdx
                      ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white", animation: "pulse 1s ease-in-out infinite" }} />
                      : <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#6b7280" }} />
                    }
                  </div>
                  <span className="text-xs font-medium" style={{ color: i <= stepIdx ? "#e9d5ff" : "#6b7280" }}>{s}</span>
                </div>
              ))}
            </div>
            {/* param badges */}
            {figmaParams && (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {[
                  { icon: "T", label: figmaParams.font },
                  { icon: "◈", label: figmaParams.ui },
                  ...(figmaParams.charts ? [{ icon: "↗", label: figmaParams.charts }] : []),
                ].map(({ icon, label }) => (
                  <span key={label} style={{ background: "rgba(167,85,247,0.15)", border: "1px solid rgba(167,85,247,0.3)", borderRadius: 8, padding: "3px 10px", fontSize: 11, color: "#e9d5ff", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ opacity: 0.7, fontSize: 10 }}>{icon}</span>{label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {figmaState === "done" && (
          <div className="flex flex-col" style={{ minHeight: 500, background: "linear-gradient(135deg,#faf5ff,#f5f3ff)" }}>
            {/* header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-purple-100">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 12px rgba(124,58,237,0.4)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                  <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z"/>
                  <path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z"/>
                  <path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"/>
                  <path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z"/>
                  <path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">Figma file ready</p>
                <p className="text-xs text-gray-500 truncate">AppAds — UI Prototype (DaisyUI) · 4 pages</p>
              </div>
              <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-xl flex-shrink-0 transition-all"
                style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 2px 8px rgba(124,58,237,0.4)" }}>
                <Ico d={ICONS.link} size={11} stroke="white" /> Open in Figma
              </a>
            </div>
            {/* 4 page tiles */}
            <div className="grid grid-cols-4 gap-4 p-6 flex-1">
              {FIGMA_PAGES.map((page, i) => (
                <a key={page.label} href={FIGMA_URL} target="_blank" rel="noopener noreferrer"
                  className="flex flex-col rounded-2xl overflow-hidden border border-purple-100 bg-white hover:border-purple-300 hover:shadow-lg transition-all group"
                  style={{ animation: `fadeSlideIn 0.3s ease-out ${i * 0.08}s both` }}>
                  <div className="flex-1 flex items-center justify-center py-8"
                    style={{ background: `linear-gradient(135deg,${page.from},${page.to})` }}>
                    <svg width="32" height="32" fill="none" stroke="white" strokeWidth="1.4" viewBox="0 0 24 24" opacity="0.9">
                      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                    </svg>
                  </div>
                  <div className="px-3 py-2.5 border-t border-purple-50">
                    <p className="text-xs font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">{page.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Page {i + 1}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Suggestion prompts ────────────────────────────────────────────────────

const SUGGESTIONS = [
  { label: "Write ad copy", prompt: "Help me write compelling ad copy for a mobile app campaign.", color: "from-violet-50 to-purple-50 border-violet-200 text-violet-700 hover:from-violet-100 hover:to-purple-100" },
  { label: "Key metrics", prompt: "Explain the key metrics I should track for a mobile ad campaign.", color: "from-blue-50 to-cyan-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-cyan-100" },
  { label: "Calculate ROAS", prompt: "Write a JavaScript function to calculate ROAS from campaign data.", color: "from-emerald-50 to-teal-50 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-teal-100" },
  { label: "Ad trends 2026", prompt: "What are the most surprising mobile advertising trends in 2026?", color: "from-orange-50 to-amber-50 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-amber-100" },
  { label: "Grow my skills", prompt: "What skills should I develop to grow as a digital advertising manager?", color: "from-pink-50 to-rose-50 border-pink-200 text-pink-700 hover:from-pink-100 hover:to-rose-100" },
];

// ── AI response builder ───────────────────────────────────────────────────

function buildAiResponse(text, files, figmaUrl) {
  const lower = text.toLowerCase();

  if (files.some(f => f.wireframeMode)) {
    const names = files.map(f => `**${f.name}**`).join(", ");
    const font   = lower.includes("inter") ? "Inter" : lower.includes("poppins") ? "Poppins" : lower.includes("roboto") ? "Roboto" : "Inter";
    const ui     = lower.includes("daisy") ? "DaisyUI" : lower.includes("material") ? "Material UI" : lower.includes("chakra") ? "Chakra UI" : lower.includes("ant") ? "Ant Design" : "DaisyUI";
    const charts = lower.includes("apex") ? "Apex Charts" : lower.includes("recharts") ? "Recharts" : lower.includes("chart.js") ? "Chart.js" : lower.includes("d3") ? "D3.js" : null;
    const figmaParams = { font, ui, charts };
    const chartLine = charts ? `\n- **Charts:** ${charts}` : "";
    return {
      text: `I've analysed your wireframe ${names}.\n\n**Design system applied:**\n- **Font:** ${font}\n- **UI Library:** ${ui}${chartLine}\n- Layout structure & component hierarchy\n- Spacing & sizing tokens\n\nGenerating your Figma file now…`,
      wireframe: "__figma_direct__",
      wireType: "figma-direct",
      figmaParams,
    };
  }

  if (figmaUrl || files.some(f => f.figmaMode || f.name?.toLowerCase().endsWith(".fig"))) {
    const { html, type } = generateWireframeHTML(files, figmaUrl);
    const source = figmaUrl ? `Figma URL` : `**${files[0]?.name}**`;
    return {
      text: `I've converted your ${source} into production-ready **HTML**.\n\nThe output includes:\n- Extracted design tokens (colors, typography, spacing)\n- Semantic HTML structure\n- Responsive breakpoints\n- Optimized component layout\n\nYou can open it fullscreen or download the HTML file below.`,
      wireframe: html, wireType: type,
    };
  }

  if (files.length > 0 && lower.includes("generate wireframe")) {
    const html = buildReferenceWireframe();
    const names = files.map((f) => `**${f.name}**`).join(", ");
    return {
      text: `I've generated the **AppAds wireframe** from ${names}.\n\nThe interactive wireframe includes:\n- **Dashboard** — campaign overview & stats\n- **New campaign** — multi-step creation flow\n- **Reporting** — analytics & breakdown\n- **Billing** — prepaid balance & invoices\n\nUse the sidebar to navigate between screens. Open fullscreen for the best experience.`,
      wireframe: html,
      wireType: "appads",
    };
  }

  if (files.length > 0) {
    const { html, type } = generateWireframeHTML(files);
    const names = files.map((f) => `**${f.name}**`).join(", ");
    const parsed = parseFileData(files);
    const detail = type === "reporting"
      ? `I detected **metrics/analytics data** in ${names} and generated a **Reporting Dashboard** wireframe.`
      : `I detected **campaign data** in ${names} and generated a **Campaign Creation** wireframe:\n- Name: **${parsed.campaignName}**\n- Budget: **${parsed.dailyBudget}/day**\n- Markets: **${parsed.countries.slice(0, 3).join(", ")}**`;
    return { text: `${detail}\n\nInteract with the wireframe below, or open it fullscreen / download the HTML.`, wireframe: html, wireType: type };
  }

  let text_resp = "";
  if (lower.includes("roas") || lower.includes("javascript") || lower.includes("function") || lower.includes("code")) {
    text_resp = `Here's a JavaScript function to calculate ROAS:\n\n\`\`\`javascript\nfunction calculateROAS(revenue, adSpend) {\n  if (adSpend === 0) return 0;\n  return (revenue / adSpend).toFixed(2);\n}\n\nconst campaigns = [\n  { name: 'Brand KW', revenue: 3840, spend: 1840 },\n  { name: 'Competitor', revenue: 2760, spend: 920 },\n];\n\ncampaigns.forEach(c => {\n  console.log(\`\${c.name}: ROAS = \${calculateROAS(c.revenue, c.spend)}x\`);\n});\n\`\`\`\n\nA ROAS above **2x** is profitable. For mobile, target **3x+** to cover acquisition costs.`;
  } else if (lower.includes("metric") || lower.includes("track") || lower.includes("kpi")) {
    text_resp = `**Key metrics** for mobile ad campaigns:\n\n**Performance**\n- **CTR** — benchmark: 0.5%–2%\n- **CVR** — varies by vertical\n- **CPI** — target depends on LTV\n- **ROAS** — aim for 3x+ in most verticals\n\n**Engagement**\n- **TTR** — for playable / interactive ads\n- **Day-1 Retention** — early user quality signal\n- **LTV** — the north star metric\n\n**Cost Efficiency**\n- **eCPM** — inventory cost\n- **CPA** — cost per post-install event`;
  } else if (lower.includes("write") || lower.includes("copy") || lower.includes("ad copy")) {
    text_resp = `**Ad copy variants** for your mobile campaign:\n\n**Option A — Benefit-led**\n> *"Run your entire business from your phone. 50,000+ teams trust AppAds."*\n\n**Option B — Social proof**\n> *"Join 50K+ marketers who doubled their ROAS. Start free."*\n\n**Option C — Pain-point**\n> *"Tired of juggling 5 tools for one campaign? AppAds unifies everything."*\n\n**Tips:** Keep headlines under 30 chars for mobile. Always A/B test 3+ variants per ad set.`;
  } else if (lower.includes("trend") || lower.includes("surprise") || lower.includes("2026")) {
    text_resp = `**Surprising mobile ad insights for 2026:**\n\nPlayable ads have a **3-5x higher install rate** than standard video — yet only ~12% of advertisers use them.\n\n**Trends worth watching:**\n1. AI-generated creative reducing cost-per-creative by ~60%\n2. Privacy-first targeting outperforming IDFA on iOS\n3. Rewarded video CTR up 40% YoY\n4. CTV → mobile retargeting emerging as high-ROI funnel\n5. Contextual targeting making a comeback post-ATT`;
  } else if (lower.includes("career") || lower.includes("skill") || lower.includes("grow")) {
    text_resp = `To grow as a **digital advertising manager** in 2026:\n\n**Technical skills**\n- Mobile attribution (AppsFlyer, Adjust, Branch)\n- SQL for pulling campaign data directly\n- Python basics for automation & reporting\n\n**Strategic skills**\n- Full-funnel thinking (UA → engagement → LTV)\n- Privacy-first measurement (SKAdNetwork)\n- Incrementality testing design\n\n**Soft skills**\n- Data storytelling for exec reporting\n- Cross-functional collaboration (product, design, data)`;
  } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    text_resp = `Hey there! 👋 I'm your AppAds AI assistant.\n\nHere's what I can help with:\n- **Wireframes** — upload any .txt, .csv, .json file\n- **Figma → HTML** — paste a Figma URL or upload a file\n- **Ad copy & creative** — writing and ideation\n- **Campaign analysis** — interpreting performance data\n- **Code** — scripts, automation, data processing\n\nWhat are you working on today?`;
  } else {
    text_resp = `Great question about *"${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"*\n\nTo give you the most useful answer, I'd love more context:\n\n1. **Goal** — what outcome are you optimizing for?\n2. **Data** — upload a file and I'll generate an interactive wireframe\n3. **Figma** — paste a Figma URL to convert your design to HTML\n\nFeel free to share more details — I'll get to work instantly.`;
  }
  return { text: text_resp, wireframe: null, wireType: null };
}

// ── Typing indicator ──────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-end gap-1.5 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-2 h-2 rounded-full bg-indigo-400 inline-block"
          style={{ animation: `tdot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
      ))}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  const renderText = (text) => {
    const parts = (text || "").split(/(```[\s\S]*?```)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("```")) {
        const lang = part.match(/```(\w+)/)?.[1] || "";
        const code = part.replace(/```\w*\n?/, "").replace(/```$/, "");
        return (
          <div key={idx} className="mt-3 mb-2 rounded-xl overflow-hidden border border-gray-100">
            {lang && <div className="px-4 py-1.5 bg-gray-800 text-xs text-gray-400 font-mono border-b border-gray-700">{lang}</div>}
            <pre className="text-xs bg-gray-900 text-gray-100 p-4 overflow-x-auto font-mono leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return (
        <div key={idx}>
          {part.split("\n").map((line, i) => {
            if (line.match(/^\*\*.*\*\*$/) && !line.slice(2, -2).includes("**"))
              return <p key={i} className="font-semibold mt-3 mb-1 text-gray-900">{line.replace(/\*\*/g, "")}</p>;
            if (line.match(/\*\*/))
              return <p key={i} className="my-0.5">{line.split(/(\*\*.*?\*\*)/).map((p, j) =>
                p.startsWith("**") ? <strong key={j} className="text-gray-900">{p.replace(/\*\*/g, "")}</strong> : p)}</p>;
            if (line.startsWith("- ") || line.startsWith("* "))
              return <li key={i} className="ml-4 list-disc leading-relaxed text-gray-700">{line.slice(2)}</li>;
            if (line.match(/^\d+\. /))
              return <li key={i} className="ml-4 list-decimal leading-relaxed text-gray-700">{line.replace(/^\d+\. /, "")}</li>;
            if (line.startsWith("> "))
              return <blockquote key={i} className="border-l-3 border-indigo-300 pl-4 italic text-gray-500 my-2 bg-indigo-50/50 py-2 rounded-r-lg">{line.slice(2)}</blockquote>;
            if (line === "") return <div key={i} className="h-2" />;
            return <p key={i} className="my-0.5 leading-relaxed">{line}</p>;
          })}
        </div>
      );
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-6`}
      style={{ animation: "fadeSlideIn 0.25s ease-out" }}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L13.8 8.2L20 7L15.8 12L20 17L13.8 15.8L12 22L10.2 15.8L4 17L8.2 12L4 7L10.2 8.2L12 2Z" />
          </svg>
        </div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-white text-xs font-bold shadow-sm"
          style={{ background: "linear-gradient(135deg, #374151, #111827)" }}>UP</div>
      )}

      <div className={`flex flex-col gap-1.5 ${isUser ? "items-end max-w-lg" : "items-start w-full max-w-2xl"}`}>
        {msg.files?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {msg.files.map((f, i) => (
              <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs shadow-sm border ${f.wireframeMode ? "bg-emerald-50 border-emerald-200 text-emerald-700" : f.figmaMode ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-white border-gray-200 text-gray-600"}`}>
                {f.wireframeMode
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                  : f.figmaMode
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a259ff" strokeWidth="2"><path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"/><path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z"/><path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z"/></svg>
                  : <Ico d={ICONS.file[0]} size={12} />
                }
                <span className="font-medium">{f.name}</span>
                <span className="text-gray-400">({(f.size / 1024).toFixed(1)} KB)</span>
              </div>
            ))}
          </div>
        )}
        {msg.figmaUrl && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-700 mb-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a259ff" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
            <span className="font-medium truncate max-w-[200px]">{msg.figmaUrl}</span>
          </div>
        )}

        {msg.content && (
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "text-white rounded-tr-sm shadow-sm"
              : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm shadow-sm w-full"
          }`} style={isUser ? { background: "linear-gradient(135deg, #1e293b, #374151)" } : {}}>
            {renderText(msg.content)}
          </div>
        )}

        {msg.wireframe && <WireframeBlock html={msg.wireframe} type={msg.wireType} figmaParams={msg.figmaParams} />}
      </div>
    </div>
  );
}

// ── Upload action cards (empty state) ─────────────────────────────────────

function UploadCard({ icon, gradient, title, desc, badge, onClick, accent, features }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="relative text-left rounded-2xl border transition-all duration-200 group overflow-hidden flex flex-col"
      style={{
        background: hover ? "white" : "rgba(255,255,255,0.75)",
        borderColor: hover ? accent + "55" : "rgba(0,0,0,0.07)",
        boxShadow: hover ? `0 12px 40px ${accent}22, 0 2px 8px rgba(0,0,0,0.06)` : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hover ? "translateY(-3px)" : "none",
      }}>
      {/* Hover glow */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ opacity: hover ? 1 : 0, background: `radial-gradient(ellipse at 20% 20%, ${accent}10, transparent 65%)` }} />

      {/* Top gradient strip */}
      <div className="h-1 w-full rounded-t-2xl" style={{ background: gradient }} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Icon row + badge */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: gradient }}>
            {icon}
          </div>
          {badge && (
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold tracking-wide"
              style={{ background: accent + "15", color: accent }}>
              {badge}
            </span>
          )}
        </div>

        {/* Title + desc */}
        <div>
          <p className="font-semibold text-gray-900 text-sm mb-1 leading-snug">{title}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
        </div>

        {/* Feature pills */}
        {features && (
          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            {features.map(f => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={{ background: accent + "0d", color: accent + "cc", border: `1px solid ${accent}20` }}>
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* CTA footer */}
      <div className="px-5 pb-4 flex items-center justify-between">
        <span className="text-xs font-medium transition-colors duration-200"
          style={{ color: hover ? accent : "#9ca3af" }}>
          Click to upload
        </span>
        <div className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
          style={{ background: hover ? accent + "15" : "transparent", color: hover ? accent : "#d1d5db" }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

// ── Figma URL input ───────────────────────────────────────────────────────

function FigmaUrlModal({ onClose, onSubmit }) {
  const [url, setUrl] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: "scaleIn 0.2s ease-out", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>

        {/* Gradient header */}
        <div className="p-6 pb-5" style={{ background: "linear-gradient(135deg, #faf5ff, #eff6ff)" }}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg, #a259ff, #1abcfe)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z"/>
                <path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z"/>
                <path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"/>
                <path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z"/>
                <path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z"/>
              </svg>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-colors">
              <Ico d={ICONS.x} size={16} />
            </button>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">Figma → HTML</h3>
          <p className="text-sm text-gray-500">Paste your Figma design URL and we'll convert it into production-ready HTML with design tokens preserved.</p>
        </div>

        <div className="p-6 pt-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Figma URL</label>
          <input ref={inputRef} value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && url.trim() && onSubmit(url.trim())}
            placeholder="https://www.figma.com/design/..."
            className="w-full text-sm border rounded-xl px-4 py-3 outline-none transition-all mb-4"
            style={{ borderColor: url ? "#a259ff60" : "#e5e7eb", boxShadow: url ? "0 0 0 3px #a259ff15" : "none" }}
          />

          {/* Tips */}
          <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ background: "#f5f3ff" }}>
            <svg width="14" height="14" fill="none" stroke="#a259ff" strokeWidth="2" viewBox="0 0 24 24" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p className="text-xs text-purple-700 leading-relaxed">Open your file in Figma, click <strong>Share</strong>, then copy the link. Works with frames, components, and full files.</p>
          </div>

          <div className="flex gap-2.5">
            <button onClick={onClose}
              className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
              Cancel
            </button>
            <button onClick={() => url.trim() && onSubmit(url.trim())} disabled={!url.trim()}
              className="flex-1 py-2.5 text-sm text-white rounded-xl font-semibold transition-all disabled:opacity-35"
              style={{ background: "linear-gradient(135deg, #a259ff, #1abcfe)", boxShadow: url.trim() ? "0 4px 12px #a259ff30" : "none" }}>
              Convert to HTML →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Chat input box ────────────────────────────────────────────────────────

function ChatBox({ input, setInput, files, setFiles, onSend, onKeyDown, fileInputRef, figmaInputRef, handleFiles, loading, textareaRef, compact }) {
  const canSend = !loading && (input.trim() || files.length > 0);

  return (
    <div className="w-full bg-white rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        maxWidth: compact ? "100%" : 560,
        border: "1px solid rgba(99,102,241,0.15)",
        boxShadow: "0 4px 24px rgba(99,102,241,0.1), 0 1px 4px rgba(0,0,0,0.06)",
      }}>
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-3">
          {files.map((f, i) => (
            <div key={i} className={`flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs border ${f.wireframeMode ? "bg-emerald-50 border-emerald-200 text-emerald-700" : f.figmaMode ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
              {f.wireframeMode
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                : f.figmaMode
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a259ff" strokeWidth="2"><path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"/><path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z"/><path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z"/></svg>
                : <Ico d={ICONS.file[0]} size={11} />
              }
              <span className="font-medium max-w-[110px] truncate">{f.name}</span>
              <button onClick={() => setFiles(p => p.filter((_, idx) => idx !== i))}
                className="ml-0.5 opacity-60 hover:opacity-100 rounded">
                <Ico d={ICONS.x} size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea ref={textareaRef} rows={1} value={input}
        onChange={e => setInput(e.target.value)} onKeyDown={onKeyDown}
        placeholder="Ask anything, upload a doc, or paste a Figma URL…"
        className="w-full resize-none bg-transparent outline-none px-4 pt-3.5 pb-2 text-sm text-gray-800 placeholder-gray-400 leading-relaxed"
        style={{ minHeight: 50, maxHeight: 160 }}
      />

      <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-2">
        <div className="flex items-center gap-1">
          <button onClick={() => fileInputRef.current?.click()} title="Upload document or data file"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Ico d={ICONS.prd} size={17} />
          </button>
          <button onClick={() => figmaInputRef.current?.click()} title="Upload Figma file"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z"/>
              <path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z"/>
              <path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"/>
              <path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z"/>
              <path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z"/>
            </svg>
          </button>
          {files.some(f => f.wireframeMode) && (
            <button
              onClick={() => !loading && onSend("Generate Figma.")}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50 ml-1"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)", boxShadow: "0 2px 8px rgba(124,58,237,0.35)" }}
            >
              <Ico d={ICONS.figma} size={12} stroke="white" />
              Generate Figma
            </button>
          )}
          {files.some(f => !f.figmaMode && !f.wireframeMode) && (
            <button
              onClick={() => !loading && onSend("Generate wireframe.")}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 disabled:opacity-50 ml-1"
              style={{ background: "linear-gradient(135deg, #1e293b, #374151)", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}
            >
              <Ico d={ICONS.sparkle} size={12} stroke="white" />
              Generate wireframe
            </button>
          )}
        </div>

        <input ref={fileInputRef} type="file" multiple
          accept=".txt,.csv,.docx,.json,.md,.log,.xml,.html,.js,.ts,.py,.tsv,.pdf"
          className="hidden" onChange={handleFiles} />
        <input ref={figmaInputRef} type="file" multiple
          accept=".fig,.svg"
          className="hidden" onChange={(e) => handleFiles(e, true)} />

        <div className="flex items-center gap-2">
          {/* <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
            Sonnet 4.6 <Ico d={ICONS.chevDown} size={11} />
          </button> */}
          <button onClick={() => canSend && onSend()} disabled={!canSend}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200"
            style={canSend
              ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", boxShadow: "0 2px 8px #6366f140" }
              : { background: "#f3f4f6", color: "#9ca3af" }}>
            <Ico d={ICONS.send} size={14} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function AiChatPage() {

  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [files, setFiles]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [activeNav, setActiveNav]   = useState("chat");
  const [showFigmaModal, setShowFigmaModal] = useState(false);

  const fileInputRef        = useRef(null);
  const figmaInputRef       = useRef(null);
  const wireframeInputRef   = useRef(null);
  const messagesEndRef      = useRef(null);
  const textareaRef         = useRef(null);

  const hasMessages = messages.length > 0;

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const handleFiles = (e, isFigma = false) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setFiles(prev => [...prev, {
          name: file.name, size: file.size, type: file.type,
          content: ev.target.result, figmaMode: isFigma,
        }]);
      reader.readAsText(file);
    });
    e.target.value = "";
  };

  const handleWireframeFiles = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      const isImage = file.type.startsWith("image/");
      reader.onload = (ev) =>
        setFiles(prev => [...prev, {
          name: file.name, size: file.size, type: file.type,
          content: ev.target.result, wireframeMode: true, isImage,
        }]);
      if (isImage) reader.readAsDataURL(file);
      else reader.readAsText(file);
    });
    e.target.value = "";
  };

  const send = async (text = input, figmaUrl = null) => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0 && !figmaUrl) return;
    const userMsg = { role: "user", content: trimmed, files: [...files], figmaUrl, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput(""); setFiles([]); setLoading(true);
    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
    const { text: resp, wireframe, wireType, figmaParams } = buildAiResponse(trimmed, userMsg.files, figmaUrl);
    setMessages(prev => [...prev, { role: "assistant", content: resp, wireframe, wireType, figmaParams, id: Date.now() + 1 }]);
    setLoading(false);
  };

  const handleFigmaUrl = (url) => {
    setShowFigmaModal(false);
    send("Convert this Figma design to HTML", url);
  };

  const onKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  const navItems = [
    { id: "sidebar", d: ICONS.sidebar, tip: "Menu" },
    { id: "plus", d: ICONS.plus, tip: "New chat" },
    { id: "search", d: ICONS.search, tip: "Search" },
    { id: "chat", d: ICONS.chat, tip: "Chats" },
    { id: "stack", d: ICONS.stack, tip: "Projects" },
    { id: "code", d: ICONS.code, tip: "Code" },
    { id: "briefcase", d: ICONS.briefcase, tip: "Work" },
    { id: "palette", d: ICONS.palette, tip: "Design" },
  ];

  return (
    <div className="flex overflow-hidden min-h-screen" style={{ background: "#eeebe4", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Sidebar */}
      <aside className="w-14 flex flex-col items-center py-4 gap-1 shrink-0 z-10"
        style={{ borderRight: "1px solid rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)" }}>
        {/* Back to Dashboard */}
        <button onClick={() => window.location.reload()} title="Refresh chat"
          className="w-9 h-9 flex items-center justify-center rounded-xl mb-2 transition-all duration-150 text-gray-400 hover:text-indigo-600 hover:bg-white"
          style={{ boxShadow: "none" }}>
          <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        <div className="flex flex-col items-center gap-1 flex-1">
          {navItems.map(({ id, d, tip }) => (
            <button key={id} onClick={() => setActiveNav(id)} title={tip}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 group/nav"
              style={activeNav === id
                ? { background: "white", color: "#6366f1", boxShadow: "0 2px 8px rgba(99,102,241,0.2)" }
                : { color: "#9ca3af" }
              }>
              <span style={activeNav === id ? {} : {}} className="group-hover/nav:text-indigo-500 transition-colors">
                <Ico d={d} size={17} />
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="relative">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors">
              <Ico d={ICONS.download2} size={17} />
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2"
              style={{ background: "#6366f1", borderColor: "#f0ede6" }} />
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white/50"
            style={{ background: "linear-gradient(135deg, #374151, #111827)" }}>UP</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">

        {/* Dot-grid + blob background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Soft blobs */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, #818cf8, transparent 65%)", filter: "blur(80px)" }} />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #a78bfa, transparent 65%)", filter: "blur(80px)" }} />
          {/* Dot grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#6366f1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* ── Empty state ── */}
        {!hasMessages && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 relative min-h-screen overflow-auto py-[2vw]">

            {/* Header badge */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-semibold tracking-wide uppercase"
              style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(99,102,241,0.2)", backdropFilter: "blur(10px)", color: "#6366f1", letterSpacing: "0.06em" }}>
              <svg width="11" height="11" fill="#6366f1" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Affle AI — AppAds Assistant
            </div>

            {/* Ergon title */}
            <div className="flex items-center gap-3 mb-3">
              {/* Animated orb */}
              <div className="relative w-10 h-10 shrink-0">
                <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", animationDuration: "2.4s" }} />
                <div className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 24px #6366f155" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L13.8 8.2L20 7L15.8 12L20 17L13.8 15.8L12 22L10.2 15.8L4 17L8.2 12L4 7L10.2 8.2L12 2Z" />
                  </svg>
                </div>
              </div>
              <h1 style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "3.4rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1.4,
                background: "linear-gradient(135deg, #1e293b 0%, #4f46e5 45%, #7c3aed 75%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Ergon
              </h1>
            </div>

            {/* Description */}
            <p className="text-center text-gray-500 text-[0.9rem] leading-relaxed mb-1 max-w-sm">
              Your AI-powered campaign intelligence assistant.
            </p>
            <p className="text-center text-gray-400 text-xs leading-relaxed mb-8 max-w-xs">
              Upload docs, convert Figma designs, write ad copy, and analyse performance — all in one place.
            </p>

            {/* Upload action cards */}
            <div className="w-full max-w-[840px] grid grid-cols-3 gap-4 mb-6">
              <UploadCard
                icon={<Ico d={ICONS.prd} size={20} stroke="white" />}
                gradient="linear-gradient(135deg, #3b82f6, #6366f1)"
                title="Upload PRD / Document"
                desc="Turn requirements, briefs, or data files into interactive wireframes instantly."
                badge="Auto-wireframe"
                accent="#6366f1"
                features={[".txt", ".csv", ".json", ".docx"]}
                onClick={() => fileInputRef.current?.click()}
              />
              <UploadCard
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>}
                gradient="linear-gradient(135deg, #10b981, #14b8a6)"
                title="Wireframe → Figma"
                desc="Upload HTML wireframes or images and generate Figma-ready design specs."
                badge="Beta"
                accent="#10b981"
                features={[".html", ".png", ".jpg"]}
                onClick={() => wireframeInputRef.current?.click()}
              />
              <UploadCard
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M5 5.5A3.5 3.5 0 018.5 2H12v7H8.5A3.5 3.5 0 015 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 110 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z"/><path d="M5 19.5A3.5 3.5 0 018.5 16H12v3.5a3.5 3.5 0 11-7 0z"/><path d="M5 12.5A3.5 3.5 0 018.5 9H12v7H8.5A3.5 3.5 0 015 12.5z"/></svg>}
                gradient="linear-gradient(135deg, #a259ff, #1abcfe)"
                title="Figma → HTML"
                desc="Paste a Figma URL or upload a design file. Get production-ready HTML back."
                badge="New"
                accent="#a259ff"
                features={["URL", ".fig", ".svg"]}
                onClick={() => setShowFigmaModal(true)}
              />
            </div>

            {/* Chat input */}
            <ChatBox input={input} setInput={setInput} files={files} setFiles={setFiles}
              onSend={send} onKeyDown={onKeyDown} fileInputRef={fileInputRef}
              figmaInputRef={figmaInputRef} handleFiles={handleFiles}
              loading={loading} textareaRef={textareaRef} />

            {/* Suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mt-5 max-w-[520px]">
              {SUGGESTIONS.map(s => (
                <button key={s.label} onClick={() => send(s.prompt)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border bg-gradient-to-r transition-all duration-150 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${s.color}`}>
                  {s.label}
                </button>
              ))}
            </div>

            <p className="mt-6 text-xs text-gray-400 flex items-center gap-1.5">
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Files are processed locally and never stored
            </p>
          </div>
        )}

        {/* ── Chat view ── */}
        {hasMessages && (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <div className="max-w-2xl mx-auto">
                {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
                {loading && (
                  <div className="flex gap-3 mb-6" style={{ animation: "fadeSlideIn 0.2s ease-out" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                      style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2L13.8 8.2L20 7L15.8 12L20 17L13.8 15.8L12 22L10.2 15.8L4 17L8.2 12L4 7L10.2 8.2L12 2Z" />
                      </svg>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="px-5 pb-5 pt-2 relative">
              <div className="max-w-2xl mx-auto">
                <ChatBox input={input} setInput={setInput} files={files} setFiles={setFiles}
                  onSend={send} onKeyDown={onKeyDown} fileInputRef={fileInputRef}
                  figmaInputRef={figmaInputRef} handleFiles={handleFiles}
                  loading={loading} textareaRef={textareaRef} compact />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wireframe → Figma hidden input */}
      <input ref={wireframeInputRef} type="file" multiple
        accept=".html,.htm,.txt,.png,.jpg,.jpeg,.gif,.webp,.svg"
        className="hidden" onChange={handleWireframeFiles} />

      {/* Figma URL modal */}
      {showFigmaModal && (
        <FigmaUrlModal onClose={() => setShowFigmaModal(false)} onSubmit={handleFigmaUrl} />
      )}

      <style>{`
        @keyframes tdot { 0%,60%,100%{transform:translateY(0);opacity:.6} 30%{transform:translateY(-5px);opacity:1} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  );
}
