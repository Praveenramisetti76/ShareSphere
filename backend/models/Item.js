const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Electronics',
      'Clothing',
      'Books',
      'Furniture',
      'Toys',
      'Sports',
      'Kitchen',
      'Tools',
      'Art',
      'Music',
      'Health',
      'Beauty',
      'Automotive',
      'Garden',
      'Other'
    ]
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  images: [{
    type: String,
    required: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Given Away', 'Sold'],
    default: 'Available'
  },
  sharingType: {
    type: String,
    enum: ['Give Away', 'Sell', 'Keep Until Needed'],
    required: true
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  },
  pickupOptions: {
    homePickup: { type: Boolean, default: true },
    publicLocation: { type: Boolean, default: true },
    shipping: { type: Boolean, default: false }
  },
  availability: {
    startDate: Date,
    endDate: Date,
    timeSlots: [{
      day: String,
      startTime: String,
      endTime: String
    }]
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  interestedUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isDonation: {
    type: Boolean,
    default: false
  },
  charityInfo: {
    organization: String,
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Items expire after 90 days if not given away
      return new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Index for search functionality
itemSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  category: 'text'
});

// Virtual for calculating days until expiration
itemSchema.virtual('daysUntilExpiration').get(function() {
  if (!this.expiresAt) return null;
  const now = new Date();
  const diffTime = this.expiresAt - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Method to increment views
itemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add interested user
itemSchema.methods.addInterestedUser = function(userId, message) {
  const existingIndex = this.interestedUsers.findIndex(
    item => item.user.toString() === userId.toString()
  );
  
  if (existingIndex >= 0) {
    this.interestedUsers[existingIndex].message = message;
    this.interestedUsers[existingIndex].date = new Date();
  } else {
    this.interestedUsers.push({ user: userId, message });
  }
  
  return this.save();
};

// Method to toggle like
itemSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
  } else {
    this.likes.push(userId);
  }
  
  return this.save();
};

module.exports = mongoose.model('Item', itemSchema); 