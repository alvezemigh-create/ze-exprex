import { obterMetodosAtivos } from "@/lib/pagamento/gateway";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout — Zé Chegou 24h",
};

export default async function CheckoutPage() {
  const metodos = await obterMetodosAtivos();
  return <CheckoutClient metodosAtivos={metodos} />;
}
