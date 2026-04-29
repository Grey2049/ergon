import { useState } from "react";

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

export default function Navbar({ onMenuClick, currentTheme, onThemeChange }) {
  const [search, setSearch] = useState("");

  return (
    <header className="h-16 bg-base-100 border-b border-base-200 flex items-center px-4 gap-4 sticky top-0 z-10">
      {/* Hamburger - mobile only */}
      <button
        className="btn btn-ghost btn-square lg:hidden"
        onClick={onMenuClick}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered input-sm w-full pl-9 bg-base-200 border-transparent focus:border-primary focus:bg-base-100"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Date range */}
        <button className="btn btn-ghost btn-sm gap-2 hidden sm:flex">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">Apr 2026</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Theme switcher */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-square btn-sm" title="Switch theme">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </label>
          <div tabIndex={0} className="dropdown-content z-50 shadow-lg bg-base-100 border border-base-200 rounded-box w-48 mt-2 p-2 max-h-80 overflow-y-auto">
            <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider px-2 pb-1">Theme</p>
            {THEMES.map((t) => (
              <button
                key={t.value}
                data-theme={t.value}
                onClick={() => onThemeChange(t.value)}
                className={`flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm transition-colors hover:bg-base-200 ${currentTheme === t.value ? "font-semibold" : ""}`}
              >
                <div className="flex gap-1 shrink-0">
                  <span className="w-3 h-3 rounded-full bg-primary block" />
                  <span className="w-3 h-3 rounded-full bg-secondary block" />
                  <span className="w-3 h-3 rounded-full bg-accent block" />
                </div>
                <span className="text-base-content">{t.label}</span>
                {currentTheme === t.value && (
                  <svg className="w-3.5 h-3.5 ml-auto text-primary shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
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

        {/* Create campaign */}
        <button className="btn btn-primary btn-sm gap-2 hidden sm:flex">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Campaign
        </button>

        {/* Avatar */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="avatar placeholder cursor-pointer">
            <div className="w-8 rounded-full bg-primary text-primary-content">
              <span className="text-sm font-semibold">UP</span>
            </div>
          </label>
          <ul tabIndex={0} className="dropdown-content menu menu-sm shadow bg-base-100 rounded-box w-44 mt-2 border border-base-200">
            <li><a>Profile</a></li>
            <li><a>Account</a></li>
            <li><a>Billing</a></li>
            <li><hr className="my-1 border-base-200" /></li>
            <li><a className="text-error">Logout</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
}
