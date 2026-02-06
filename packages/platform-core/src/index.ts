// @node2flow/platform-core
// Shared auth, billing, crypto, and database utilities

// Types
export type {
  User,
  ApiKey,
  UsageLog,
  UsageMonthly,
  Plan,
  AiConnection,
  BotConnection,
  Feedback,
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  UsageResponse,
  AuthContext,
  ApiResponse,
  RateLimitInfo,
  PlatformEnv,
  ExportData,
  MaintenanceState,
} from './types/platform';

// Crypto utilities
export {
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  generateApiKey,
  hashApiKey,
  encrypt,
  decrypt,
  generateUUID,
  generateTOTPSecret,
  verifyTOTP,
  generateTOTPUri,
} from './crypto-utils';

// Database operations
export * from './db';

// Auth
export {
  handleRegister,
  handleLogin,
  authenticateMcpRequest,
  handleCreateConnection,
  verifyAuthToken,
  verifyAdminToken,
  verifySudoTOTP,
  hasSudoSession,
  revokeSudoSession,
  setupTOTP,
  verifyTOTPSetup,
  disableTOTP,
  getTOTPStatus,
} from './auth';

// OAuth
export {
  getOAuthAuthorizeUrl,
  handleOAuthCallback,
  generateOAuthState,
  validateOAuthState,
} from './oauth';

// Stripe
export {
  createCheckoutSession,
  createBillingPortalSession,
  handleStripeWebhook,
} from './stripe';

// Email
export {
  sendEmail,
  welcomeEmail,
  deletionScheduledEmail,
  accountRecoveredEmail,
  usageLimitWarningEmail,
  connectionDeletedEmail,
} from './email';
