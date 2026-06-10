CREATE DATABASE IF NOT EXISTS electro_boutique
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE electro_boutique;

CREATE TABLE IF NOT EXISTS clients (
  id_client INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_clients_email (email)
);

CREATE TABLE IF NOT EXISTS products (
  id_product INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150),
  brand VARCHAR(100),
  category VARCHAR(100),
  description TEXT
);

CREATE TABLE IF NOT EXISTS inquiries (
  id_inquiry INT PRIMARY KEY AUTO_INCREMENT,
  id_client INT NOT NULL,
  id_product INT NULL,
  message TEXT,
  status VARCHAR(30) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inquiries_client
    FOREIGN KEY (id_client) REFERENCES clients(id_client)
    ON DELETE CASCADE,
  CONSTRAINT fk_inquiries_product
    FOREIGN KEY (id_product) REFERENCES products(id_product)
    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id_admin INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  UNIQUE KEY uq_admins_email (email)
);

CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at);
