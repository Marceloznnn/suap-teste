import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import csrf from "csurf";
import cookieParser from "cookie-parser";

export default function security(app) {
  // Parser de cookies necessário para CSRF
  app.use(cookieParser());

  // Segurança com Helmet (CSP + headers extras)
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", "'unsafe-inline'", "https:"],
          "style-src": ["'self'", "'unsafe-inline'", "https:"],
          "img-src": ["'self'", "data:", "https:"],
          "connect-src": ["'self'", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false, // evita bloqueios de imagens/vídeos externos
    })
  );

  // Limite de requisições: 60/min por IP
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minuto
      max: 60,                 // até 60 requisições/min
      standardHeaders: true,   // retorna info nos headers RateLimit-*
      legacyHeaders: false,
    })
  );

  // CORS configurado para aceitar cookies e frontend específico
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173", // seu frontend
      credentials: true, // necessário para cookies + CSRF
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "csrf-token", "x-session-id"],
    })
  );

  // Configuração CSRF
  const csrfProtection = csrf({
    cookie: {
      httpOnly: true, // não acessível via JS
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    },
  });

  // Middleware condicional: aplica CSRF apenas em rotas que precisam
  app.use((req, res, next) => {
    const openPaths = [
      "/api/products",      // GET /api/products/:id ou listagem
      "/api/cart/items",     // POST/GET do carrinho
      "/api/payment",        // endpoints de checkout
      "/api/product-media",  // imagens de produtos
    ];

    // Se a rota começar com algum dos caminhos liberados, ignora CSRF
    if (openPaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    // Aplica CSRF
    csrfProtection(req, res, next);
  });

  // Envia token CSRF para frontend quando aplicável
  app.use((req, res, next) => {
    try {
      if (!req.csrfToken) return next();
      res.cookie("XSRF-TOKEN", req.csrfToken(), {
        httpOnly: false, // acessível pelo JS do frontend
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
    } catch (err) {
      // ignore se rota não usar CSRF
    }
    next();
  });

  // Debug opcional (remove em produção)
  app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.originalUrl}`, { headers: req.headers });
    next();
  });
}
