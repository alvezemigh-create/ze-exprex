import "server-only";

// =============================================================================
// Cliente CenturionPay — gateway PIX/cartao alternativo
// Doc: https://centurion.readme.io/
//
// Notas-chave (validadas via testes diretos contra a API):
//   - Auth: Basic (base64(SECRET_KEY:COMPANY_ID)) em "Authorization"
//   - Endpoint base: https://api.centurionpay.com.br/functions/v1
//   - Criar transacao: POST /transactions
//   - Consultar:        GET  /transactions/:id
//   - Estornar:         DELETE /transactions/:id
//   - Valor (`amount`) em CENTAVOS (int)
//   - paymentMethod aceito: "PIX" (validado), "CREDIT_CARD" (provavel)
//   - Resposta de PIX: pix.qrcode = copia-e-cola; nao retorna imagem (geramos)
//   - Status conhecidos: waiting_payment, paid, refused, refunded, chargeback
//   - Webhook: precisamos receber e tratar formato envelope OU plano (parser robusto)
// =============================================================================

const DEFAULT_BASE_URL = "https://api.centurionpay.com.br/functions/v1";

export type CenturionConfig = {
  baseUrl: string;
  secretKey: string;
  companyId: string;
};

function getConfig(): CenturionConfig {
  const secretKey = process.env.CENTURIONPAY_SECRET_KEY;
  const companyId = process.env.CENTURIONPAY_COMPANY_ID;
  if (!secretKey || !companyId) {
    throw new Error(
      "CenturionPay nao configurado. Defina CENTURIONPAY_SECRET_KEY e CENTURIONPAY_COMPANY_ID no .env.local",
    );
  }
  return {
    baseUrl: process.env.CENTURIONPAY_API_URL || DEFAULT_BASE_URL,
    secretKey,
    companyId,
  };
}

function authHeaders() {
  const cfg = getConfig();
  const token = Buffer.from(`${cfg.secretKey}:${cfg.companyId}`).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  } as Record<string, string>;
}

// =============== TYPES ===============

export type CtCustomer = {
  name: string;
  email: string;
  phone: string;
  document: { type: "CPF" | "CNPJ"; number: string };
  address?: {
    street: string;
    streetNumber: string;
    complement?: string;
    zipCode: string;
    neighborhood: string;
    city: string;
    state: string;
    country: "BR";
  };
};

export type CtItem = {
  title: string;
  quantity: number;
  /** preco unitario em CENTAVOS */
  unitPrice: number;
  tangible?: boolean;
};

export type CriarPixInput = {
  /** Identificador unico (pedido.numero) — vai como externalRef/metadata */
  identifier: string;
  /** Valor TOTAL em REAIS (a gente converte pra centavos aqui dentro) */
  amount: number;
  client: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  endereco?: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  items: Array<{ title: string; quantity: number; price: number; tangible?: boolean }>;
  /** URL pra receber postback (webhook) */
  postbackUrl?: string;
  metadata?: Record<string, unknown>;
};

export type CriarPixResposta = {
  /** UUID gerado pela CenturionPay */
  id: string;
  /** valor cobrado (em centavos) */
  amount: number;
  status: string;
  paymentMethod: string;
  externalRef?: string | null;
  secureId?: string | null;
  secureUrl?: string | null;
  pix: {
    qrcode: string;
    expirationDate?: string | null;
    end2EndId?: string | null;
    receiptUrl?: string | null;
  };
};

// =============== HELPERS ===============

function reaisParaCentavos(reais: number): number {
  return Math.round(reais * 100);
}

function digitos(s: string) {
  return s.replace(/\D/g, "");
}

function inferirTipoDocumento(doc: string): "CPF" | "CNPJ" {
  return digitos(doc).length === 14 ? "CNPJ" : "CPF";
}

// =============== API CALLS ===============

/**
 * POST /transactions — cria uma transacao PIX
 */
