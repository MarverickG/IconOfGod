const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  sizeOptions: [String], // e.g., ["S", "M", "L", "XL"]
  imageUrl: String,
  inStock: { type: Boolean, default: true },
  dropNumber: Number, // e.g., 1 for Drop01
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
