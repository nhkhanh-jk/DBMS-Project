const sequelize = require('./sequelize');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected via Sequelize');
    
    // Sync database models
    // alter: false — chỉ tạo bảng nếu chưa có, KHÔNG ALTER bảng đã tồn tại
    // Dùng alter: true khi thay đổi schema model (thêm/sửa cột), sau đó tắt lại
    await sequelize.sync({ alter: false });
    console.log('PostgreSQL models synchronized');
  } catch (error) {
    console.error('PostgreSQL connection/synchronization error:', error);
    throw error;
  }
};

module.exports = { connectDB };
