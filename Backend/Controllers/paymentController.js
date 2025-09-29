import { v4 as uuidv4 } from "uuid";
import { insertPayment, updatePaymentStatus, getPayments } from "../Models/paymentModel.js";
import { createPreference } from "../Services/mercadoPagoService.js";
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    timeout: 5000,
  }
});
const mpPayment = new Payment(client);

/**
 * Criar pagamento via Checkout Pro (preferência) - PRODUÇÃO
 */
export async function createPayment(req, res) {
  try {
    const { amount, description, payer_email } = req.body;

    // Validações mais rigorosas para produção
    if (!amount || Number(amount) <= 0 || Number(amount) < 0.50) {
      return res.status(400).json({ 
        error: "Valor inválido", 
        details: "O valor deve ser maior que R$ 0,50" 
      });
    }

    if (!description || description.trim().length < 3) {
      return res.status(400).json({ 
        error: "Descrição obrigatória", 
        details: "A descrição deve ter pelo menos 3 caracteres" 
      });
    }

    if (!payer_email || !isValidEmail(payer_email)) {
      return res.status(400).json({ 
        error: "Email obrigatório", 
        details: "Forneça um email válido do pagador" 
      });
    }

    const paymentId = uuidv4();
    const cleanAmount = Number(parseFloat(amount).toFixed(2));
    const cleanDescription = description.trim().substring(0, 600); // Limite do MP

    await insertPayment(paymentId, cleanAmount, "pending", cleanDescription, "checkout_pro");

    const preferenceResponse = await createPreference(
      cleanAmount, 
      cleanDescription, 
      paymentId,
      payer_email
    );

    return res.status(201).json({
      id: paymentId,
      preference_id: preferenceResponse.id,
      init_point: preferenceResponse.init_point,
      status: "pending",
      message: "Preferência criada com sucesso",
      amount: cleanAmount,
      description: cleanDescription,
    });
  } catch (error) {
    console.error("Erro em createPayment:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor", 
      details: process.env.NODE_ENV === 'development' ? error.message : "Tente novamente"
    });
  }
}

/**
 * Criar pagamento PIX real - PRODUÇÃO
 */
export async function createPixPayment(req, res) {
  try {
    const { amount, description, payer_email, payer_name, payer_document } = req.body;
    
    // Validações para PIX em produção
    if (!amount || Number(amount) <= 0 || Number(amount) < 0.50) {
      return res.status(400).json({ 
        error: "Valor inválido", 
        details: "Valor mínimo para PIX: R$ 0,50" 
      });
    }

    if (!payer_email || !isValidEmail(payer_email)) {
      return res.status(400).json({ error: "Email válido obrigatório" });
    }

    if (!payer_document || !isValidCPF(payer_document)) {
      return res.status(400).json({ error: "CPF válido obrigatório" });
    }

    const paymentId = uuidv4();
    const cleanAmount = Number(parseFloat(amount).toFixed(2));

    const paymentData = {
      transaction_amount: cleanAmount,
      description: description?.trim() || "Pagamento PIX",
      payment_method_id: "pix",
      external_reference: paymentId,
      payer: {
        email: payer_email.trim().toLowerCase(),
        first_name: payer_name?.trim() || "Cliente",
        identification: {
          type: "CPF",
          number: payer_document.replace(/\D/g, '')
        }
      },
      notification_url: `${process.env.BASE_URL}/api/webhook`,
      date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
    };

    console.log("🔄 Criando pagamento PIX:", { paymentId, amount: cleanAmount });
    const mpResponse = await mpPayment.create({ body: paymentData });

    await insertPayment(paymentId, cleanAmount, mpResponse.status, description?.trim(), "pix");

    res.status(201).json({
      id: paymentId,
      status: mpResponse.status,
      mp_payment_id: mpResponse.id,
      qr_code: mpResponse.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: mpResponse.point_of_interaction?.transaction_data?.qr_code_base64,
      expiration_date: paymentData.date_of_expiration,
      message: "Pagamento PIX criado com sucesso",
      amount: cleanAmount,
    });
  } catch (error) {
    console.error("Erro em createPixPayment:", error);
    res.status(500).json({ 
      error: "Erro ao criar pagamento PIX", 
      details: process.env.NODE_ENV === 'development' ? error.message : "Tente novamente"
    });
  }
}

