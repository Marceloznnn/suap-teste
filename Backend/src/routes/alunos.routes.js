import { Router } from "express";
import AlunosController from "../controller/AlunosController.js";

const router = Router();

// Listar todos os alunos
router.get("/", AlunosController.listar);

// Criar aluno
router.post("/", AlunosController.criar);

// Atualizar aluno
router.put("/:id", AlunosController.atualizar);

// Deletar aluno
router.delete("/:id", AlunosController.deletar);

export default router;
