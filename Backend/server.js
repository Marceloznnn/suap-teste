import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // ✅ importar cors
import security from "./middlewares/security.js";

// Rotas
import csrfRoutes from "./Routes/csrfRoutes.js";
import authRoutes from "./Routes/authRoutes.js";
import paymentRoutes from "./Routes/paymentRoutes.js";
import productRoutes from "./Routes/productRoutes.js";
import productMediaRoutes from "./Routes/productMediaRoutes.js";
import cartRoutes from "./Routes/cartRoutes.js";
import couponRoutes from "./Routes/couponRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Confia nos cabeçalhos do proxy (necessário para ngrok e rate-limit)
app.set("trust proxy", 1);

// ✅ Middleware CORS - permite frontend acessar API
app.use(cors({
  origin: process.env.FRONTEND_URL, // http://localhost:5173 ou https://xxxx.ngrok-free.app
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "csrf-token", "x-session-id"],
  credentials: true,
}));

// Middleware para JSON
app.use(express.json());

// Middleware de segurança centralizado
security(app);

// 🔹 Debug de requisições recebidas (pode remover em produção)
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`, {
    headers: req.headers,
  });
  next();
});

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api", paymentRoutes);
app.use("/api", productRoutes);
app.use("/api", productMediaRoutes);
app.use("/api", cartRoutes);
app.use("/api", couponRoutes);
app.use("/api", csrfRoutes);

// Inicialização do servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
  console.log(`🌍 Frontend liberado: ${process.env.FRONTEND_URL}`);
});
