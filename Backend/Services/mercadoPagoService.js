import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";
dotenv.config();

// Variáveis de ambiente com validações
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const NODE_ENV = process.env.NODE_ENV || "development";

// Valida configuração obrigatória
if (!MP_ACCESS_TOKEN) {
  throw new Error("❌ MP_ACCESS_TOKEN não definido no .env");
}

if (!FRONTEND_URL || !BASE_URL) {
  throw new Error("❌ FRONTEND_URL e BASE_URL devem estar definidos no .env");
}

// Log de inicialização
console.log("🔧 Configuração Mercado Pago:", {
  environment: NODE_ENV,
  frontend_url: FRONTEND_URL,
  base_url: BASE_URL,
  token_prefix: MP_ACCESS_TOKEN.substring(0, 20) + "..."
});

// Inicializa cliente Mercado Pago com configurações de produção
const client = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN,
  options: {
    timeout: 10000,
    idempotencyKey: undefined // Para produção, pode ser necessário
  }
});
const preference = new Preference(client);

/**
 * Cria preferência de pagamento no Mercado Pago para PRODUÇÃO
 * @param {number} amount Valor do pagamento
 * @param {string} description Descrição do pagamento
 * @param {string|null} externalReference ID externo do pagamento
 * @param {string} payerEmail Email do pagador
 * @returns {Promise<object>} Resposta do Mercado Pago
 */
export async function createPreference(
  amount, 
  description = "Pagamento", 
  externalReference = null,
  payerEmail = null
) {
  const cleanAmount = Number(parseFloat(amount).toFixed(2));
  
  if (cleanAmount <= 0) {
    throw new Error("Valor deve ser maior que zero");
  }

  const data = {
    items: [
      {
        id: externalReference || Date.now().toString(),
        title: description.substring(0, 256), // Limite do MP
        unit_price: cleanAmount,
        quantity: 1,
        currency_id: "BRL", // Explicitamente BRL para produção
      },
    ],
    
    // URLs de retorno para produção
    back_urls: {
      success: `${FRONTEND_URL}/payment/success`,
      failure: `${FRONTEND_URL}/payment/failure`,
      pending: `${FRONTEND_URL}/payment/pending`,
    },
    
    auto_return: "approved",
    
    // Webhook para notificações
    notification_url: `${BASE_URL}/api/webhook`,
    
    // Referência externa
    external_reference: externalReference,
    
    // Informações do pagador (se fornecido)
    ...(payerEmail && {
      payer: {
        email: payerEmail.trim().toLowerCase(),
      }
    }),
    
    // Configurações de pagamento para produção
    payment_methods: {
      excluded_payment_methods: [], // Vazio = aceita todos
      excluded_payment_types: [], // Vazio = aceita todos
      installments: 12, // Até 12x
      default_installments: 1,
    },
    
    // Configurações adicionais
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    
    // Metadados para rastreamento
    metadata: {
      created_at: new Date().toISOString(),
      environment: NODE_ENV,
      version: "1.0"
    },
    
    // Configurações de experiência
    additional_info: {
      payer: payerEmail ? {
        registration_date: new Date().toISOString().split('T')[0]
      } : undefined
    },
    
    // Statement descriptor (aparece na fatura do cartão)
    statement_descriptor: "PAGAMENTO*LOJA",
  };

  try {
    console.log("💡 Enviando preferência para Mercado Pago:", {
      external_reference: externalReference,
      amount: cleanAmount,
      description: description.substring(0, 50) + "...",
      payer_email: payerEmail
    });
    
    const response = await preference.create({ body: data });
    
    console.log("✅ Preferência criada com sucesso:", {
      id: response.id,
      init_point: response.init_point,
      external_reference: externalReference
    });
    
    return response;
  } catch (error) {
    console.error("❌ Erro ao criar preferência no Mercado Pago:", {
      error: error.message,
      status: error.status,
      cause: error.cause,
      external_reference: externalReference
    });
    
    // Re-throw com mensagem mais específica
    if (error.status === 400) {
      throw new Error("Dados inválidos para criar preferência");
    } else if (error.status === 401) {
      throw new Error("Token de acesso inválido");
    } else if (error.status >= 500) {
      throw new Error("Erro temporário do Mercado Pago, tente novamente");
    } else {
      throw new Error("Falha ao criar preferência no Mercado Pago");
    }
  }
}

/**
 * Valida se as credenciais estão configuradas para produção
 */
export function validateProductionConfig() {
  const isProduction = MP_ACCESS_TOKEN.startsWith('APP_USR-');
  const isSandbox = MP_ACCESS_TOKEN.startsWith('TEST-');
  
  return {
    is_production: isProduction,
    is_sandbox: isSandbox,
    environment: isProduction ? 'production' : (isSandbox ? 'sandbox' : 'unknown'),
    frontend_configured: !!FRONTEND_URL && FRONTEND_URL !== 'http://localhost:3001',
    webhook_configured: !!BASE_URL && BASE_URL !== 'http://localhost:3000'
  };
}

/**
 * Obtém informações da conta Mercado Pago (para debug)
 */
export async function getAccountInfo() {
  try {
    // Esta é uma função auxiliar para debug - não usar em produção real
    const config = validateProductionConfig();
    return {
      environment: config.environment,
      token_type: MP_ACCESS_TOKEN.substring(0, 8) + "...",
      urls: {
        frontend: FRONTEND_URL,
        backend: BASE_URL,
        webhook: `${BASE_URL}/api/webhook`
      }
    };
  } catch (error) {
    return { error: "Não foi possível obter informações da conta" };
  }
}