const Order = require('../models/order.model');
const OrderDetail = require('../models/orderDetail.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

exports.createOrder = async (req, res) => {
  const { paymentMethod, fullName, email, phoneNumber, address, note } = req.body; // Thêm các trường thông tin nhận hàng
  try {
    if (!['cod', 'qr'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
    }

    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || !cart.items.length) return res.status(400).json({ message: 'Giỏ hàng trống' });

    const total = cart.items.reduce((sum, item) => sum + item.quantity * item.productId.price, 0);
    const order = new Order({
      userId: req.user.id,
      fullName,
      email,
      phoneNumber,
      address,
      note,
      total,
      paymentMethod
    });
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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Đơn hàng không tồn tại' });

    // Nếu là admin, cho phép cập nhật mọi trạng thái
    if (req.user.role === 'admin') {
      order.status = status;
      await order.save();
      return res.json(order);
    }

    // Nếu là user thường, chỉ cho phép cập nhật sang delivered
    if (order.userId && order.userId.equals && order.userId.equals(req.user.id) && status === 'delivered' && order.status === 'shipped') {
      order.status = 'delivered';
      await order.save();
      return res.json(order);
    }

    return res.status(403).json({ message: 'Bạn không có quyền cập nhật trạng thái này.' });
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

// Thống kê sản phẩm bán theo ngày hoặc tháng
exports.getStats = async (req, res) => {
  try {
    const type = req.query.type === 'day' ? 'day' : 'month';
    const metric = req.query.metric || 'sold';
    const dateFormat = type === 'day' ? '%Y-%m-%d' : '%Y-%m';
    const OrderDetail = require('../models/orderDetail.model');
    const Order = require('../models/order.model');

    if (metric === 'revenue') {
      // Tổng doanh thu theo ngày/tháng (không phân theo sản phẩm)
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
        { $match: { 'order.status': 'delivered' } },
        {
          $addFields: {
            period: { $dateToString: { format: dateFormat, date: '$order.createdAt' } },
            revenue: { $multiply: ['$quantity', '$price'] }
          },
        },
        {
          $group: {
            _id: '$period',
            totalRevenue: { $sum: '$revenue' }
          },
        },
        {
          $project: {
            _id: 0,
            period: '$_id',
            totalRevenue: 1
          },
        },
        { $sort: { period: 1 } },
      ]);
      return res.json(stats);
    } else {
      // Thống kê sản phẩm bán như cũ
      const Product = require('../models/product.model');
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
        { $match: { 'order.status': 'delivered' } },
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
            period: { $dateToString: { format: dateFormat, date: '$order.createdAt' } },
            productName: '$product.name',
          },
        },
        {
          $group: {
            _id: { period: '$period', productName: '$productName' },
            totalSold: { $sum: '$quantity' }
          },
        },
        {
          $project: {
            _id: 0,
            period: '$_id.period',
            productName: '$_id.productName',
            totalSold: 1
          },
        },
        { $sort: { period: 1, productName: 1 } },
      ]);
      return res.json(stats);
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};