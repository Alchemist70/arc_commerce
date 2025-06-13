-- Add payment_method column if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) NOT NULL DEFAULT 'card';

-- Add payment_status column if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'pending';

-- Add order_status column if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) NOT NULL DEFAULT 'pending';

-- Add status column if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'pending';

-- Add shipping fields if they don't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_zip_code VARCHAR(20);

-- Add transaction_id column to payments table if it doesn't exist
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255); 