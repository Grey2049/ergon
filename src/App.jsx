import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import CampaignLayout from "./components/layout/CampaignLayout";
import Dashboard from "./pages/Dashboard";
import Campaigns from "./pages/Campaigns";
import Analytics from "./pages/Analytics";
import Audience from "./pages/Audience";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import CampaignDashboardPage from "./pages/CampaignDashboardPage";
import NewCampaignPage from "./pages/NewCampaignPage";
import AiChatPage from "./pages/AiChatPage";
import ReportingPage from "./pages/ReportingPage";
import BillingPage from "./pages/BillingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Campaign dashboard pages — shared sidebar + theme */}
        <Route path="/campaign-dashboard" element={<CampaignLayout />}>
          <Route index element={<CampaignDashboardPage />} />
          <Route path="new" element={<NewCampaignPage />} />
          <Route path="reporting" element={<ReportingPage />} />
          <Route path="billing" element={<BillingPage />} />
        </Route>

        <Route path="/ai-chat" element={<AiChatPage />} />

        <Route path="/" element={<Navigate to="/ai-chat" replace />} />

        <Route path="/dashboard" element={<Layout />}>
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
