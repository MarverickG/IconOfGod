// controllers/cartController.js
const Cart = require('../models/Cart');

exports.addToCart = async (req, res) => {
  const userId = req.user.id; // from token
  const product = req.body.product;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [product] });
    } else {
      const existing = cart.items.find(item =>
        item.productId.toString() === product.productId &&
        item.size === product.size
      );

      if (existing) {
        existing.quantity += product.quantity;
      } else {
        cart.items.push(product);
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
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
    // DELETE /api/cart/remove/:itemId
exports.deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const filteredItems = cart.items.filter(item => item._id.toString() !== itemId);

    cart.items = filteredItems;
    await cart.save();

    res.status(200).json({ message: "Item removed successfully", cart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
  }
};
