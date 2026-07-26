// config/db.js — MongoDB connection setup
const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/url-shortener';

  try {
    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error(
      'Make sure MongoDB is running locally, or set MONGO_URI in your .env file to an Atlas connection string.'
    );
    process.exit(1);
  }
}

module.exports = connectDB;
