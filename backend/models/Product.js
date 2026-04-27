const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  warrantyPeriod: { type: Number, required: true },
  expiryDate: { type: Date },
  invoicePath: { type: String }, // Add this line
  status: { type: String, default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);