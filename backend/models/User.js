const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  is_admin: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

userSchema.statics.findAll = function () {
  return this.find({}, "id fullname email is_admin");
};

userSchema.statics.createAdmin = function (user) {
  user.is_admin = true;
  return this.create(user);
};

userSchema.statics.toggleAdminStatus = async function (userId) {
  const user = await this.findById(userId);
  if (!user) throw new Error("User not found");
  user.is_admin = !user.is_admin;
  await user.save();
  return { affectedRows: 1 };
};

module.exports = mongoose.model("User", userSchema);
