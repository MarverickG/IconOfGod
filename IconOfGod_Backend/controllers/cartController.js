// controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // ✅ load the Product model
exports.addToCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, size, quantity } = req.body.product;

  try {
    // 🔍 Get product details from DB
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // 🛒 Create the cart item with DB data
    const newCartItem = {
      productId,
      name: product.name,
      imageUrl: product.imageUrl,
      size,
      price: product.price,
      quantity
    };

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [newCartItem] });
    } else {
      const existing = cart.items.find(item =>
        item.productId.toString() === productId &&
        item.size === size
      );

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.items.push(newCartItem);
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ error: 'Could not add to cart' });
  }
};

exports.getCart = async (req, res) => {
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    res.status(200).json(cart || { userId, items: [] });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch cart' });
  }
};

exports.removeFromCart = async (req, res) => {
  const userId = req.user.id;
  const { productId, size } = req.body;

  try {
    let cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter(item =>
      !(item.productId.toString() === productId && item.size === size)
    );
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Could not remove item' });
  }
};
