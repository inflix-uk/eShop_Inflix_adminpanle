/**
 * Orders Service Index
 * Exports all service methods for easy importing
 */

export {
  getOrders,
  getStats,
  updateOrderStatus,
  deleteOrder,
  getOrderById,
  getOrderByAdmin,
  getCoupons,
  updateOrder,
  bulkUpdateOrders,
  exportOrders,
  default as ordersService
} from './ordersService';
