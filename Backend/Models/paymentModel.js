import pool from "../Config/db.js";

/**
 * Inserir pagamento no banco
 */
export async function insertPayment(id, amount, status, description = null, method = "unknown") {
  try {
    const sql = "INSERT INTO payments (id, amount, status, description, payment_method) VALUES (?, ?, ?, ?, ?)";
    const [result] = await pool.query(sql, [id, amount, status, description, method]);
    return result;
  } catch (error) {
    console.error("Erro ao inserir pagamento:", error);
    throw new Error("Falha ao inserir pagamento no banco de dados");
  }
}

/**
 * Atualizar status do pagamento
 */
export async function updatePaymentStatus(id, status, mpPaymentId = null) {
  try {
    let sql = "UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP";
    const params = [status];

    if (mpPaymentId) {
      sql += ", mp_payment_id = ?";
      params.push(mpPaymentId);
    }

    sql += " WHERE id = ?";
    params.push(id);

    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      console.warn(`Nenhum pagamento encontrado com ID: ${id}`);
    }

    return result;
  } catch (error) {
    console.error("Erro ao atualizar status do pagamento:", error);
    throw new Error("Falha ao atualizar status no banco de dados");
  }
}

/**
 * Listar pagamentos
 */
export async function getPayments(limit = 50, offset = 0) {
  try {
    const sql = `
      SELECT id, amount, status, description, payment_method, mp_payment_id, created_at, updated_at
      FROM payments
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [limit, offset]);
    return rows;
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error);
    throw new Error("Falha ao consultar pagamentos no banco de dados");
  }
}

/**
 * Buscar pagamento por ID
 */
export async function getPaymentById(id) {
  try {
    const sql = "SELECT * FROM payments WHERE id = ? LIMIT 1";
    const [rows] = await pool.query(sql, [id]);
    return rows[0] || null;
  } catch (error) {
    console.error("Erro ao buscar pagamento por ID:", error);
    throw new Error("Falha ao consultar pagamento específico");
  }
}

/**
 * Buscar pagamentos por status
 */
export async function getPaymentsByStatus(status) {
  try {
    const sql = "SELECT * FROM payments WHERE status = ? ORDER BY created_at DESC";
    const [rows] = await pool.query(sql, [status]);
    return rows;
  } catch (error) {
    console.error("Erro ao buscar pagamentos por status:", error);
    throw new Error("Falha ao consultar pagamentos por status");
  }
}
