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
  encryptData,
  decryptData,
  generateUUID,
  generateTOTPSecret,
  verifyTOTP,
  generateTOTPUri,
} from './crypto-utils';

// Database operations
export * from './db';

// Auth (re-exported from auth.ts)
// Note: auth.ts imports from ./saas-types and ./db - needs import path fix in Phase 3
// export { handleRegister, handleLogin, ... } from './auth';

// OAuth
// export { handleGitHubCallback, handleGoogleCallback, ... } from './oauth';

// Stripe
// export { handleCreateCheckout, handleStripeWebhook, ... } from './stripe';

// Email
// export { sendEmail, ... } from './email';
