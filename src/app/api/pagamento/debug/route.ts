import { NextResponse } from "next/server";

// Rota de DEBUG — roda 3 testes em paralelo com variacoes pra isolar o problema.
// Acesse: http://localhost:3000/api/pagamento/debug
// Apaga essa rota antes de subir pra producao.

export const dynamic = "force-dynamic";

const URL_API = "https://app.onetimepay.com.br/api/v1/gateway/pix/receive";

const DUE_DATE = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
})();

async function chamar(rotulo: string, body: Record<string, unknown>) {
  const r = await fetch(URL_API, {
    method: "POST",
    headers: {
      "x-public-key": process.env.ONETIMEPAY_PUBLIC_KEY!,
      "x-secret-key": process.env.ONETIMEPAY_SECRET_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await r.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { _raw: text.slice(0, 500) };
  }
  return { rotulo, status: r.status, ok: r.ok, enviado: body, recebido: parsed };
}

export async function GET() {
  const publicKey = process.env.ONETIMEPAY_PUBLIC_KEY;
  const secretKey = process.env.ONETIMEPAY_SECRET_KEY;
  if (!publicKey || !secretKey) {
    return NextResponse.json({ erro: "credenciais nao configuradas" }, { status: 500 });
  }

  const ts = Date.now();

  const baseClient = {
    email: "joao.silva@gmail.com",
    phone: "(11) 98765-4321",
    document: "248.438.034-80",
  };

  const testes = await Promise.all([
    chamar("A: nome real, R$ 5,00 (deve passar)", {
      identifier: `DBG_A_${ts}`,
      amount: 5.0,
      client: { name: "Joao da Silva", ...baseClient },
      dueDate: DUE_DATE,
    }),
    chamar("B: nome 'testee qwe', R$ 5,00", {
      identifier: `DBG_B_${ts}`,
      amount: 5.0,
      client: { name: "testee qwe", ...baseClient },
      dueDate: DUE_DATE,
    }),
    chamar("C: nome real, R$ 257,95", {
      identifier: `DBG_C_${ts}`,
      amount: 257.95,
      client: { name: "Joao da Silva", ...baseClient },
      dueDate: DUE_DATE,
    }),
    chamar("D: nome 'testee qwe', R$ 257,95", {
      identifier: `DBG_D_${ts}`,
      amount: 257.95,
      client: { name: "testee qwe", ...baseClient },
      dueDate: DUE_DATE,
    }),
  ]);

  return NextResponse.json({ testes });
}
