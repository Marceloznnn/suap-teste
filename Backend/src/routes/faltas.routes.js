// src/routes/faltas.routes.js
import { Router } from "express";
import FaltasController from "../controller/FaltasController.js";

const router = Router();

// Listar todas as faltas com detalhes
router.get("/", FaltasController.listar);

// Registrar ou atualizar falta
router.post("/registrar", FaltasController.registrar);

// Listar totais de faltas por aluno
router.get("/totais", FaltasController.totalFaltas);

export default router;
