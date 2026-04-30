import { NextResponse } from "next/server";

// GET /api/pagamento/ping
// Faz uma chamada de leitura na OneTimePay pra confirmar se a conta esta ativa
// (nao cria nada, so consulta).
export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey = process.env.ONETIMEPAY_PUBLIC_KEY;
  const secretKey = process.env.ONETIMEPAY_SECRET_KEY;
  if (!publicKey || !secretKey) {
    return NextResponse.json({ erro: "credenciais nao configuradas" }, { status: 500 });
  }

  // Testa varios endpoints de leitura pra ver o que a conta consegue acessar
  const endpoints = [
    "/gateway/transactions?startDate=2026-01-01&endDate=2026-12-31",
    "/gateway/balance",
    "/gateway/me",
    "/gateway/account",
    "/gateway/wallet",
    "/gateway/companies",
    "/gateway/withdrawals",
    "/gateway/pix-keys",
  ];

  const resultados = await Promise.all(
    endpoints.map(async (path) => {
      const r = await fetch(`https://app.onetimepay.com.br/api/v1${path}`, {
        method: "GET",
        headers: {
          "x-public-key": publicKey,
          "x-secret-key": secretKey,
        },
        cache: "no-store",
      });
      const text = await r.text();
      let parsed: unknown = null;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { _raw: text.slice(0, 300) };
      }
      return { endpoint: path, status: r.status, body: parsed };
    }),
  );

  return NextResponse.json({ resultados });
}
