/**
 * Return Orders Service Index
 * Exports all service methods for easy importing
 */

export {
  // User functions
  getUsersBasicInfo,
  getOrderNumbersByUserId,
  // Return Orders
  getReturnOrders,
  getReturnOrderStats,
  getReturnRequests,
  getReturnRequestStats,
  getReturnRequestById,
  getReturnOrderById,
  updateReturnOrder,
  updateReturnRequestStatus,
  updateReturnOrderStatus,
  deleteReturnOrder,
  deleteReturnRequest,
  isCacheValid,
  saveRemainingOrdersToCache,
  getRemainingOrdersFromCache,
  // Return Order Options (Dynamic Dropdowns)
  getReturnOrderOptionsGrouped,
  getReturnOrderOptionsByType,
  createReturnOrderOption,
  updateReturnOrderOption,
  deleteReturnOrderOption,
  seedReturnOrderOptions,
  // Labels
  getAvailableLabels,
  getLabelOfReturnOrder,
  assignLabelToReturnOrder,
  default as returnOrdersService
} from './returnOrdersService';
