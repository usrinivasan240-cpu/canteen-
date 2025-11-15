const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

router.use(authenticate, authorizeRoles('admin'));

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Admin get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

router.get('/sales-summary', async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed');
    const pendingOrders = orders.filter(order => order.status === 'pending');
    const inProgressOrders = orders.filter(order => order.status === 'in-progress');

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      totalOrders,
      pendingOrders: pendingOrders.length,
      inProgressOrders: inProgressOrders.length,
      completedOrders: completedOrders.length,
      totalRevenue
    });
  } catch (error) {
    console.error('Admin sales summary error:', error);
    res.status(500).json({ message: 'Failed to fetch sales summary', error: error.message });
  }
});

module.exports = router;
