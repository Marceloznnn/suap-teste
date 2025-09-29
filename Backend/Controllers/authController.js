import jwt from "jsonwebtoken";
import validator from "validator";
import { createUser, getUserByEmail, validatePassword } from "../Models/authModel.js";

const SECRET_KEY = process.env.JWT_SECRET || "SUPER_SECRET_KEY";

// Registrar usuário (sempre role user)
export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 🔹 Validações básicas
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    if (!validator.isLength(password, { min: 6 })) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Senhas não conferem" });
    }

    // 🔹 Sanitização
    const cleanName = validator.escape(name); // remove caracteres perigosos
    const cleanEmail = validator.normalizeEmail(email);

    // 🔹 Checar se email já existe
    const existingUser = await getUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    // 🔹 Criar usuário
    await createUser(cleanName, cleanEmail, password, "user");
    const user = await getUserByEmail(cleanEmail);

    // 🔹 Gerar token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // 🔹 Retornar token e dados do usuário
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    console.error("Erro no registro:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

// Login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 🔹 Validações
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Formato de email inválido" });
    }

    const cleanEmail = validator.normalizeEmail(email);

    // 🔹 Busca usuário
    const user = await getUserByEmail(cleanEmail);
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

    // 🔹 Valida senha
    const isValid = await validatePassword(password, user.password);
    if (!isValid) return res.status(400).json({ error: "Senha incorreta" });

    // 🔹 Gera token JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // 🔹 Retorna
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
