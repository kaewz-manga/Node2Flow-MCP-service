import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
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

// Platform pages (lazy-loaded)
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Usage = lazy(() => import('./pages/Usage'));
const Settings = lazy(() => import('./pages/Settings'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const AccountDeleted = lazy(() => import('./pages/AccountDeleted'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Documentation = lazy(() => import('./pages/Documentation'));
const Status = lazy(() => import('./pages/Status'));

// Admin pages (lazy-loaded)
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminHealth = lazy(() => import('./pages/admin/AdminHealth'));
const AdminFeedback = lazy(() => import('./pages/admin/AdminFeedback'));
const AdminSystem = lazy(() => import('./pages/admin/AdminSystem'));

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
    <Suspense fallback={<LoadingSpinner />}>
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
                  <route.component />
                </ProtectedRoute>
              }
            />
          ))
        )}

        {/* Legacy plugin sub-page redirects → tabbed pages */}
        <Route path="/n8n/connections" element={<Navigate to="/n8n?tab=connections" replace />} />
        <Route path="/n8n/workflows" element={<Navigate to="/n8n?tab=workflows" replace />} />
        <Route path="/n8n/executions" element={<Navigate to="/n8n?tab=executions" replace />} />
        <Route path="/n8n/credentials" element={<Navigate to="/n8n?tab=credentials" replace />} />
        <Route path="/n8n/tags" element={<Navigate to="/n8n?tab=tags" replace />} />
        <Route path="/n8n/users" element={<Navigate to="/n8n?tab=users" replace />} />
        <Route path="/wordpress/connections" element={<Navigate to="/wordpress?tab=connections" replace />} />
        <Route path="/wordpress/posts" element={<Navigate to="/wordpress?tab=posts" replace />} />
        <Route path="/wordpress/pages" element={<Navigate to="/wordpress?tab=pages" replace />} />
        <Route path="/wordpress/media" element={<Navigate to="/wordpress?tab=media" replace />} />
        <Route path="/wordpress/comments" element={<Navigate to="/wordpress?tab=comments" replace />} />
        <Route path="/cl-n8n-mcp/connections" element={<Navigate to="/cl-n8n-mcp?tab=connections" replace />} />
        <Route path="/cl-n8n-mcp/nodes" element={<Navigate to="/cl-n8n-mcp?tab=nodes" replace />} />
        <Route path="/cl-n8n-mcp/templates" element={<Navigate to="/cl-n8n-mcp?tab=templates" replace />} />
        <Route path="/cl-n8n-mcp/tools" element={<Navigate to="/cl-n8n-mcp?tab=tools" replace />} />
        <Route path="/gemini-rag/connections" element={<Navigate to="/gemini-rag?tab=connections" replace />} />
        <Route path="/gemini-rag/stores" element={<Navigate to="/gemini-rag?tab=stores" replace />} />
        <Route path="/gemini-rag/documents" element={<Navigate to="/gemini-rag?tab=documents" replace />} />
        <Route path="/line/connections" element={<Navigate to="/line?tab=connections" replace />} />
        <Route path="/line/messages" element={<Navigate to="/line?tab=messages" replace />} />
        <Route path="/line/richmenus" element={<Navigate to="/line?tab=richmenus" replace />} />
        <Route path="/line/users" element={<Navigate to="/line?tab=users" replace />} />
        <Route path="/telegram/connections" element={<Navigate to="/telegram?tab=connections" replace />} />
        <Route path="/telegram/messages" element={<Navigate to="/telegram?tab=messages" replace />} />
        <Route path="/telegram/chats" element={<Navigate to="/telegram?tab=chats" replace />} />
        <Route path="/telegram/webhooks" element={<Navigate to="/telegram?tab=webhooks" replace />} />
        <Route path="/notion/connections" element={<Navigate to="/notion?tab=connections" replace />} />
        <Route path="/notion/databases" element={<Navigate to="/notion?tab=databases" replace />} />
        <Route path="/notion/pages" element={<Navigate to="/notion?tab=pages" replace />} />
        <Route path="/notion/blocks" element={<Navigate to="/notion?tab=blocks" replace />} />
        <Route path="/slack/connections" element={<Navigate to="/slack?tab=connections" replace />} />
        <Route path="/slack/messages" element={<Navigate to="/slack?tab=messages" replace />} />
        <Route path="/slack/channels" element={<Navigate to="/slack?tab=channels" replace />} />
        <Route path="/slack/files" element={<Navigate to="/slack?tab=files" replace />} />
        <Route path="/slack/users" element={<Navigate to="/slack?tab=users" replace />} />

        {/* Landing page */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
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
