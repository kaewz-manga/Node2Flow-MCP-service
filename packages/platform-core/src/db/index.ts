/**
 * Database Operations - Barrel Export
 * Re-exports all db modules for convenient access
 */

// User operations
export {
  createUser,
  getUserByEmail,
  getUserByEmailIncludingDeleted,
  reactivateUser,
  getUserById,
  updateUserPlan,
  updateUserStripeCustomerId,
  getUserByStripeCustomerId,
  updateUserPassword,
  updateSessionDuration,
  updateUserOAuthScope,
  deleteUser,
  setUserTOTPSecret,
  enableUserTOTP,
  disableUserTOTP,
  getUserTOTPStatus,
  scheduleUserDeletion,
  cancelUserDeletion,
  getUsersScheduledForDeletion,
  hardDeleteUser,
} from './users';

// Plan operations
export { getPlan, getAllPlans } from './plans';

// API key operations
export {
  createApiKey,
  getApiKeyByHash,
  getApiKeysByUserId,
  updateApiKeyLastUsed,
  deleteApiKey,
} from './api-keys';

// Usage operations
export {
  logUsage,
  getOrCreateMonthlyUsage,
  incrementMonthlyUsage,
  getDailyUsage,
  incrementDailyUsage,
  getCurrentMinuteKey,
  getMinuteUsage,
  incrementMinuteUsage,
  incrementPlatformStat,
  getPlatformStats,
  getCurrentYearMonth,
  getCurrentDate,
  getNextMonthReset,
  getTomorrowReset,
  deleteOldUsageLogs,
  getUsageLogsForExport,
} from './usage';

// Connection operations
export {
  createConnection,
  getConnectionsByUserId,
  getConnectionById,
  updateConnectionStatus,
  deleteConnection,
  countUserConnections,
  updateConnectionLastUsed,
  getInactiveFreePlanConnections,
  createAiConnection,
  getAiConnectionsByUserId,
  getAiConnectionById,
  deleteAiConnection,
  createBotConnection,
  getBotConnectionsByUserId,
  getBotConnectionById,
  getBotConnectionByUserAndPlatform,
  updateBotConnectionWebhook,
  deleteBotConnection,
} from './connections';
export type { N8nConnection, AiConnectionRecord, BotConnectionRecord } from './connections';

// Admin operations
export {
  getAllUsers,
  updateUserStatus,
  adminUpdateUserPlan,
  logAdminAction,
  getAdminStats,
  getUsageTimeseries,
  getTopTools,
  getTopUsers,
  getRecentErrors,
  getPlanDistribution,
  getErrorTrend,
  getUsageByProduct,
  getTopToolsByProduct,
  recalculateUsageMonthly,
  recalculatePlatformStats,
  clearAllLogs,
  fullSystemReset,
  createFeedback,
  getFeedbackByUserId,
  getAllFeedback,
  updateFeedbackStatus,
  getMaintenanceMode,
  setMaintenanceMode,
  getUserDataForExport,
} from './admin';
