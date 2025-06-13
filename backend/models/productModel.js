const db = require("./db");

const Product = {
  getAll: async () => {
    try {
      const [rows] = await db.query("SELECT * FROM products");
      return rows;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  add: async (data) => {
    const { name, brand, category, price } = data;
    if (!name || !brand || !category || !price) {
      throw new Error("All fields are required");
    }

    try {
      const [result] = await db.query(
        "INSERT INTO products (name, brand, category, price) VALUES (?, ?, ?, ?)",
        [name, brand, category, price]
      );
      return { message: "Product added successfully!", id: result.insertId };
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  },
};

module.exports = Product;
