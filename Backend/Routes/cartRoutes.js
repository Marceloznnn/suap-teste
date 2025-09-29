import express from "express";
import { addToCart, listCart, updateItem, removeItem } from "../Controllers/cartController.js";

const router = express.Router();

router.post("/cart/items", addToCart);
router.get("/cart/items", listCart);
router.put("/cart/items/:id", updateItem);
router.delete("/cart/items/:id", removeItem);

export default router;
