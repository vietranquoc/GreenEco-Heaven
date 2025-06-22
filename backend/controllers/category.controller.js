const Category = require('../models/category.model');

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = new Category({ name, description });
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: 'Danh mục không tồn tại' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Danh mục không tồn tại' });
    res.json({ message: 'Danh mục đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};