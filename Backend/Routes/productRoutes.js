import express from "express";
import {
  addProduct,
  listProducts,
  getProduct,
  editProduct,
  removeProduct,
} from "../Controllers/productController.js";

const router = express.Router();

router.post("/products", addProduct);      // Criar produto
router.get("/products", listProducts);     // Listar todos
router.get("/products/:id", getProduct);   // Buscar por ID
router.put("/products/:id", editProduct);  // Atualizar
router.delete("/products/:id", removeProduct); // Deletar

export default router;
