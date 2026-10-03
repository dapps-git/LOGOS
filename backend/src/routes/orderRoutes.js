const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  updatePaymentStatusAdmin,
  cancelOrder,
  requestReturn,
  reviewReturnAdmin
} = require('../controllers/orderController');
const { protectCustomer, optionalAuth } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Admin Orders (placed before parameterized /:id to prevent route shadowing)
router.get('/admin/all', protectAdmin, getAllOrdersAdmin);
router.put('/admin/:id/status', protectAdmin, updateOrderStatusAdmin);
router.put('/admin/:id/payment', protectAdmin, updatePaymentStatusAdmin);
router.put('/admin/:id/return-review', protectAdmin, reviewReturnAdmin);

// Customer & Guest Orders
router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protectCustomer, getMyOrders);
router.get('/:id', optionalAuth, getOrderById);
router.put('/:id/cancel', optionalAuth, cancelOrder);
router.post('/:id/return', optionalAuth, requestReturn);

module.exports = router;

