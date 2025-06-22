const Order = require('../models/order.model');
const OrderDetail = require('../models/orderDetail.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

exports.createOrder = async (req, res) => {
  const { paymentMethod } = req.body; // 'cod' hoặc 'qr'
  try {
    if (!['cod', 'qr'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
    }

    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || !cart.items.length) return res.status(400).json({ message: 'Giỏ hàng trống' });

    const total = cart.items.reduce((sum, item) => sum + item.quantity * item.productId.price, 0);
    const order = new Order({ userId: req.user.id, total, paymentMethod });
    await order.save();

    const orderDetail = cart.items.map(item => ({
      orderId: order._id,
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price,
    }));
    await OrderDetail.insertMany(orderDetail);

    // Cập nhật số lượng tồn kho
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      product.stock -= item.quantity;
      await product.save();
    }

    // Xóa giỏ hàng
    cart.items = [];
    await cart.save();

    res.json({ order, message: paymentMethod === 'qr' ? 'Vui lòng quét mã QR để thanh toán' : 'Đơn hàng COD đã được tạo' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const orders = await Order.find(query).populate({
      path: 'userId',
      select: 'name email',
    });
    const orderIds = orders.map(order => order._id);
    const orderDetail = await OrderDetail.find({ orderId: { $in: orderIds } }).populate('productId');
    
    const result = orders.map(order => ({
      ...order._doc,
      items: orderDetail.filter(detail => detail.orderId.toString() === order._id.toString()),
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getInventory = async (req, res) => {
  try {
    const products = await Product.find({}, 'name stock');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thống kê sản phẩm bán theo tháng
exports.getStatsByMonth = async (req, res) => {
  try {
    // Lấy tất cả order detail, join với product và order
    const OrderDetail = require('../models/orderDetail.model');
    const Product = require('../models/product.model');
    const Order = require('../models/order.model');

    // Lấy order detail, join order để lấy tháng, join product để lấy tên
    const stats = await OrderDetail.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'orderId',
          foreignField: '_id',
          as: 'order',
        },
      },
      { $unwind: '$order' },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $addFields: {
          month: { $dateToString: { format: '%Y-%m', date: '$order.createdAt' } },
          productName: '$product.name',
        },
      },
      {
        $group: {
          _id: { month: '$month', productName: '$productName' },
          totalSold: { $sum: '$quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          productName: '$_id.productName',
          totalSold: 1,
        },
      },
      { $sort: { month: 1, productName: 1 } },
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};