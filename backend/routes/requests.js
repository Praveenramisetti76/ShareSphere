const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Item = require('../models/Item');
const { auth } = require('../middleware/auth');

// Create a new request
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, message } = req.body;
    
    // Get the item to find the owner
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    // Check if user is requesting their own item
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot request your own item' });
    }
    
    // Check if request already exists
    const existingRequest = await Request.findOne({
      requester: req.user._id,
      item: itemId,
      status: { $in: ['pending', 'approved'] }
    });
    
    if (existingRequest) {
      return res.status(400).json({ error: 'Request already exists for this item' });
    }
    
    const request = new Request({
      requester: req.user._id,
      item: itemId,
      owner: item.owner,
      message: message || ''
    });
    
    await request.save();
    
    // Populate user and item details
    await request.populate('requester', 'username firstName lastName');
    await request.populate('item', 'title images');
    
    res.status(201).json(request);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

// Get requests for an owner (requests they received)
router.get('/owner', auth, async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user._id })
      .populate('requester', 'username firstName lastName email phone')
      .populate('item', 'title images price')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error('Get owner requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Get requests for a user (requests they made)
router.get('/user', auth, async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id })
      .populate('owner', 'username firstName lastName')
      .populate('item', 'title images price')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error('Get user requests error:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// Update request status (approve/reject)
router.put('/:requestId/status', auth, async (req, res) => {
  try {
    const { status, responseMessage } = req.body;
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    // Check if user is the owner of the item
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }
    
    request.status = status;
    request.responseMessage = responseMessage || '';
    request.respondedAt = new Date();
    
    await request.save();
    
    // Populate details for response
    await request.populate('requester', 'username firstName lastName');
    await request.populate('item', 'title images');
    
    res.json(request);
  } catch (err) {
    console.error('Update request status error:', err);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

module.exports = router; 