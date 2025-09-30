import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import faltasRoutes from "./routes/faltas.routes.js";
import alunosRoutes from "./routes/alunos.routes.js";
import aulasRoutes from "./routes/aulas.routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/faltas", faltasRoutes);
app.use("/api/alunos", alunosRoutes);
app.use("/api/aulas", aulasRoutes);

export default app;
