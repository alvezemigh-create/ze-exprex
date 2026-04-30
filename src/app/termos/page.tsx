import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Termos de Uso — Zé Chegou 24h" };

export default function TermosPage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 pt-4 pb-8 max-w-2xl mx-auto">
        <h1 className="font-extrabold text-2xl text-brand-dark mb-3 font-display">Termos de Uso</h1>
        <div className="prose prose-sm max-w-none text-gray-600 space-y-3">
          <p>
            Bem-vindo(a) ao Zé Chegou 24h. Ao utilizar este site você concorda com os termos abaixo.
            Esta plataforma é um marketplace que conecta consumidores a distribuidoras parceiras de
            bebidas em todo o Brasil.
          </p>
          <h2 className="font-bold text-brand-dark text-lg pt-2">1. Idade mínima</h2>
          <p>
            A venda de bebidas alcoólicas é proibida para menores de 18 anos. Ao confirmar seu pedido,
            você declara ser maior de idade.
          </p>
          <h2 className="font-bold text-brand-dark text-lg pt-2">2. Entrega</h2>
          <p>
            Os prazos exibidos são estimativas baseadas na localização da distribuidora parceira mais
            próxima. Atrasos podem ocorrer em casos de força maior.
          </p>
          <h2 className="font-bold text-brand-dark text-lg pt-2">3. Cancelamento</h2>
          <p>
            Pedidos podem ser cancelados antes da saída para entrega através do contato com a
            distribuidora responsável.
          </p>
          <h2 className="font-bold text-brand-dark text-lg pt-2">4. Suporte</h2>
          <p>
            Em caso de dúvidas, entre em contato pelo WhatsApp informado no rodapé. Reclamações são
            registradas e atendidas em até 48h úteis.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
