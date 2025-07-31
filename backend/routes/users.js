const express = require('express');
const { body, validationResult, query } = require('express-validator');
const User = require('../models/User');
const Item = require('../models/Item');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (for chat selection)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('username firstName lastName avatar email')
      .sort({ firstName: 1, lastName: 1 });
    
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's items count
    const itemsCount = await Item.countDocuments({ owner: req.params.id });
    const availableItemsCount = await Item.countDocuments({ 
      owner: req.params.id, 
      status: 'Available' 
    });

    const userProfile = {
      ...user.toObject(),
      itemsCount,
      availableItemsCount
    };

    res.json({ user: userProfile });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
});

// @route   GET /api/users/:id/items
// @desc    Get items by user ID
// @access  Public
router.get('/:id/items', optionalAuth, [
  query('status').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { owner: req.params.id };
    if (status) filter.status = status;

    const items = await Item.find(filter)
      .populate('owner', 'username firstName lastName avatar rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Item.countDocuments(filter);

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

// @route   GET /api/users/:id/stats
// @desc    Get user statistics
// @access  Public
router.get('/:id/stats', optionalAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Get various statistics
    const totalItems = await Item.countDocuments({ owner: userId });
    const availableItems = await Item.countDocuments({ 
      owner: userId, 
      status: 'Available' 
    });
    const givenAwayItems = await Item.countDocuments({ 
      owner: userId, 
      status: 'Given Away' 
    });
    const soldItems = await Item.countDocuments({ 
      owner: userId, 
      status: 'Sold' 
    });

    // Get total views on user's items
    const totalViews = await Item.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    // Get total likes on user's items
    const totalLikes = await Item.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } } } }
    ]);

    // Get category distribution
    const categoryStats = await Item.aggregate([
      { $match: { owner: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const stats = {
      totalItems,
      availableItems,
      givenAwayItems,
      soldItems,
      totalViews: totalViews[0]?.totalViews || 0,
      totalLikes: totalLikes[0]?.totalLikes || 0,
      categoryStats
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error while fetching user statistics' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, [
  body('notifications.email').optional().isBoolean(),
  body('notifications.push').optional().isBoolean(),
  body('privacy.showLocation').optional().isBoolean(),
  body('privacy.showPhone').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { notifications, privacy } = req.body;
    const updateFields = {};

    if (notifications) {
      updateFields['preferences.notifications'] = {
        ...req.user.preferences.notifications,
        ...notifications
      };
    }

    if (privacy) {
      updateFields['preferences.privacy'] = {
        ...req.user.preferences.privacy,
        ...privacy
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      user
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error during preferences update' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', optionalAuth, [
  query('q').optional().isString(),
  query('location').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q, location, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const filter = {};
    
    if (q) {
      filter.$or = [
        { username: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } }
      ];
    }

    if (location) {
      filter['location.city'] = { $regex: location, $options: 'i' };
    }

    const users = await User.find(filter)
      .select('username firstName lastName avatar rating location itemsGiven itemsReceived')
      .sort({ rating: -1, itemsGiven: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      },
      total
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error while searching users' });
  }
});

// @route   POST /api/users/:id/rate
// @desc    Rate a user
// @access  Private
router.post('/:id/rate', auth, [
  body('rating')
    .isFloat({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const targetUserId = req.params.id;

    // Check if user is rating themselves
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot rate yourself' });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user rating (simplified - in a real app you'd have a separate ratings collection)
    const newAverage = (targetUser.rating.average * targetUser.rating.count + rating) / (targetUser.rating.count + 1);
    
    targetUser.rating.average = newAverage;
    targetUser.rating.count += 1;
    
    await targetUser.save();

    res.json({
      message: 'Rating submitted successfully',
      newRating: targetUser.rating
    });
  } catch (error) {
    console.error('Rate user error:', error);
    res.status(500).json({ message: 'Server error while submitting rating' });
  }
});

module.exports = router; 