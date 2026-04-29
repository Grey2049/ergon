import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Analytics from "./pages/Analytics";
import Audience from "./pages/Audience";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CampaignDashboardPage from "./pages/CampaignDashboardPage";
import AiChatPage from "./pages/AiChatPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/campaign-dashboard" element={<CampaignDashboardPage />} />
        <Route path="/ai-chat" element={<AiChatPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="audience" element={<Audience />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
