import { Router } from "express";
import { createPayment, createPixPayment, createCardPayment, listPayments, webhook } from "../Controllers/paymentController.js";

const router = Router();

router.post("/payments", createPayment);
router.post("/payments/pix", createPixPayment);
router.post("/payments/card", createCardPayment);
router.get("/payments", listPayments);
router.post("/webhook", webhook);

export default router;
