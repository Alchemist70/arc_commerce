const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  category: String,
  price: { type: Number, required: true },
  description: String,
  image_url: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

productSchema.statics.getAll = function () {
  return this.find();
};

productSchema.statics.add = function (data) {
  return this.create(data);
};

module.exports = mongoose.model("Product", productSchema);
