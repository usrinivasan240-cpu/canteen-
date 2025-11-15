const express = require('express');
const MenuItem = require('../models/MenuItem');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const menuItems = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.json({ menu: menuItems });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ message: 'Failed to fetch menu items', error: error.message });
  }
});

router.post('/', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, price, category, description, isAvailable } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const menuItem = await MenuItem.create({
      name,
      price,
      category,
      description,
      isAvailable
    });

    res.status(201).json({ message: 'Menu item created', item: menuItem });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ message: 'Failed to create menu item', error: error.message });
  }
});

router.put('/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const item = await MenuItem.findByIdAndUpdate(id, updates, { new: true });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item updated', item });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Failed to update menu item', error: error.message });
  }
});

router.delete('/:id', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MenuItem.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Failed to delete menu item', error: error.message });
  }
});

module.exports = router;
