// @node2flow/dashboard-core
// Shared React components, contexts, hooks, pages, and API layer

// API Layer
export {
  configureApi,
  getApiConfig,
  platformRequest,
  gatewayRequest,
  getToken,
  setToken,
  clearToken,
  isAuthenticated,
  login,
  register,
  logout,
  getProfile,
  getOAuthProviders,
  getOAuthUrl,
  handleOAuthToken,
  getConnections,
  getSudoStatus,
  verifySudoTOTP,
  submitFeedback,
} from './lib/api';

export type {
  ApiConfig,
  ApiResponse,
  User,
  Connection,
  OAuthProvider,
  SudoStatus,
} from './lib/api';

// Contexts
export { AuthProvider, useAuth } from './contexts/AuthContext';
export { SudoProvider, useSudoContext } from './contexts/SudoContext';
export { ConnectionProvider, useConnection } from './contexts/ConnectionContext';

// Components
export { default as Layout } from './components/Layout';
export type { DashboardPlugin, SidebarItem } from './components/Layout';
export { default as AdminLayout } from './components/AdminLayout';
export { default as AdminRoute } from './components/AdminRoute';
export { default as SudoModal } from './components/SudoModal';
export { default as FeedbackBubble } from './components/FeedbackBubble';

// UI Components (re-export for plugins)
export { Field, FieldLabel, FieldDescription, FieldError } from './components/ui/field';
export { InputGroup, InputGroupInput, InputGroupAddon } from './components/ui/input-group';

// Hooks
export { useSudo } from './hooks/useSudo';

// Pages
export { default as LoginPage } from './pages/Login';
export { default as RegisterPage } from './pages/Register';
