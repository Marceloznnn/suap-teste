import pool from "../Config/db.js";

// Adicionar item ao carrinho
export async function addCartItem(session_id, product_id, quantity) {
  const sql = `
    INSERT INTO cart_items (session_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
  `;
  const [result] = await pool.query(sql, [session_id, product_id, quantity]);
  return result;
}

// Buscar itens do carrinho por sessão
export async function getCartItems(session_id) {
  const sql = `
    SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.sku_code
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.session_id = ?
  `;
  const [rows] = await pool.query(sql, [session_id]);
  return rows;
}

// Atualizar quantidade
export async function updateCartItem(id, quantity) {
  const sql = `UPDATE cart_items SET quantity = ? WHERE id = ?`;
  const [result] = await pool.query(sql, [quantity, id]);
  return result;
}

// Remover item
export async function deleteCartItem(id) {
  const sql = `DELETE FROM cart_items WHERE id = ?`;
  const [result] = await pool.query(sql, [id]);
  return result;
}
