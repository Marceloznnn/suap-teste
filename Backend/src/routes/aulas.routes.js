import { Router } from "express";
import AulasController from "../controller/AulasController.js";

const router = Router();

router.get("/", AulasController.listar);
router.post("/", AulasController.criar);
router.put("/:id", AulasController.atualizar);
router.delete("/:id", AulasController.deletar);

export default router;
