import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const THEMES = [
  { value: "light",     label: "Light" },
  { value: "dark",      label: "Dark" },
  { value: "cupcake",   label: "Cupcake" },
  { value: "bumblebee", label: "Bumblebee" },
  { value: "emerald",   label: "Emerald" },
  { value: "corporate", label: "Corporate" },
  { value: "synthwave", label: "Synthwave" },
  { value: "retro",     label: "Retro" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "dracula",   label: "Dracula" },
  { value: "night",     label: "Night" },
  { value: "coffee",    label: "Coffee" },
  { value: "lofi",      label: "Lo-Fi" },
  { value: "winter",    label: "Winter" },
];

const NAV_MAIN = [
  {
    label: "Dashboard",
    to: "/campaign-dashboard",
    end: true,
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    label: "Campaigns",
    to: "/campaign-dashboard/campaigns",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    label: "New Campaign",
    to: "/campaign-dashboard/new",
    icon: "M12 4v16m8-8H4",
  },
  {
    label: "Reporting",
    to: "/campaign-dashboard/reporting",
    icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

const NAV_MORE = [
  {
    label: "Billing",
    to: "/campaign-dashboard/billing",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    label: "Settings",
    to: "/campaign-dashboard/settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

function SidebarNavItem({ to, end, icon, label }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `w-full flex items-center gap-3 text-left text-sm px-3 py-2.5 rounded-lg transition-colors ${
          isActive
            ? "bg-primary text-primary-content font-medium"
            : "text-neutral-content/60 hover:text-neutral-content hover:bg-neutral-content/5"
        }`
      }
    >
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
      </svg>
      {label}
    </NavLink>
  );
}

export default function CampaignLayout() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("appads-theme") || "light");
  const [themeOpen, setThemeOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const themeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("appads-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handler = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex h-screen font-sans" data-theme={theme} style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-56 bg-neutral text-neutral-content z-30
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 14H11L10 22L19.5 10H13L13 2Z" fill="white" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">AppAds</p>
            <p className="text-neutral-content/50 text-[10px] leading-tight">Mobile Ads Platform</p>
          </div>
        </div>
        <hr className="border-neutral-content/20 mx-4" />

        {/* Nav */}
        <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-semibold text-neutral-content/40 uppercase tracking-wider px-3 mb-2">Main</p>
          {NAV_MAIN.map((item) => (
            <SidebarNavItem key={item.to} {...item} />
          ))}

          <p className="text-[10px] font-semibold text-neutral-content/40 uppercase tracking-wider px-3 mt-5 mb-2">More</p>
          {NAV_MORE.map((item) => (
            <SidebarNavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-5 flex items-center gap-3 border-t border-neutral-content/20">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-content text-sm font-semibold">NA</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">Newton (Affle)</p>
            <p className="text-neutral-content/50 text-xs">Pro Plan</p>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col bg-base-200 min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 sm:px-8 pt-5 pb-2">
          {/* Hamburger — mobile */}
          <button className="btn btn-ghost btn-square btn-sm lg:hidden" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1" />

          {/* Date range */}
          <button className="btn btn-outline btn-sm gap-2 hidden sm:flex">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Apr 2026
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Theme dropdown */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="btn btn-ghost btn-square btn-sm"
              title="Switch theme"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>
            {themeOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-base-100 border border-base-300 rounded-xl shadow-xl z-50 p-2 max-h-80 overflow-y-auto">
                <p className="text-[10px] font-semibold text-base-content/50 uppercase tracking-wider px-2 pb-1">Theme</p>
                {THEMES.map((t) => (
                  <button
                    key={t.value}
                    data-theme={t.value}
                    onClick={() => { setTheme(t.value); setThemeOpen(false); }}
                    className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm transition-colors hover:bg-base-200 ${
                      theme === t.value ? "font-semibold" : ""
                    }`}
                  >
                    <div className="flex gap-1 shrink-0">
                      <span className="w-3 h-3 rounded-full bg-primary block" />
                      <span className="w-3 h-3 rounded-full bg-secondary block" />
                      <span className="w-3 h-3 rounded-full bg-accent block" />
                    </div>
                    <span className="text-base-content">{t.label}</span>
                    {theme === t.value && (
                      <svg className="w-3.5 h-3.5 ml-auto text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="indicator">
            <span className="indicator-item badge badge-primary badge-xs"></span>
            <button className="btn btn-ghost btn-square btn-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>

          {/* New Campaign */}
          <button onClick={() => navigate("/campaign-dashboard/new")} className="btn btn-primary btn-sm gap-2 hidden sm:flex">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            + New Campaign
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 px-6 sm:px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
