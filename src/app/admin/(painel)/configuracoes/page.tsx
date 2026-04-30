import { obterWhatsappSuporte } from "@/lib/config-app";
import { ConfiguracoesClient } from "./configuracoes-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin · Configurações — Zé Chegou 24h",
  robots: { index: false },
};

export default async function ConfiguracoesPage() {
  const whatsapp = await obterWhatsappSuporte();
  return <ConfiguracoesClient whatsappAtual={whatsapp} />;
}