export async function criarCobrancaPix(input: CriarPixInput): Promise<CriarPixResposta> {
  const cfg = getConfig();
  const url = `${cfg.baseUrl}/transactions`;

  const docDigits = digitos(input.client.document);
  const phoneDigits = digitos(input.client.phone);

  const items: CtItem[] = input.items.map((i) => ({
    title: i.title.slice(0, 200),
    quantity: i.quantity,
    unitPrice: reaisParaCentavos(i.price),
    tangible: i.tangible ?? true,
  }));

  const customer: CtCustomer = {
    name: input.client.name.trim(),
    email: input.client.email.trim().toLowerCase(),
    phone: phoneDigits,
    document: { type: inferirTipoDocumento(input.client.document), number: docDigits },
  };

  if (input.endereco) {
    customer.address = {
      street: input.endereco.street,
      streetNumber: input.endereco.number,
      complement: input.endereco.complement || undefined,
      zipCode: digitos(input.endereco.cep),
      neighborhood: input.endereco.neighborhood,
      city: input.endereco.city,
      state: input.endereco.state,
      country: "BR",
    };
  }

  const body: Record<string, unknown> = {
    amount: reaisParaCentavos(input.amount),
    paymentMethod: "PIX",
    installments: 1,
    customer,
    items,
    externalRef: input.identifier,
    postbackUrl: input.postbackUrl,
    metadata: input.metadata
      ? JSON.stringify({ ...input.metadata, identifier: input.identifier })
      : JSON.stringify({ identifier: input.identifier }),
  };

  const temFisico = items.some((i) => i.tangible);
  if (temFisico && input.endereco) {
    body.shipping = {
      fee: 0,
      address: customer.address,
    };
  }

  console.log("[centurionpay] POST", url, JSON.stringify(body));

  const r = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await r.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("[centurionpay] resposta nao-JSON:", r.status, text);
    throw new Error(`CenturionPay resposta nao-JSON (status ${r.status}): ${text.slice(0, 500)}`);
  }

  if (!r.ok) {
    console.error("[centurionpay] erro:", r.status, JSON.stringify(data));
    const err = data as { message?: string; error?: string; refusedReason?: { description?: string } };
    throw new Error(
      `CenturionPay PIX falhou (${r.status}): ${
        err.refusedReason?.description ?? err.message ?? err.error ?? "erro desconhecido"
      } | ${text.slice(0, 600)}`,
    );
  }

  const t = data as Partial<CriarPixResposta> & { pix?: { qrcode?: string }; status?: string };

  // Algumas respostas podem voltar status "refused" mesmo com 200
  if (t.status === "refused") {
    const ref = (data as { refusedReason?: { description?: string } }).refusedReason;
    throw new Error(
      `CenturionPay recusou: ${ref?.description ?? "motivo desconhecido"} | ${text.slice(0, 400)}`,
    );
  }

  if (!t?.pix?.qrcode) {
    throw new Error(`CenturionPay resposta sem qrcode: ${text.slice(0, 600)}`);
  }
  return t as CriarPixResposta;
}

/**
 * GET /transactions/:id — consulta uma transacao
 */
export type ConsultarTransacaoResposta = {
  id: string;
  status: string;
  paymentMethod?: string;
  externalRef?: string | null;
  paidAt?: string | null;
  amount?: number;
  pix?: { qrcode?: string; receiptUrl?: string | null; expirationDate?: string | null };
};

export async function consultarTransacaoPorId(id: string) {
  const cfg = getConfig();
  const url = `${cfg.baseUrl}/transactions/${encodeURIComponent(id)}`;
  const r = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  const text = await r.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `CenturionPay resposta nao-JSON (status ${r.status}): ${text.slice(0, 300)}`,
    );
  }
  if (!r.ok) {
    throw new Error(`CenturionPay consulta falhou (${r.status}): ${text.slice(0, 300)}`);
  }
  return data as ConsultarTransacaoResposta;
}

/**
 * Mapeia status do CenturionPay pro nosso enum interno.
 * Status conhecidos: waiting_payment, paid, refused, refunded, chargeback,
 *                    pending, processing, expired, cancelled
 */
export function mapearStatusPedido(ctStatus: string): string {
  const s = (ctStatus || "").toLowerCase();
  if (s === "paid" || s === "approved") return "pago";
  if (
    s === "refused" ||
    s === "cancelled" ||
    s === "canceled" ||
    s === "expired" ||
    s === "failed"
  )
    return "cancelado";
  if (s === "refunded" || s === "chargeback") return "cancelado";
  return "aguardando_pagamento";
}
