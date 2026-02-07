import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import {
  AuthProvider,
  useAuth,
  SudoProvider,
  ConnectionProvider,
  Layout,
  AdminRoute,
  LoginPage,
  RegisterPage,
} from '@node2flow/dashboard-core';
import { plugins } from './plugins/registry';
import { Loader2 } from 'lucide-react';

// Platform pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Usage from './pages/Usage';
import Settings from './pages/Settings';
import AuthCallback from './pages/AuthCallback';
import AccountDeleted from './pages/AccountDeleted';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import FAQ from './pages/FAQ';
import Documentation from './pages/Documentation';
import Status from './pages/Status';

// Admin pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminHealth from './pages/admin/AdminHealth';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminSystem from './pages/admin/AdminSystem';

const queryClient = new QueryClient();

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-n2f-accent" />
    </div>
  );
}

// Protected Route wrapper - requires login
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <Layout plugins={plugins}>{children}</Layout>;
}

// Public Route wrapper - redirect to dashboard if logged in
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

// Smart Route wrapper - shows Layout if logged in, standalone if not
function SmartRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (user) {
    return <Layout plugins={plugins}>{children}</Layout>;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/account-deleted" element={<AccountDeleted />} />

      {/* Info pages - with Layout if logged in, standalone if not */}
      <Route path="/terms" element={<SmartRoute><Terms /></SmartRoute>} />
      <Route path="/privacy" element={<SmartRoute><Privacy /></SmartRoute>} />
      <Route path="/faq" element={<SmartRoute><FAQ /></SmartRoute>} />
      <Route path="/docs" element={<SmartRoute><Documentation /></SmartRoute>} />
      <Route path="/status" element={<SmartRoute><Status /></SmartRoute>} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/usage" element={<ProtectedRoute><Usage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/analytics" element={<AdminRoute><AdminAnalytics /></AdminRoute>} />
      <Route path="/admin/revenue" element={<AdminRoute><AdminRevenue /></AdminRoute>} />
      <Route path="/admin/health" element={<AdminRoute><AdminHealth /></AdminRoute>} />
      <Route path="/admin/feedback" element={<AdminRoute><AdminFeedback /></AdminRoute>} />
      <Route path="/admin/system" element={<AdminRoute><AdminSystem /></AdminRoute>} />

      {/* Dynamic plugin routes (lazy-loaded) */}
      {plugins.flatMap(plugin =>
        plugin.routes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <route.component />
                </Suspense>
              </ProtectedRoute>
            }
          />
        ))
      )}

      {/* Landing page */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SudoProvider>
            <ConnectionProvider>
              <AppRoutes />
            </ConnectionProvider>
          </SudoProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
