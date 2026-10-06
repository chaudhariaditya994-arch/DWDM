-- ============================================================
-- E-Commerce Customer Intelligence & Product Recommendation System
-- Academic Project: Data Mining and Data Warehousing (DWDM)
-- Database & Star Schema Definition (MySQL)
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce_data_mining;
USE ecommerce_data_mining;

-- ------------------------------------------------------------
-- 1. User Management Table (Authentication & RBAC)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Default Admin & Student Accounts
INSERT INTO users (name, email, password, role) VALUES
('System Administrator', 'admin@ecommerce.com', 'admin123', 'admin'),
('Data Analyst', 'analyst@ecommerce.com', 'analyst123', 'analyst'),
('Student Demo', 'student@ecommerce.com', 'student123', 'user')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ------------------------------------------------------------
-- 2. Star Schema Dimension 1: Dim_Customer
-- ------------------------------------------------------------
DROP TABLE IF EXISTS customers;
CREATE TABLE customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    gender VARCHAR(20),
    location VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 3. Star Schema Dimension 2: Dim_Product
-- ------------------------------------------------------------
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    product_id VARCHAR(50) PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 4. Star Schema Dimension 3: Dim_Store
-- ------------------------------------------------------------
DROP TABLE IF EXISTS stores;
CREATE TABLE stores (
    store_id VARCHAR(50) PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 5. Star Schema Dimension 4: Dim_Time
-- ------------------------------------------------------------
DROP TABLE IF EXISTS time_dimension;
CREATE TABLE time_dimension (
    time_id VARCHAR(50) PRIMARY KEY,
    date DATE NOT NULL,
    day INT NOT NULL,
    month INT NOT NULL,
    quarter INT NOT NULL,
    year INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 6. Star Schema Central Fact Table: Fact_Sales
-- ------------------------------------------------------------
DROP TABLE IF EXISTS sales_fact;
CREATE TABLE sales_fact (
    sales_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    store_id VARCHAR(50) NOT NULL,
    time_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    total_amount DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_store FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,
    CONSTRAINT fk_sales_time FOREIGN KEY (time_id) REFERENCES time_dimension(time_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 7. Market Basket Transactions Table (Association Rules)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
    transaction_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50),
    product_id VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    INDEX idx_tx_customer (customer_id),
    INDEX idx_tx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- Seed Initial Dimension Records
-- ------------------------------------------------------------
INSERT INTO customers (customer_id, name, age, gender, location) VALUES
('C0001', 'Aarav Sharma', 28, 'Male', 'Mumbai'),
('C0002', 'Diya Patel', 34, 'Female', 'Ahmedabad'),
('C0003', 'Rohan Gupta', 22, 'Male', 'Delhi'),
('C0004', 'Ananya Iyer', 45, 'Female', 'Bengaluru'),
('C0005', 'Vikram Singh', 31, 'Male', 'Jaipur')
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO products (product_id, product_name, category, price) VALUES
('P001', 'Bread', 'Bakery & Dairy', 40.00),
('P002', 'Butter', 'Bakery & Dairy', 60.00),
('P003', 'Milk', 'Bakery & Dairy', 32.00),
('P004', 'Tea', 'Beverages', 120.00),
('P005', 'Biscuits', 'Snacks', 30.00),
('P009', 'Laptop', 'Electronics', 55000.00),
('P010', 'Wireless Mouse', 'Electronics', 850.00)
ON DUPLICATE KEY UPDATE product_name=VALUES(product_name);

INSERT INTO stores (store_id, store_name, region) VALUES
('S101', 'Metro Express Mumbai', 'West'),
('S102', 'Delhi Central Mart', 'North'),
('S103', 'Tech Hub Bengaluru', 'South'),
('S104', 'City Mega Store Kolkata', 'East')
ON DUPLICATE KEY UPDATE store_name=VALUES(store_name);

INSERT INTO time_dimension (time_id, date, day, month, quarter, year) VALUES
('T20250101', '2025-01-01', 1, 1, 1, 2025),
('T20250115', '2025-01-15', 15, 1, 1, 2025),
('T20250210', '2025-02-10', 10, 2, 1, 2025),
('T20250320', '2025-03-20', 20, 3, 1, 2025)
ON DUPLICATE KEY UPDATE date=VALUES(date);

INSERT INTO sales_fact (sales_id, customer_id, product_id, store_id, time_id, quantity, total_amount) VALUES
('S00001', 'C0001', 'P001', 'S101', 'T20250101', 2, 80.00),
('S00002', 'C0001', 'P002', 'S101', 'T20250101', 1, 60.00),
('S00003', 'C0002', 'P004', 'S102', 'T20250115', 1, 120.00),
('S00004', 'C0002', 'P005', 'S102', 'T20250115', 2, 60.00),
('S00005', 'C0003', 'P009', 'S103', 'T20250210', 1, 55000.00),
('S00006', 'C0003', 'P010', 'S103', 'T20250210', 1, 850.00)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);
