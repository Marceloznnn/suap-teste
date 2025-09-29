import { getCouponByCode, incrementCouponUsage } from "../Models/couponModel.js";

// Aplicar cupom
export async function applyCoupon(req, res) {
  try {
    const { code, total } = req.body;

    if (!code) return res.status(400).json({ error: "Código do cupom obrigatório" });

    const coupon = await getCouponByCode(code.toUpperCase());
    if (!coupon || !coupon.active) return res.status(404).json({ error: "Cupom inválido" });

    // Verifica limite de uso
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: "Cupom já atingiu o limite de uso" });
    }

    // Verifica expiração
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return res.status(400).json({ error: "Cupom expirado" });
    }

    // Calcula desconto
    let discount = 0;
    if (coupon.type === "percentage") {
      discount = total * (coupon.value / 100);
    } else if (coupon.type === "fixed") {
      discount = coupon.value;
    }

    // Incrementa contador de uso
    await incrementCouponUsage(coupon.id);

    res.json({ discount: parseFloat(discount.toFixed(2)), message: `Cupom aplicado: ${coupon.code}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno ao aplicar cupom" });
  }
}
