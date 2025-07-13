const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Item = require('../models/Item');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/items
// @desc    Create a new item
// @access  Private
router.post('/', auth, [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('category')
    .isIn(['Electronics', 'Clothing', 'Books', 'Furniture', 'Toys', 'Sports', 'Kitchen', 'Tools', 'Art', 'Music', 'Health', 'Beauty', 'Automotive', 'Garden', 'Other'])
    .withMessage('Invalid category'),
  body('condition')
    .isIn(['New', 'Like New', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition'),
  body('sharingType')
    .isIn(['Give Away', 'Sell', 'Keep Until Needed'])
    .withMessage('Invalid sharing type'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      condition,
      images,
      sharingType,
      price = 0,
      location,
      tags,
      dimensions,
      pickupOptions,
      availability,
      isDonation,
      charityInfo
    } = req.body;

    const item = new Item({
      title,
      description,
      category,
      condition,
      images,
      owner: req.user._id,
      sharingType,
      price,
      location: location || req.user.location,
      tags,
      dimensions,
      pickupOptions,
      availability,
      isDonation,
      charityInfo
    });

    await item.save();

    // Populate owner details
    await item.populate('owner', 'username firstName lastName avatar rating');

    res.status(201).json({
      message: 'Item created successfully',
      item
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error during item creation' });
  }
});

// @route   GET /api/items
// @desc    Get all items with filters
// @access  Public
router.get('/', optionalAuth, [
  query('category').optional().isString(),
  query('condition').optional().isString(),
  query('sharingType').optional().isString(),
  query('search').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('location').optional().isString(),
  query('sort').optional().isIn(['newest', 'oldest', 'price-low', 'price-high', 'popular']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      category,
      condition,
      sharingType,
      search,
      minPrice,
      maxPrice,
      location,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = { status: 'Available' };
    
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    if (sharingType) filter.sharingType = sharingType;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = parseFloat(maxPrice);
    }
    if (location) {
      filter['location.city'] = { $regex: location, $options: 'i' };
    }

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $text: { $search: search }
      };
    }

    // Combine filters
    const finalFilter = { ...filter, ...searchQuery };

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'price-low':
        sortObj = { price: 1 };
        break;
      case 'price-high':
        sortObj = { price: -1 };
        break;
      case 'popular':
        sortObj = { views: -1 };
        break;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const items = await Item.find(finalFilter)
      .populate('owner', 'username firstName lastName avatar rating')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Item.countDocuments(finalFilter);

    // Increment views for authenticated users
    if (req.user) {
      items.forEach(item => {
        item.incrementViews();
      });
    }

    res.json({
      items,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + items.length < total,
        hasPrev: parseInt(page) > 1
      },
      total
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error while fetching items' });
  }
});

// @route   GET /api/items/:id
// @desc    Get item by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'username firstName lastName avatar rating bio location')
      .populate('interestedUsers.user', 'username firstName lastName avatar');

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Increment views for authenticated users
    if (req.user) {
      await item.incrementViews();
    }

    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error while fetching item' });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private (owner only)
router.put('/:id', auth, [
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('status')
    .optional()
    .isIn(['Available', 'Reserved', 'Given Away', 'Sold'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    // Update fields
    const updateFields = req.body;
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        item[key] = updateFields[key];
      }
    });

    await item.save();
    await item.populate('owner', 'username firstName lastName avatar rating');

    res.json({
      message: 'Item updated successfully',
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error during item update' });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check ownership
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error during item deletion' });
  }
});

// @route   POST /api/items/:id/like
// @desc    Toggle like on item
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.toggleLike(req.user._id);

    res.json({
      message: 'Like toggled successfully',
      likes: item.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error while toggling like' });
  }
});

// @route   POST /api/items/:id/interest
// @desc    Express interest in item
// @access  Private
router.post('/:id/interest', auth, [
  body('message')
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is not the owner
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot express interest in your own item' });
    }

    await item.addInterestedUser(req.user._id, req.body.message);

    res.json({
      message: 'Interest expressed successfully'
    });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ message: 'Server error while expressing interest' });
  }
});

// @route   GET /api/items/user/:userId
// @desc    Get items by user
// @access  Public
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await Item.find({ owner: req.params.userId })
      .populate('owner', 'username firstName lastName avatar rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments({ owner: req.params.userId });

    res.json({
      items,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + items.length < total,
        hasPrev: parseInt(page) > 1
      },
      total
    });
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ message: 'Server error while fetching user items' });
  }
});

module.exports = router; 