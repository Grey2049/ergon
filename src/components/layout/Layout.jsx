import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("appads-theme") || "light");

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("appads-theme", newTheme);
  };

  return (
    <div className="flex h-screen bg-base-200 overflow-hidden" data-theme={theme}>
      <div className="shrink-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} currentTheme={theme} onThemeChange={handleThemeChange} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
