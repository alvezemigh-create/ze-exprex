import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = { title: "Política de Privacidade — Zé Chegou 24h" };

export default function PrivacidadePage() {
  return (
    <>
      <Header />
      <main className="flex-1 px-4 pt-4 pb-8 max-w-2xl mx-auto">
        <h1 className="font-extrabold text-2xl text-brand-dark mb-3 font-display">Política de Privacidade</h1>
        <div className="prose prose-sm max-w-none text-gray-600 space-y-3">
          <p>
            Levamos sua privacidade a sério. Esta política descreve quais dados coletamos e como os utilizamos.
          </p>
          <h2 className="font-bold text-brand-dark text-lg pt-2">Dados coletados</h2>
          <p>
            Nome, e-mail, telefone, CPF (opcional) e endereço de entrega — usados exclusivamente para
            processar e entregar seu pedido.
          </p>
          <h2 className="font-bold text-brand-dark text-lg pt-2">Compartilhamento</h2>
          <p>
            Compartilhamos apenas o necessário com a distribuidora parceira responsável pela entrega.
            Não vendemos nem cedemos dados a terceiros para fins de marketing.
          </p>
          <h2 className="font-bold text-brand-dark text-lg pt-2">Seus direitos</h2>
          <p>
            Você pode solicitar a exclusão dos seus dados a qualquer momento entrando em contato pelo
            canal informado no rodapé.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
