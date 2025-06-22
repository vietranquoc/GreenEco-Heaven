const User = require('../models/user.model');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateUser = async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { name, email },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại' });
    res.json({ message: 'Người dùng đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};