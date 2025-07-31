const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Item = require('../models/Item');

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { buyer, items } = req.body;
    // Optionally, validate items and buyer info here
    const order = new Order({ buyer, items });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get orders for an owner
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const ownerId = req.params.ownerId;
    // Find orders where any item.owner matches ownerId
    const orders = await Order.find({ 'items.owner': ownerId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;