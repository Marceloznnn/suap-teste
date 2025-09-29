import pool from "../Config/db.js";

// Criar produto
export async function createProduct(data) {
  const { sku_code, name, description, price, stock, metadata } = data;
  const sql = `
    INSERT INTO products (sku_code, name, description, price, stock, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [
    sku_code,
    name,
    description || null,
    price,
    stock,
    metadata ? JSON.stringify(metadata) : null,
  ]);
  return result.insertId;
}

// Buscar todos os produtos (ativos por padrão)
export async function getAllProducts(activeOnly = true) {
  const sql = activeOnly
    ? "SELECT * FROM products WHERE is_active = 1"
    : "SELECT * FROM products";
  const [rows] = await pool.query(sql);
  return rows;
}

// Buscar produto por ID
export async function getProductById(id) {
  const sql = "SELECT * FROM products WHERE id = ? LIMIT 1";
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
}

// Atualizar produto
export async function updateProduct(id, data) {
  const { name, description, price, stock, metadata, is_active } = data;
  const sql = `
    UPDATE products
    SET name = ?, description = ?, price = ?, stock = ?, metadata = ?, is_active = ?
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [
    name,
    description || null,
    price,
    stock,
    metadata ? JSON.stringify(metadata) : null,
    is_active ?? 1,
    id,
  ]);
  return result;
}

// Deletar produto
export async function deleteProduct(id) {
  const sql = "DELETE FROM products WHERE id = ?";
  const [result] = await pool.query(sql, [id]);
  return result;
}
