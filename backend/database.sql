-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS electronics_catalogs;

-- Use the database
USE electronics_catalogs;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (name, brand, category, price) VALUES
    ('iPhone 13', 'Apple', 'Mobiles', 999.99),
    ('Galaxy S21', 'Samsung', 'Mobiles', 899.99),
    ('MacBook Pro', 'Apple', 'Laptops', 1299.99),
    ('XPS 13', 'Dell', 'Laptops', 1199.99),
    ('AirPods Pro', 'Apple', 'Audio', 249.99),
    ('Galaxy Buds Pro', 'Samsung', 'Audio', 199.99),
    ('iPad Pro', 'Apple', 'Tablets', 799.99),
    ('Galaxy Tab S7', 'Samsung', 'Tablets', 649.99),
    ('PS5', 'Sony', 'Gaming', 499.99),
    ('Xbox Series X', 'Microsoft', 'Gaming', 499.99);

-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_user_product (user_id, product_id)
);

-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY unique_user_product (user_id, product_id)
); 

-- Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  user_id INT PRIMARY KEY,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 