/**
 * Criar pagamento Cartão de Crédito - PRODUÇÃO
 */
export async function createCardPayment(req, res) {
  try {
    const { 
      amount, 
      description, 
      token, 
      installments, 
      payment_method_id,
      payer_email,
      payer_identification
    } = req.body;

    // Validações rigorosas para cartão
    if (!amount || Number(amount) <= 0 || Number(amount) < 0.50) {
      return res.status(400).json({ error: "Valor mínimo: R$ 0,50" });
    }

    if (!token || !payment_method_id || !payer_email) {
      return res.status(400).json({ error: "Token, método de pagamento e email obrigatórios" });
    }

    if (!isValidEmail(payer_email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    const paymentId = uuidv4();
    const cleanAmount = Number(parseFloat(amount).toFixed(2));
    const cleanInstallments = Math.max(1, parseInt(installments) || 1);

    const paymentData = {
      transaction_amount: cleanAmount,
      token,
      installments: cleanInstallments,
      payment_method_id,
      external_reference: paymentId,
      description: description?.trim() || "Pagamento com cartão",
      payer: {
        email: payer_email.trim().toLowerCase(),
        identification: payer_identification
      },
      notification_url: `${process.env.BASE_URL}/api/webhook`,
      capture: true, // Captura automática
      binary_mode: false,
    };

    console.log("🔄 Criando pagamento cartão:", { paymentId, amount: cleanAmount });
    const mpResponse = await mpPayment.create({ body: paymentData });

    await insertPayment(paymentId, cleanAmount, mpResponse.status, description?.trim(), "credit_card");

    res.status(201).json({
      id: paymentId,
      status: mpResponse.status,
      mp_payment_id: mpResponse.id,
      status_detail: mpResponse.status_detail,
      message: "Pagamento com cartão processado",
      amount: cleanAmount,
      installments: cleanInstallments,
      approved: mpResponse.status === "approved",
    });
  } catch (error) {
    console.error("Erro em createCardPayment:", error);
    res.status(500).json({ 
      error: "Erro ao processar cartão", 
      details: process.env.NODE_ENV === 'development' ? error.message : "Verifique os dados"
    });
  }
}

/**
 * Listar pagamentos com paginação
 */
export async function listPayments(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const payments = await getPayments(limit, offset);
    
    res.json({ 
      success: true, 
      count: payments.length, 
      page,
      limit,
      data: payments 
    });
  } catch (error) {
    console.error("Erro em listPayments:", error);
    res.status(500).json({ error: "Erro ao listar pagamentos" });
  }
}

/**
 * Webhook do Mercado Pago - PRODUÇÃO
 */
export async function webhook(req, res) {
  try {
    console.log("📥 Webhook recebido:", req.body);
    const { type, data, action } = req.body;

    if (type === "payment" && data?.id) {
      const mpId = data.id;
      
      try {
        console.log("🔍 Buscando pagamento MP:", mpId);
        const mpResponse = await mpPayment.get({ id: mpId });
        
        const referenceId = mpResponse.external_reference || mpId;
        console.log("📝 Atualizando status:", { referenceId, status: mpResponse.status });
        
        await updatePaymentStatus(referenceId, mpResponse.status, mpId);
        console.log("✅ Status atualizado com sucesso");
      } catch (mpError) {
        console.error("❌ Erro ao processar webhook MP:", mpError);
      }
    }

    // Sempre retorna 200 para evitar reenvios
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    res.status(200).json({ received: false });
  }
}

/**
 * Utilitários de validação
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidCPF(cpf) {
  if (!cpf) return false;
  cpf = cpf.replace(/\D/g, '');
  return cpf.length === 11 && /^\d{11}$/.test(cpf);
}