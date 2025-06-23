const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.id;
  try {
    let cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    res.json(cart || { userId: req.user.id, items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    } else {
      return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng' });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Giỏ hàng không tồn tại' });
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ message: 'Đã xóa toàn bộ giỏ hàng' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};