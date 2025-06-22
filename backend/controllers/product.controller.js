const Product = require('../models/product.model');
const Category = require('../models/category.model');

exports.getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find().populate('categoryId').skip(skip).limit(limit),
      Product.countDocuments()
    ]);

    res.json({ products, total });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getLatestProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const products = await Product.find()
      .populate('categoryId')
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.createProduct = async (req, res) => {
  const { name, description, price, categoryId, stock } = req.body;
  try {
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) return res.status(400).json({ message: 'Danh mục không tồn tại' });
    }
    const product = new Product({
      name,
      description,
      price,
      categoryId,
      stock,
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateProduct = async (req, res) => {
  const { name, description, price, categoryId, stock } = req.body;
  try {
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) return res.status(400).json({ message: 'Danh mục không tồn tại' });
    }
    const updateData = { name, description, price, categoryId, stock };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    res.json({ message: 'Sản phẩm đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};