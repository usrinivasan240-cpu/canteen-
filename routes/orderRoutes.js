const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Counter = require('../models/Counter');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

const getNextToken = async () => {
  const counter = await Counter.findOneAndUpdate(
    { key: 'orderToken' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  return counter.value;
};

router.post('/', auth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const menuItems = await MenuItem.find({ _id: { $in: items.map((item) => item.menuItemId) }, isAvailable: true });

    if (!menuItems.length) {
      return res.status(400).json({ message: 'Selected menu items are not available' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        return res.status(400).json({ message: 'Invalid menu item' });
      }

      const menuItem = menuItems.find((menu) => menu._id.toString() === item.menuItemId);

      if (!menuItem) {
        return res.status(400).json({ message: 'One or more menu items are invalid' });
      }

      let quantity = Number(item.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        quantity = 1;
      }
      quantity = Math.round(quantity);

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity
      });

      totalAmount += menuItem.price * quantity;
    }

    const token = await getNextToken();

    const order = await Order.create({
      userId: req.user._id,
      token,
      items: orderItems,
      totalAmount,
      status: 'pending'
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

router.get('/', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
  }
});

router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'in-progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

router.get('/summary/sales', adminAuth, async (req, res) => {
  try {
    const completedOrders = await Order.find({ status: 'completed' });

    const totalSales = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = completedOrders.length;
    const averageOrderValue = totalOrders ? totalSales / totalOrders : 0;

    res.json({
      totalSales,
      totalOrders,
      averageOrderValue
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate sales summary', error: error.message });
  }
});

module.exports = router;
