import { Routes, Route } from "react-router-dom";

// Public
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";

// Auth
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyPage from "./pages/VerifyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import KycPage from "./pages/KycPage";

// App (logged-in)
import AppHome from "./pages/app/AppHome";
import FounderDashboard from "./pages/app/FounderDashboard";
import UploadPitchPage from "./pages/app/UploadPitchPage";
import MyPitchesPage from "./pages/app/MyPitchesPage";
import AnalyticsPage from "./pages/app/AnalyticsPage";
import DealsPage from "./pages/app/DealsPage";
import DeckRequestsPage from "./pages/app/DeckRequestsPage";
import InvestorFeed from "./pages/app/InvestorFeed";
import DiscoverPage from "./pages/app/DiscoverPage";
import SavedPitchesPage from "./pages/app/SavedPitchesPage";
import InvestmentsPage from "./pages/app/InvestmentsPage";
import MessagesPage from "./pages/app/MessagesPage";
import CallScreen from "./pages/app/CallScreen";
import NotificationsPage from "./pages/app/NotificationsPage";
import ProfilePage from "./pages/app/ProfilePage";
import SettingsPage from "./pages/app/SettingsPage";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPitchesPage from "./pages/admin/AdminPitchesPage";
import AdminKycPage from "./pages/admin/AdminKycPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminAuditPage from "./pages/admin/AdminAuditPage";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/courses" element={<CoursesPage />} />

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/kyc" element={<KycPage />} />

      {/* App — role-aware home */}
      <Route path="/app" element={<AppHome />} />

      {/* Founder */}
      <Route path="/app/dashboard" element={<FounderDashboard />} />
      <Route path="/app/upload" element={<UploadPitchPage />} />
      <Route path="/app/my-pitches" element={<MyPitchesPage />} />
      <Route path="/app/analytics" element={<AnalyticsPage />} />
      <Route path="/app/deals" element={<DealsPage />} />
      <Route path="/app/deck-requests" element={<DeckRequestsPage />} />

      {/* Investor */}
      <Route path="/app/feed" element={<InvestorFeed />} />
      <Route path="/app/discover" element={<DiscoverPage />} />
      <Route path="/app/saved" element={<SavedPitchesPage />} />
      <Route path="/app/investments" element={<InvestmentsPage />} />

      {/* Shared */}
      <Route path="/app/messages" element={<MessagesPage />} />
      <Route path="/app/messages/:chatId" element={<MessagesPage />} />
      <Route path="/app/call/:kind/:chatId" element={<CallScreen />} />
      <Route path="/app/notifications" element={<NotificationsPage />} />
      <Route path="/app/profile" element={<ProfilePage />} />
      <Route path="/app/settings" element={<SettingsPage />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/pitches" element={<AdminPitchesPage />} />
      <Route path="/admin/kyc" element={<AdminKycPage />} />
      <Route path="/admin/reports" element={<AdminReportsPage />} />
      <Route path="/admin/audit" element={<AdminAuditPage />} />
    </Routes>
  );
}

export default App;
