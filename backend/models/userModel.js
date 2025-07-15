const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userAddressSchema = new mongoose.Schema(
  {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    email: String,
    phone: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  is_admin: { type: Boolean, default: false },
  address: userAddressSchema,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

userSchema.statics.register = async function (user, callback) {
  try {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    const newUser = await this.create(user);
    callback(null, newUser);
  } catch (error) {
    callback(error);
  }
};

userSchema.statics.findByEmail = function (email, callback) {
  this.findOne({ email }, (err, user) => {
    if (err) return callback(err);
    callback(null, user);
  });
};

userSchema.statics.comparePassword = function (password, hash, callback) {
  bcrypt.compare(password, hash, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};

userSchema.statics.saveAddress = async function (userId, addressObj) {
  return this.findByIdAndUpdate(userId, { address: addressObj }, { new: true });
};

userSchema.statics.getAddress = async function (userId) {
  const user = await this.findById(userId);
  if (user && user.address) {
    return user.address;
  } else {
    return { address: "", city: "", state: "", zipCode: "" };
  }
};

userSchema.statics.findAll = async function () {
  const users = await this.find({}, "fullname email is_admin");
  return users.map((u) => ({
    id: u._id.toString(),
    fullname: u.fullname,
    email: u.email,
    is_admin: u.is_admin,
  }));
};

userSchema.statics.toggleAdminStatus = async function (userId) {
  const user = await this.findById(userId);
  if (!user) throw new Error("User not found");
  user.is_admin = !user.is_admin;
  await user.save();
  return { affectedRows: 1 };
};

module.exports = mongoose.model("User", userSchema);
