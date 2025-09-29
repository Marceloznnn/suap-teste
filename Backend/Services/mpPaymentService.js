// Services/mpPaymentService.js
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const mpPayment = new Payment(client);

/**
 * Criar pagamento direto
 * @param {object} paymentData
 */
export async function createDirectPayment(paymentData) {
  try {
    const response = await mpPayment.create({ body: paymentData });
    return response;
  } catch (error) {
    console.error("❌ Erro ao criar pagamento direto:", error);
    throw new Error(error.message || "Falha ao criar pagamento");
  }
}
