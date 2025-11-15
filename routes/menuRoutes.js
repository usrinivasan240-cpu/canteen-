const express = require('express');
const MenuItem = require('../models/MenuItem');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu items', error: error.message });
  }
});

router.get('/all', adminAuth, async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu items', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch menu item', error: error.message });
  }
});

router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, price, category, description, isAvailable } = req.body;
    
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    
    const item = await MenuItem.create({ name, price, category, description, isAvailable });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create menu item', error: error.message });
  }
});

router.put('/:id', adminAuth, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update menu item', error: error.message });
  }
});

router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete menu item', error: error.message });
  }
});

module.exports = router;
