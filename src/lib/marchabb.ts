import "server-only";

// Cliente MarchaBB — gateway alternativo de pagamento PIX
// Doc: https://app.marchabb.com/docs/intro/first-steps
//
// Diferencas chave vs OneTimePay:
//   - Auth: Basic (base64(public:secret)) em "Authorization" header
//   - Valor em CENTAVOS (int) e nao reais (float)
//   - Endpoint unificado: POST /v1/transactions com paymentMethod: "pix"
//   - Resposta: pix.qrcode (sem base64/image) + secureUrl (link de pagamento)
//   - Postback: { type: "transaction", data: { status: "paid"|"waiting_payment"|... } }
//   - externalRef = nosso identifier (pedido.numero)

const DEFAULT_BASE_URL = "https://api.marchabb.com/v1";

export type MarchaBBConfig = {
  baseUrl: string;
  publicKey: string;
  secretKey: string;
};

function getConfig(): MarchaBBConfig {
  const publicKey = process.env.MARCHABB_PUBLIC_KEY;
  const secretKey = process.env.MARCHABB_SECRET_KEY;
  if (!publicKey || !secretKey) {
    throw new Error(
      "MarchaBB nao configurado. Defina MARCHABB_PUBLIC_KEY e MARCHABB_SECRET_KEY no .env.local",
    );
  }
  return {
    baseUrl: process.env.MARCHABB_API_URL || DEFAULT_BASE_URL,
    publicKey,
    secretKey,
  };
}

function authHeaders() {
  const cfg = getConfig();
  const token = Buffer.from(`${cfg.publicKey}:${cfg.secretKey}`).toString("base64");
  return {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  } as Record<string, string>;
}

// =============== TYPES ===============

export type MbbCustomer = {
  name: string;
  email: string;
  phone: string;
  document: { type: "cpf" | "cnpj"; number: string };
};

export type MbbItem = {
  title: string;
  quantity: number;
  /** preco unitario em CENTAVOS */
  unitPrice: number;
  tangible?: boolean;
  externalRef?: string;
};

export type CriarPixInput = {
  /** Nosso identificador unico (pedido.numero) — vai no externalRef */
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
  items: Array<{ title: string; quantity: number; price: number; tangible?: boolean; ref?: string }>;
  /** YYYY-MM-DD — vencimento do PIX (default = amanha) */
  expirationDate?: string;
  /** URL pra receber postback */
  postbackUrl?: string;
  metadata?: Record<string, unknown>;
};

export type CriarPixResposta = {
  /** ID interno gerado pela MarchaBB (numero, ex: 123456) */
  id: number;
  /** valor cobrado (em centavos) */
  amount: number;
  status: string;
  paymentMethod: string;
  externalRef?: string | null;
  secureId?: string;
  secureUrl?: string;
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

function inferirTipoDocumento(doc: string): "cpf" | "cnpj" {
  return digitos(doc).length === 14 ? "cnpj" : "cpf";
}

// =============== API CALLS ===============

/**
 * POST /v1/transactions — cria uma transacao PIX
 * Doc: https://app.marchabb.com/docs/sales/create-sale
 */
export async function criarCobrancaPix(input: CriarPixInput): Promise<CriarPixResposta> {
  const cfg = getConfig();
  const url = `${cfg.baseUrl}/transactions`;

  const dueDateDefault = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const docDigits = digitos(input.client.document);
  const phoneDigits = digitos(input.client.phone);

  const items: MbbItem[] = input.items.map((i, idx) => ({
    title: i.title.slice(0, 200),
    quantity: i.quantity,
    unitPrice: reaisParaCentavos(i.price),
    tangible: i.tangible ?? true,
    externalRef: i.ref ?? `item-${idx + 1}`,
  }));

  const customer: MbbCustomer & { address?: object } = {
    name: input.client.name.trim(),
    email: input.client.email.trim().toLowerCase(),
    phone: phoneDigits,
    document: { type: inferirTipoDocumento(input.client.document), number: docDigits },
  };

  // Adiciona endereco no customer (formato MarchaBB)
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
    currency: "BRL",
    paymentMethod: "pix",
    pix: {
      expirationDate: input.expirationDate ?? dueDateDefault,
    },
    items,
    customer,
    externalRef: input.identifier,
    postbackUrl: input.postbackUrl,
    metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
  };

  // Se tem endereco e items fisicos, manda como shipping tambem (boa pratica deles)
  const temFisico = items.some((i) => i.tangible);
  if (temFisico && input.endereco) {
    body.shipping = {
      fee: 0,
      address: {
        street: input.endereco.street,
        streetNumber: input.endereco.number,
        complement: input.endereco.complement || undefined,
        neighborhood: input.endereco.neighborhood,
        zipCode: digitos(input.endereco.cep),
        city: input.endereco.city,
        state: input.endereco.state,
        country: "BR",
      },
    };
  }

  console.log("[marchabb] POST", url, JSON.stringify(body));

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
    console.error("[marchabb] resposta nao-JSON:", r.status, text);
    throw new Error(`MarchaBB resposta nao-JSON (status ${r.status}): ${text.slice(0, 500)}`);
  }

  if (!r.ok) {
    console.error("[marchabb] erro:", r.status, JSON.stringify(data));
    const err = data as { message?: string; error?: string; errors?: unknown };
    throw new Error(
      `MarchaBB PIX falhou (${r.status}): ${err.message ?? err.error ?? "erro desconhecido"} | ${text.slice(0, 600)}`,
    );
  }

  // A MarchaBB retorna o objeto da transacao direto (parecido com o postback `data`)
  const t = data as Partial<CriarPixResposta> & { pix?: { qrcode?: string } };
  if (!t?.pix?.qrcode) {
    throw new Error(`MarchaBB resposta sem qrcode: ${text.slice(0, 600)}`);
  }
  return t as CriarPixResposta;
}

/**
 * GET /v1/transactions/{id} — consulta uma transacao por ID
 * Doc: https://app.marchabb.com/docs/sales/find-sale
 */
export type ConsultarTransacaoResposta = {
  id: number;
  status: string;
  paymentMethod?: string;
  externalRef?: string | null;
  paidAt?: string | null;
  amount?: number;
  pix?: { qrcode?: string; receiptUrl?: string | null; expirationDate?: string | null };
};

export async function consultarTransacaoPorId(id: string | number) {
  const cfg = getConfig();
  const url = `${cfg.baseUrl}/transactions/${encodeURIComponent(String(id))}`;
  const r = await fetch(url, { headers: authHeaders(), cache: "no-store" });
  const text = await r.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`MarchaBB resposta nao-JSON (status ${r.status}): ${text.slice(0, 300)}`);
  }
  if (!r.ok) {
    throw new Error(`MarchaBB consulta falhou (${r.status}): ${text.slice(0, 300)}`);
  }
  return data as ConsultarTransacaoResposta;
}

/**
 * Mapeia status da MarchaBB pro nosso enum de pedido_status
 * Status conhecidos: waiting_payment, pending, paid, approved, refused,
 *                    in_protest, refunded, cancelled, chargeback
 */
export function mapearStatusPedido(mbbStatus: string): string {
  const s = (mbbStatus || "").toLowerCase();
  if (s === "paid" || s === "approved") return "pago";
  if (s === "refused" || s === "cancelled" || s === "canceled") return "cancelado";
  if (s === "refunded" || s === "chargeback") return "cancelado";
  return "aguardando_pagamento";
}
