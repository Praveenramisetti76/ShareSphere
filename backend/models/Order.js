const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    notes: { type: String },
  },
  items: [
    {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
      name: String,
      price: Number,
      quantity: Number,
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    }
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', OrderSchema);