const db = require("./db");

class User {
  static async findByEmail(email) {
    try {
      const { rows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const { rows } = await db.query(
        "SELECT id, fullname, email, is_admin FROM users"
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async createAdmin(user) {
    try {
      const { rows } = await db.query(
        "INSERT INTO users (fullname, email, phone, password, is_admin, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
        [user.fullname, user.email, user.phone, user.password, true]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async toggleAdminStatus(userId) {
    try {
      const { rowCount } = await db.query(
        "UPDATE users SET is_admin = NOT is_admin WHERE id = $1",
        [userId]
      );
      return { affectedRows: rowCount };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
