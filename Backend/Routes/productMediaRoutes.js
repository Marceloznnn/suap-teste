import express from "express";
import { uploadMedia, listMedia, removeMedia, primaryMedia } from "../Controllers/productMediaController.js";
import upload from "../Config/multer.js";

const router = express.Router();

router.post("/media", upload.single("file"), uploadMedia);
router.get("/media/:product_id", listMedia);
router.get("/media/:product_id/primary", primaryMedia); // NOVO endpoint para imagem principal
router.delete("/media/:id", removeMedia);

export default router;
