import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Token não fornecido" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = { id: decoded.id }; // você pode adicionar mais info do payload se quiser
    next();
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
}
