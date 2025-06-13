const db = require("./db");
const bcrypt = require("bcrypt");

const User = {
  // Register a new user
  register: async (user, callback) => {
    try {
      const hash = await bcrypt.hash(user.password, 10);
      const sql =
        "INSERT INTO users (fullname, email, phone, password) VALUES (?, ?, ?, ?)";
      const values = [user.fullname, user.email, user.phone, hash];
      console.log("Executing SQL:", sql);
      console.log("With values:", values);
      const [result] = await db.query(sql, values);
      callback(null, result);
    } catch (error) {
          console.error("SQL Error:", error);
      callback(error);
        }
  },

  // Find user by email
  findByEmail: async (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    console.log("Checking email:", email);
    try {
      const [results] = await db.query(sql, [email]);
      callback(null, results.length > 0 ? results[0] : null);
    } catch (err) {
      console.error("Error finding user by email:", err);
      callback(err);
    }
  },

  // Compare passwords
  comparePassword: (password, hash, callback) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) return callback(err);
      callback(null, isMatch);
    });
  },

  // Save or update shipping address
  saveAddress: async (userId, addressObj) => {
    console.log('saveAddress called with userId:', userId, 'addressObj:', addressObj);
    const sql = `INSERT INTO user_addresses (user_id, address, city, state, zip_code, email, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE address = VALUES(address), city = VALUES(city), state = VALUES(state), zip_code = VALUES(zip_code), email = VALUES(email), phone = VALUES(phone)`;
    const values = [userId, addressObj.address, addressObj.city, addressObj.state, addressObj.zipCode, addressObj.email, addressObj.phone];
    try {
      const [result] = await db.query(sql, values);
      return result;
    } catch (err) {
      throw err;
    }
  },

  // Get shipping address
  getAddress: async (userId) => {
    const sql = "SELECT address, city, state, zip_code FROM user_addresses WHERE user_id = ?";
    console.log('Running SQL:', sql, 'with userId:', userId);
    try {
      const [results] = await db.query(sql, [userId]);
      console.log('DB results in getAddress:', results);
      if (results.length > 0) {
        return {
          address: results[0].address,
          city: results[0].city,
          state: results[0].state,
          zipCode: results[0].zip_code
        };
      } else {
        return { address: '', city: '', state: '', zipCode: '' };
      }
    } catch (err) {
      console.error('DB error in getAddress:', err);
      throw err;
    }
  },
};

module.exports = User;
