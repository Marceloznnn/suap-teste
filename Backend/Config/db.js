import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Cria pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "jm_imports",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🔄 Fechando pool de conexões...");
  await pool.end();
  process.exit(0);
});

export default pool;
