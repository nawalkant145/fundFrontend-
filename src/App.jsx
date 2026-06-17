import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import GuestRoute from "./components/guards/GuestRoute";

// Public (no auth needed)
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";

// Auth (guest only — redirects to /app if already logged in)
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyPage from "./pages/VerifyPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import KycPage from "./pages/KycPage";

// App (protected — requires login)
import AppHome from "./pages/app/AppHome";
import FounderDashboard from "./pages/app/FounderDashboard";
import UploadPitchPage from "./pages/app/UploadPitchPage";
import UploadPostPage from "./pages/app/UploadPostPage";
import MyPitchesPage from "./pages/app/MyPitchesPage";
import MyStudioPage from "./pages/app/MyStudioPage";
import PostDetailPage from "./pages/app/PostDetailPage";
import SubscriptionPage from "./pages/app/SubscriptionPage";
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

// Admin (protected — admin role only)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPitchesPage from "./pages/admin/AdminPitchesPage";
import AdminKycPage from "./pages/admin/AdminKycPage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminAuditPage from "./pages/admin/AdminAuditPage";

function App() {
  return (
    <Routes>
      {/* ─── PUBLIC ─────────────────────────────── */}
      <Route path="/" element={<HomePage />} />
      <Route path="/courses" element={<CoursesPage />} />

      {/* ─── GUEST ONLY (redirect to /app if logged in) ─── */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        }
      />
      <Route path="/verify" element={<VerifyPage />} />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPasswordPage />
          </GuestRoute>
        }
      />
      <Route
        path="/kyc"
        element={
          <ProtectedRoute>
            <KycPage />
          </ProtectedRoute>
        }
      />

      {/* ─── APP (protected — any logged-in user) ─── */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/dashboard"
        element={
          <ProtectedRoute roles={["founder"]}>
            <FounderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/upload"
        element={
          <ProtectedRoute roles={["founder"]}>
            <UploadPitchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/post/new"
        element={
          <ProtectedRoute roles={["founder"]}>
            <UploadPostPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/post/:postId"
        element={
          <ProtectedRoute>
            <PostDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/studio"
        element={
          <ProtectedRoute roles={["founder"]}>
            <MyStudioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/my-pitches"
        element={
          <ProtectedRoute roles={["founder"]}>
            <MyStudioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/analytics"
        element={
          <ProtectedRoute roles={["founder"]}>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/deals"
        element={
          <ProtectedRoute roles={["founder"]}>
            <DealsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/deck-requests"
        element={
          <ProtectedRoute roles={["founder"]}>
            <DeckRequestsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/feed"
        element={
          <ProtectedRoute>
            <InvestorFeed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/pitch"
        element={
          <ProtectedRoute>
            <InvestorFeed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/discover"
        element={
          <ProtectedRoute>
            <DiscoverPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/saved"
        element={
          <ProtectedRoute>
            <SavedPitchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/investments"
        element={
          <ProtectedRoute roles={["investor"]}>
            <InvestmentsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app/subscription"
        element={
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/messages"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/messages/:chatId"
        element={
          <ProtectedRoute>
            <MessagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/call/:kind/:chatId"
        element={
          <ProtectedRoute>
            <CallScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* ─── ADMIN (protected — admin role only) ─── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pitches"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminPitchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kyc"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminKycPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminAuditPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
