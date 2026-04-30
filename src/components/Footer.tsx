import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-brand-dark px-4 py-5 mt-10">
      <nav className="flex items-center justify-center gap-3 text-[11px] text-gray-500 mb-4">
        <Link className="hover:text-gray-300 transition-colors" href="/">
          Início
        </Link>
        <span className="text-gray-700">·</span>
        <Link className="hover:text-gray-300 transition-colors" href="/produtos">
          Produtos
        </Link>
        <span className="text-gray-700">·</span>
        <Link className="hover:text-gray-300 transition-colors" href="/termos">
          Termos
        </Link>
        <span className="text-gray-700">·</span>
        <Link className="hover:text-gray-300 transition-colors" href="/privacidade">
          Privacidade
        </Link>
      </nav>
      <p className="text-center text-[10px] text-gray-600 leading-relaxed">
        Zé Chegou 24h · CNPJ 65.974.989/0001-80 · Palmeira dos Índios/AL
        <br />
        Marketplace — entregas por distribuidoras parceiras
      </p>
      <p className="text-center text-[10px] text-brand-red/70 mt-3">
        Proibida a venda para menores de 18 anos.
      </p>
    </footer>
  );
}
