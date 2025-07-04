const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Phục vụ file tĩnh từ thư mục frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Route cho các trang HTML
app.get(['/', '/admin', '/products', '/blogs', '/login', '/register', '/profile'], (req, res) => {
  const page = req.path === '/' ? 'index.html' : `${req.path.slice(1)}.html`;
  res.sendFile(path.join(__dirname, '../frontend', page));
});

// Import routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/carts', require('./routes/cart.routes'));
app.use('/api/categories', require('./routes/category.routes'));

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

module.exports = app;