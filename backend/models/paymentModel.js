const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  amount: { type: Number, required: true },
  payment_method: {
    type: String,
    enum: ["card", "cod", "pay_on_delivery"],
    required: true,
  },
  status: { type: String, default: "pending" },
  transaction_id: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Payment", paymentSchema);
