const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Message = require('../models/Message');
const Item = require('../models/Item');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', auth, [
  body('receiver')
    .isMongoId()
    .withMessage('Valid receiver ID is required'),
  body('item')
    .isMongoId()
    .withMessage('Valid item ID is required'),
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['Inquiry', 'Offer', 'Arrangement', 'General'])
    .withMessage('Invalid message type'),
  body('offer.amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Offer amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      receiver,
      item,
      content,
      messageType = 'Inquiry',
      offer,
      parentMessage
    } = req.body;

    // Check if receiver exists
    const receiverUser = await User.findById(receiver);
    if (!receiverUser) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Check if item exists
    const itemDoc = await Item.findById(item);
    if (!itemDoc) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is not messaging themselves
    if (receiver === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Create message
    const message = new Message({
      sender: req.user._id,
      receiver,
      item,
      content,
      messageType,
      offer,
      parentMessage
    });

    await message.save();

    // Populate sender and receiver details
    await message.populate('sender', 'username firstName lastName avatar');
    await message.populate('receiver', 'username firstName lastName avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      messageData: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error while sending message' });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/conversations', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get unique conversations for the user
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $last: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    // Populate user details for each conversation
    const populatedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = await User.findById(conv._id)
          .select('username firstName lastName avatar');
        
        return {
          ...conv,
          otherUser
        };
      })
    );

    // Get total conversations count
    const totalConversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          }
        }
      },
      {
        $count: 'total'
      }
    ]);

    const total = totalConversations[0]?.total || 0;

    res.json({
      conversations: populatedConversations,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + populatedConversations.length < total,
        hasPrev: parseInt(page) > 1
      },
      total
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error while fetching conversations' });
  }
});

// @route   GET /api/messages/conversation/:userId/:itemId
// @desc    Get conversation with a specific user about a specific item
// @access  Private
router.get('/conversation/:userId/:itemId', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, itemId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Get messages
    const messages = await Message.find({
      item: itemId,
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'username firstName lastName avatar')
    .populate('receiver', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Get total messages count
    const total = await Message.countDocuments({
      item: itemId,
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    });

    // Mark messages as read
    await Message.updateMany(
      {
        item: itemId,
        sender: userId,
        receiver: req.user._id,
        isRead: false
      },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      otherUser,
      item,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + messages.length < total,
        hasPrev: parseInt(page) > 1
      },
      total
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error while fetching conversation' });
  }
});

// @route   GET /api/messages/unread
// @desc    Get unread messages count
// @access  Private
router.get('/unread', auth, async (req, res) => {
  try {
    const unreadCount = await Message.getUnreadCount(req.user._id);
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error while fetching unread count' });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    await message.markAsRead();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Server error while marking message as read' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private (sender only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
});

module.exports = router; 