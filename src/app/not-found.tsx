import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="font-extrabold text-5xl text-brand-dark mb-2 font-display">404</h1>
        <p className="text-gray-500 mb-6">Página não encontrada</p>
        <Link
          href="/"
          className="inline-flex h-11 px-6 rounded-full text-brand-dark font-bold text-sm items-center bg-brand-yellow hover:opacity-90 transition-opacity"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  );
}
