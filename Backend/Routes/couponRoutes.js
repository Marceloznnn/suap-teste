import express from "express";
import { applyCoupon } from "../Controllers/couponController.js";

const router = express.Router();

router.post("/cart/coupon", applyCoupon);  // Endpoint para aplicar cupom

export default router;
