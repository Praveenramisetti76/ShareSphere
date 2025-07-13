const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  messageType: {
    type: String,
    enum: ['Inquiry', 'Offer', 'Arrangement', 'General'],
    default: 'Inquiry'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  attachments: [{
    type: String,
    description: String
  }],
  offer: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    validUntil: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Declined', 'Expired'],
    default: 'Pending'
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }]
}, {
  timestamps: true
});

// Index for efficient querying
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ item: 1, createdAt: -1 });

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Method to get conversation thread
messageSchema.statics.getConversation = function(user1Id, user2Id, itemId) {
  return this.find({
    item: itemId,
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id }
    ]
  })
  .populate('sender', 'username firstName lastName avatar')
  .populate('receiver', 'username firstName lastName avatar')
  .sort({ createdAt: 1 });
};

// Method to get unread count
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    receiver: userId,
    isRead: false
  });
};

module.exports = mongoose.model('Message', messageSchema); 