const db = require("./db");

class User {
  static async findByEmail(email) {
    try {
      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await db.query(
        "SELECT id, fullname, email, isAdmin FROM users"
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async createAdmin(user) {
    return new Promise((resolve, reject) => {
      db.query("INSERT INTO users SET ?", user, (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });
  }

  static async toggleAdminStatus(userId) {
    try {
      const [result] = await db.query(
        "UPDATE users SET isAdmin = NOT isAdmin WHERE id = ?",
        [userId]
      );
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
