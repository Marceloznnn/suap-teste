import pool from "../Config/db.js";
import bcrypt from "bcryptjs";

// Criar usuário com name, email e senha
export async function createUser(name, email, password, role = "user", cpf = null) {
  const hashedPassword = await bcrypt.hash(password, 12);
  const sql = "INSERT INTO users (name, email, password, role, cpf) VALUES (?, ?, ?, ?, ?)";
  const [result] = await pool.query(sql, [name, email, hashedPassword, role, cpf]);
  return result;
}

// Buscar usuário por email
export async function getUserByEmail(email) {
  const sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
  const [rows] = await pool.query(sql, [email]);
  return rows[0];
}

// Validar senha
export async function validatePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Buscar usuário por ID
export async function getUserById(id) {
  const sql = "SELECT id, name, email, cpf, phone, role FROM users WHERE id = ? LIMIT 1";
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
}

// Atualizar dados do usuário
export async function updateUser(id, data) {
  const { name, cpf, phone } = data;
  const sql = "UPDATE users SET name = ?, cpf = ?, phone = ? WHERE id = ?";
  const [result] = await pool.query(sql, [name, cpf, phone, id]);
  return result;
}
