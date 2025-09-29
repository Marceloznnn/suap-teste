import express from "express";
import rateLimit from "express-rate-limit";
import { register, login } from "../Controllers/authController.js";

const router = express.Router();

// Limitador de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Muitas tentativas de login, tente novamente em 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// CSRF: pegar o token do cookie e enviar no header 'csrf-token' (feito pelo middleware security)

router.post("/register", register);
router.post("/login", loginLimiter, login);

export default router;
