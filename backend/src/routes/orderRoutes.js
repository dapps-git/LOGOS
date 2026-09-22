const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  updatePaymentStatusAdmin,
  cancelOrder
} = require('../controllers/orderController');
const { protectCustomer } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Admin Orders (placed before parameterized /:id to prevent route shadowing)
router.get('/admin/all', protectAdmin, getAllOrdersAdmin);
router.put('/admin/:id/status', protectAdmin, updateOrderStatusAdmin);
router.put('/admin/:id/payment', protectAdmin, updatePaymentStatusAdmin);

// Customer Orders
router.post('/', protectCustomer, createOrder);
router.get('/my-orders', protectCustomer, getMyOrders);
router.get('/:id', protectCustomer, getOrderById);
router.put('/:id/cancel', protectCustomer, cancelOrder);

module.exports = router;
