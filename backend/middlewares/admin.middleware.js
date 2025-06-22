const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Truy cập bị từ chối, chỉ dành cho admin' });
    }
    next();
};

module.exports = adminMiddleware;