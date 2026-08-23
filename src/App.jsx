import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/guards/ProtectedRoute";
import GuestRoute from "./components/guards/GuestRoute";
import AdminRoute from "./components/guards/AdminRoute";
import ImpersonationBanner from "./components/ImpersonationBanner";
import PageLoader from "./components/ui/PageLoader";

// Public (no auth needed)
const HomePage = lazy(() => import("./pages/HomePage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));

// Auth (guest only — redirects to /app if already logged in)
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const VerifyPage = lazy(() => import("./pages/VerifyPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const KycPage = lazy(() => import("./pages/KycPage"));

// App (protected — requires login)
const AppHome = lazy(() => import("./pages/app/AppHome"));
const FounderDashboard = lazy(() => import("./pages/app/FounderDashboard"));
const UploadPitchPage = lazy(() => import("./pages/app/UploadPitchPage"));
const UploadPostPage = lazy(() => import("./pages/app/UploadPostPage"));
const MyStudioPage = lazy(() => import("./pages/app/MyStudioPage"));
const PostDetailPage = lazy(() => import("./pages/app/PostDetailPage"));
const SubscriptionPage = lazy(() => import("./pages/app/SubscriptionPage"));
const AnalyticsPage = lazy(() => import("./pages/app/AnalyticsPage"));
const DealsPage = lazy(() => import("./pages/app/DealsPage"));
const DeckRequestsPage = lazy(() => import("./pages/app/DeckRequestsPage"));
const AppCoursesPage = lazy(() => import("./pages/app/AppCoursesPage"));
const InvestorFeed = lazy(() => import("./pages/app/InvestorFeed"));
const DiscoverPage = lazy(() => import("./pages/app/DiscoverPage"));
const SavedPitchesPage = lazy(() => import("./pages/app/SavedPitchesPage"));
const InvestmentsPage = lazy(() => import("./pages/app/InvestmentsPage"));
const MessagesPage = lazy(() => import("./pages/app/MessagesPage"));
const NotificationsPage = lazy(() => import("./pages/app/NotificationsPage"));
const ProfilePage = lazy(() => import("./pages/app/ProfilePage"));
const PublicProfilePage = lazy(() => import("./pages/app/PublicProfilePage"));
const SettingsPage = lazy(() => import("./pages/app/SettingsPage"));

// Admin (protected — admin role only)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminPitchesPage = lazy(() => import("./pages/admin/AdminPitchesPage"));
const AdminKycPage = lazy(() => import("./pages/admin/AdminKycPage"));
const AdminReportsPage = lazy(() => import("./pages/admin/AdminReportsPage"));
const AdminAuditPage = lazy(() => import("./pages/admin/AdminAuditPage"));
const AdminModerationPage = lazy(
  () => import("./pages/admin/AdminModerationPage"),
);
const AdminInvestmentsPage = lazy(
  () => import("./pages/admin/AdminInvestmentsPage"),
);
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminTrashPage = lazy(() => import("./pages/admin/AdminTrashPage"));
const AdminBroadcastPage = lazy(
  () => import("./pages/admin/AdminBroadcastPage"),
);

function App() {
  return (
    <>
      <ImpersonationBanner />
      <Suspense fallback={<PageLoader />}>
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
              <ProtectedRoute allowSignupSession>
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
              <ProtectedRoute roles={["founder", "investor"]}>
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
            path="/app/courses"
            element={
              <ProtectedRoute roles={["founder", "admin"]}>
                <AppCoursesPage />
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
            path="/app/u/:userId"
            element={
              <ProtectedRoute>
                <PublicProfilePage />
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

          {/* ─── ADMIN ─── */}
          {/* Dedicated admin login (public) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pitches"
            element={
              <AdminRoute>
                <AdminPitchesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminRoute>
                <AppCoursesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/kyc"
            element={
              <AdminRoute>
                <AdminKycPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <AdminReportsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/moderation"
            element={
              <AdminRoute>
                <AdminModerationPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/investments"
            element={
              <AdminRoute>
                <AdminInvestmentsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AdminRoute>
                <AdminSettingsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <AdminRoute>
                <AdminAuditPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/trash"
            element={
              <AdminRoute>
                <AdminTrashPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/broadcast"
            element={
              <AdminRoute>
                <AdminBroadcastPage />
              </AdminRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
