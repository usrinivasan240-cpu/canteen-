const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

let tokenCounter = 0;

async function getNextToken() {
  const latestOrder = await Order.findOne().sort({ token: -1 }).limit(1);
  tokenCounter = latestOrder ? latestOrder.token + 1 : 1;
  return tokenCounter;
}

router.post('/', authenticate, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is not available` });
      }

      const orderItem = {
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      };

      orderItems.push(orderItem);
      totalAmount += menuItem.price * item.quantity;
    }

    const token = await getNextToken();

    const order = await Order.create({
      userId: req.user._id,
      userName: req.user.name,
      token,
      items: orderItems,
      totalAmount,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Order placed successfully',
      order: order,
      token: order.token
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Failed to place order', error: error.message });
  }
});

router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

module.exports = router;
