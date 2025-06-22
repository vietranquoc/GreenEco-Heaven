const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Lấy token từ "Bearer <token>"
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role }; // Gán req.user
    next();
  } catch (error) {
    res.status(401).json({ message: 'Không có quyền truy cập' });
  }
};  