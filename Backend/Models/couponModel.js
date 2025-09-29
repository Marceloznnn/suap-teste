import pool from "../Config/db.js";

// Buscar cupom por código
export async function getCouponByCode(code) {
  const sql = "SELECT * FROM coupons WHERE code = ? LIMIT 1";
  const [rows] = await pool.query(sql, [code]);
  return rows[0];
}

// Atualizar contador de uso
export async function incrementCouponUsage(id) {
  const sql = "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?";
  const [result] = await pool.query(sql, [id]);
  return result;
}

// Criar cupom
export async function createCoupon(data) {
  const { code, type, value, usage_limit, expires_at } = data;
  const sql = `
    INSERT INTO coupons (code, type, value, usage_limit, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [
    code,
    type,
    value,
    usage_limit ?? null,
    expires_at ?? null,
  ]);
  return result.insertId;
}

// Listar todos os cupons ativos
export async function getActiveCoupons() {
  const sql = "SELECT * FROM coupons WHERE active = 1";
  const [rows] = await pool.query(sql);
  return rows;
}
