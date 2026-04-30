import {
  GATEWAYS_DISPONIVEIS,
  obterGatewayAtivo,
  obterMetodosAtivos,
} from "@/lib/pagamento/gateway";
import { PagamentoClient } from "./pagamento-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin · Pagamentos — Zé Chegou 24h",
  robots: { index: false },
};

export default async function PagamentoPage() {
  const [ativo, metodos] = await Promise.all([
    obterGatewayAtivo(),
    obterMetodosAtivos(),
  ]);

  // Detecta se as chaves de cada gateway estao configuradas
  const onetimepayConfigurado = !!(
    process.env.ONETIMEPAY_PUBLIC_KEY && process.env.ONETIMEPAY_SECRET_KEY
  );
  const marchabbConfigurado = !!(
    process.env.MARCHABB_PUBLIC_KEY && process.env.MARCHABB_SECRET_KEY
  );
  const centurionpayConfigurado = !!(
    process.env.CENTURIONPAY_SECRET_KEY && process.env.CENTURIONPAY_COMPANY_ID
  );

  const gateways = GATEWAYS_DISPONIVEIS.map((g) => ({
    ...g,
    configurado:
      g.id === "onetimepay"
        ? onetimepayConfigurado
        : g.id === "marchabb"
          ? marchabbConfigurado
          : centurionpayConfigurado,
  }));

  return <PagamentoClient gatewayAtivo={ativo} gateways={gateways} metodos={metodos} />;
}
