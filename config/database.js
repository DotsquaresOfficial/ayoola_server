


const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://ayoolacoinfund:KluLqa1OAhXiKEy4@ayoola.v0vpmhc.mongodb.net/Ayoola?retryWrites=true&w=majority&appName=Ayoola", {
    
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
      }
    });
    console.log("Connected to MongoDB via Mongoose!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}

module.exports = connectDB;
