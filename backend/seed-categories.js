const mongoose = require('mongoose');
const Category = require('./models/category.model');

async function seedCategories() {
  try {
    // Kết nối MongoDB
    await mongoose.connect('mongodb+srv://viettqhe170804:vietviet123@cluster0.y3etd8f.mongodb.net/greenecoheaven?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Danh sách danh mục
    const categories = [
      { name: 'Rau củ quả', description: 'Rau củ hữu cơ tươi ngon' },
      { name: 'Trái cây', description: 'Trái cây hữu cơ tự nhiên' },
      { name: 'Gạo, ngũ cốc', description: 'Gạo và ngũ cốc hữu cơ' },
      { name: 'Đậu', description: 'Các loại đậu hữu cơ' },
      { name: 'Hạt', description: 'Hạt dinh dưỡng hữu cơ' },
    ];

    // Xóa các danh mục cũ nếu tồn tại
    const collectionExists = await mongoose.connection.db.listCollections({ name: 'categories' }).toArray();
    if (collectionExists.length > 0) {
      await Category.deleteMany({});
      console.log('Old categories deleted');
    }

    // Thêm danh mục mới
    await Category.insertMany(categories);
    console.log('Categories seeded successfully');

    // Đóng kết nối
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedCategories();