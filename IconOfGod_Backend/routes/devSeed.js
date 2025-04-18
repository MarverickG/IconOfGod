const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/seed-drop01', async (req, res) => {
  try {
    const product = new Product({
      name: 'Drop01 Jersey - Divine Black',
      description: 'The first scroll. Revelation wrapped in fabric.',
      price: 88,
      sizeOptions: ['S', 'M', 'L', 'XL'],
      imageUrl: 'https://your-image-link.com/drop01.jpg',
      inStock: true,
      dropNumber: 1
    });

    await product.save();
    res.send('Drop01 seeded 🌱');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;