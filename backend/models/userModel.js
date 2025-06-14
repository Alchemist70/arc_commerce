const db = require("./db");
const bcrypt = require("bcrypt");

const User = {
  // Register a new user
  register: async (user, callback) => {
    try {
      const hash = await bcrypt.hash(user.password, 10);
      const sql =
        "INSERT INTO users (fullname, email, phone, password) VALUES ($1, $2, $3, $4) RETURNING *";
      const values = [user.fullname, user.email, user.phone, hash];
      console.log("Executing SQL:", sql);
      console.log("With values:", values);
      const { rows } = await db.query(sql, values);
      callback(null, rows[0]);
    } catch (error) {
      console.error("SQL Error:", error);
      callback(error);
    }
  },

  // Find user by email
  findByEmail: async (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = $1";
    console.log("Checking email:", email);
    try {
      const { rows } = await db.query(sql, [email]);
      callback(null, rows.length > 0 ? rows[0] : null);
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
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE SET address = EXCLUDED.address, city = EXCLUDED.city, state = EXCLUDED.state, zip_code = EXCLUDED.zip_code, email = EXCLUDED.email, phone = EXCLUDED.phone`;
    const values = [userId, addressObj.address, addressObj.city, addressObj.state, addressObj.zipCode, addressObj.email, addressObj.phone];
    try {
      const { rows } = await db.query(sql, values);
      return rows[0];
    } catch (err) {
      throw err;
    }
  },

  // Get shipping address
  getAddress: async (userId) => {
    const sql = "SELECT address, city, state, zip_code FROM user_addresses WHERE user_id = $1";
    console.log('Running SQL:', sql, 'with userId:', userId);
    try {
      const { rows } = await db.query(sql, [userId]);
      console.log('DB results in getAddress:', rows);
      if (rows.length > 0) {
        return {
          address: rows[0].address,
          city: rows[0].city,
          state: rows[0].state,
          zipCode: rows[0].zip_code
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
