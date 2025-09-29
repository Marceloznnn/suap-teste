import pool from "../Config/db.js";

// Adicionar mídia
export async function addMedia(product_id, url, type = "image", is_primary = 0, is_secondary = 0) {
  const sql = `
    INSERT INTO product_media (product_id, url, type, is_primary, is_secondary)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [product_id, url, type, is_primary, is_secondary]);
  return result.insertId;
}

// Listar todas as mídias de um produto
export async function getMediaByProduct(product_id) {
  const sql = `
    SELECT * FROM product_media
    WHERE product_id = ?
    ORDER BY is_primary DESC, is_secondary DESC, id ASC
  `;
  const [rows] = await pool.query(sql, [product_id]);
  return rows;
}

// Buscar apenas a mídia principal de um produto
export async function getPrimaryMedia(product_id) {
  const sql = `
    SELECT *
    FROM product_media
    WHERE product_id = ? AND is_primary = 1
    LIMIT 1
  `;
  const [rows] = await pool.query(sql, [product_id]);
  return rows[0] || null;
}

// Deletar mídia
export async function deleteMedia(id) {
  const sql = "DELETE FROM product_media WHERE id = ?";
  const [result] = await pool.query(sql, [id]);
  return result;
}
