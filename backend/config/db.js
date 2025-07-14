require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://ars-carts:XFQXmLl6tSfC8hqs@ars-carts.m1qkaqv.mongodb.net/?retryWrites=true&w=majority&appName=ARS-Carts";

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("✅ Connected to MongoDB Atlas");
});

module.exports = db;
