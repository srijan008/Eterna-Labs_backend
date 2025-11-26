
const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/order_engine_db';

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
  });

  console.log('✅ Connected to MongoDB:', mongoUri);
}

module.exports = connectDB;
