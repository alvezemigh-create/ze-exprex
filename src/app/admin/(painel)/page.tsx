import Link from "next/link";
import { ChevronRight, Filter } from "lucide-react";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import { fmtPreco, fmtTelefone } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Pedidos — Zé Chegou 24h", robots: { index: false } };

const STATUS_LABEL: Record<string, { texto: string; cor: string }> = {
  aguardando_pagamento: { texto: "Aguardando pagamento", cor: "bg-yellow-100 text-yellow-700" },
  pago: { texto: "Pago", cor: "bg-green-100 text-green-700" },
  em_separacao: { texto: "Em separação", cor: "bg-blue-100 text-blue-700" },
  em_entrega: { texto: "Em entrega", cor: "bg-orange-100 text-orange-700" },
  concluido: { texto: "Concluído", cor: "bg-gray-200 text-gray-700" },
  cancelado: { texto: "Cancelado", cor: "bg-red-100 text-red-700" },
};

type Filtro = "todos" | "aguardando" | "ativos" | "concluidos";

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams?: { filtro?: string; q?: string };
}) {
  const filtro = (searchParams?.filtro ?? "ativos") as Filtro;
  const q = (searchParams?.q ?? "").trim();

  const admin = createSupabaseAdmin();
  let query = admin
    .from("pedidos")
    .select("id, numero, status, total, cliente_nome, cliente_telefone, criado_em")
    .order("criado_em", { ascending: false })
    .limit(100);

  if (filtro === "aguardando") query = query.eq("status", "aguardando_pagamento");
  if (filtro === "ativos") query = query.in("status", ["aguardando_pagamento", "pago", "em_separacao", "em_entrega"]);
  if (filtro === "concluidos") query = query.in("status", ["concluido", "cancelado"]);

  if (q) {
    query = query.or(`numero.ilike.%${q}%,cliente_nome.ilike.%${q}%,cliente_telefone.ilike.%${q}%`);
  }

  const { data: pedidos, error } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-extrabold text-2xl text-brand-dark">Pedidos</h1>
          <p className="text-sm text-gray-500">Gerencie pagamentos e entregas em andamento.</p>
        </div>
      </div>

      <form
        action="/admin"
        method="get"
        className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex flex-col sm:flex-row gap-2 items-start sm:items-center"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por número, nome ou telefone..."
          className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        />
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <FiltroLink atual={filtro} valor="ativos" rotulo="Ativos" />
          <FiltroLink atual={filtro} valor="aguardando" rotulo="Aguardando" />
          <FiltroLink atual={filtro} valor="concluidos" rotulo="Concluídos" />
          <FiltroLink atual={filtro} valor="todos" rotulo="Todos" />
        </div>
        <button
          type="submit"
          className="h-10 px-4 rounded-lg text-xs font-bold bg-brand-yellow text-brand-dark active:scale-95"
        >
          Buscar
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          Erro ao carregar pedidos: {error.message}
        </div>
      )}

      {!error && (!pedidos || pedidos.length === 0) && (
        <div className="bg-white rounded-2xl p-10 text-center text-sm text-gray-500 shadow-sm">
          Nenhum pedido encontrado.
        </div>
      )}

      <ul className="space-y-2">
        {pedidos?.map((p) => {
          const meta = STATUS_LABEL[p.status] ?? { texto: p.status, cor: "bg-gray-100 text-gray-700" };
          return (
            <li key={p.id}>
              <Link
                href={`/admin/${p.numero}`}
                className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-brand-dark text-sm truncate">{p.numero}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.cor}`}>
                        {meta.texto}
                      </span>
                    </div>
                    <p className="text-sm text-brand-dark truncate">{p.cliente_nome}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {fmtTelefone(p.cliente_telefone)} ·{" "}
                      {new Date(p.criado_em as string).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-extrabold text-brand-red">{fmtPreco(Number(p.total))}</p>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FiltroLink({ atual, valor, rotulo }: { atual: string; valor: string; rotulo: string }) {
  const ativo = atual === valor;
  return (
    <a
      href={`/admin?filtro=${valor}`}
      className={`px-2.5 h-7 rounded-full font-bold inline-flex items-center transition-colors ${
        ativo ? "bg-brand-yellow text-brand-dark" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      {rotulo}
    </a>
  );
}
