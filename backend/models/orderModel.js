const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  total_amount: { type: Number, required: true },
  payment_method: {
    type: String,
    enum: ["card", "pay_on_delivery"],
    default: "card",
  },
  payment_status: { type: String, default: "pending" },
  order_status: { type: String, default: "pending" },
  status: { type: String, default: "pending" },
  shipping_first_name: String,
  shipping_last_name: String,
  shipping_email: String,
  shipping_address: String,
  shipping_city: String,
  shipping_state: String,
  shipping_zip_code: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
