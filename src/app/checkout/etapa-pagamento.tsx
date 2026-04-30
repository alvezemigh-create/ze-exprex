"use client";

import { useMemo, useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Loader2, Lock, Zap } from "lucide-react";
import { fmtPreco, validarCpf } from "@/lib/utils";
import { formatarNumeroCartao, validarCartao, type Bandeira } from "@/lib/cartao";

export type FormaPagamento = "pix" | "card" | "cash";

export type MetodosAtivos = {
  pix: boolean;
  card: boolean;
  cash: boolean;
};

export type DadosCartao = {
  numero: string;
  nome: string;
  validade: string;
  cvv: string;
  parcelas: number;
};

type Props = {
  total: number;
  cpf: string;
  setCpf: (v: string) => void;
  erroCpf?: string;
  observacoes: string;
  setObservacoes: (v: string) => void;
  metodos: MetodosAtivos;
  forma: FormaPagamento;
  setForma: (m: FormaPagamento) => void;
  cartao: DadosCartao;
  setCartao: (c: DadosCartao) => void;
  enviando: boolean;
  onFinalizar: () => void;
};

const formatCpf = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const formatValidade = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};

export function EtapaPagamento(props: Props) {
  const {
    total,
    cpf,
    setCpf,
    erroCpf,
    observacoes,
    setObservacoes,
    metodos,
    forma,
    setForma,
    cartao,
    setCartao,
    enviando,
    onFinalizar,
  } = props;

  return (
    <div className="space-y-3">
      <h2 className="font-extrabold text-lg text-brand-dark px-1">Escolha como pagar</h2>

      {/* PIX */}
      <MetodoCard
        ativo={metodos.pix}
        selecionado={forma === "pix"}
        onSelect={() => metodos.pix && setForma("pix")}
        icone={<IconePix />}
        titulo="PIX"
        badge={metodos.pix ? { texto: "Aprovação Imediata", classe: "bg-green-100 text-green-700" } : undefined}
      >
        {metodos.pix && forma === "pix" && (
          <PixForm
            total={total}
            cpf={cpf}
            setCpf={setCpf}
            erroCpf={erroCpf}
            enviando={enviando}
            onFinalizar={onFinalizar}
          />
        )}
      </MetodoCard>

      {/* Cartão */}
      <MetodoCard
        ativo={metodos.card}
        selecionado={forma === "card"}
        onSelect={() => metodos.card && setForma("card")}
        icone={<CreditCard className="w-5 h-5 text-gray-600" />}
        titulo="Pagar com Cartão"
      >
        {metodos.card && forma === "card" && (
          <CartaoForm
            total={total}
            cpf={cpf}
            setCpf={setCpf}
            erroCpf={erroCpf}
            cartao={cartao}
            setCartao={setCartao}
            enviando={enviando}
            onFinalizar={onFinalizar}
          />
        )}
      </MetodoCard>

      {/* Dinheiro */}
      <MetodoCard
        ativo={metodos.cash}
        selecionado={forma === "cash"}
        onSelect={() => metodos.cash && setForma("cash")}
        icone={<Banknote className="w-5 h-5 text-gray-600" />}
        titulo="Pagar em Dinheiro"
      >
        {metodos.cash && forma === "cash" && (
          <div className="px-5 pb-5 text-sm text-gray-600">
            O entregador levará a maquininha não — pagamento em espécie na entrega.
          </div>
        )}
      </MetodoCard>

      {/* Observações */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mt-2">
        <label className="text-sm font-semibold text-brand-dark mb-1.5 block">
          Observações (opcional)
        </label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Alguma observação sobre a entrega?"
          rows={3}
          style={{ fontSize: 16 }}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400 resize-none"
        />
      </div>
    </div>
  );
}

// =====================================================================
// Sub-componentes
// =====================================================================

function MetodoCard({
  ativo,
  selecionado,
  onSelect,
  icone,
  titulo,
  badge,
  children,
}: {
  ativo: boolean;
  selecionado: boolean;
  onSelect: () => void;
  icone: React.ReactNode;
  titulo: string;
  badge?: { texto: string; classe: string };
  children?: React.ReactNode;
}) {
  const desabilitado = !ativo;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden transition ${
        selecionado && ativo ? "ring-2 ring-brand-yellow" : "ring-1 ring-gray-100"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        disabled={desabilitado}
        className={`w-full flex items-center gap-3 p-4 text-left ${
          desabilitado ? "cursor-not-allowed opacity-60" : "active:bg-gray-50/50"
        }`}
      >
        <div className="flex-shrink-0">{icone}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-bold text-brand-dark ${desabilitado ? "" : ""}`}>{titulo}</span>
            {badge && ativo && (
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badge.classe}`}>
                {badge.texto}
              </span>
            )}
          </div>
          {desabilitado && (
            <p className="text-xs text-gray-400 mt-0.5">Desabilitado pelo fornecedor</p>
          )}
        </div>
        {ativo && selecionado && <CheckCircle2 className="w-5 h-5 text-brand-yellow flex-shrink-0" />}
      </button>
      {children}
    </div>
  );
}

function PixForm({
  total,
  cpf,
  setCpf,
  erroCpf,
  enviando,
  onFinalizar,
}: {
  total: number;
  cpf: string;
  setCpf: (v: string) => void;
  erroCpf?: string;
  enviando: boolean;
  onFinalizar: () => void;
}) {
  const cpfValido = validarCpf(cpf);

  return (
    <div className="bg-yellow-50/40 border-t border-yellow-100 px-5 py-4">
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        Após clicar em &lsquo;Finalizar compra&rsquo; você terá <strong>10 minutos</strong> para
        pagar. A confirmação é instantânea.
      </p>

      <label className="text-xs font-bold text-brand-dark mb-1.5 block">CPF</label>
      <input
        type="tel"
        inputMode="numeric"
        value={cpf}
        onChange={(e) => setCpf(formatCpf(e.target.value))}
        placeholder="000.000.000-00"
        maxLength={14}
        style={{ fontSize: 16 }}
        className={`w-full h-12 px-4 rounded-xl border bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400 ${
          erroCpf ? "border-red-400 bg-red-50/30" : "border-gray-200"
        }`}
      />
      {erroCpf && <p className="text-xs text-red-500 mt-1">{erroCpf}</p>}

      <p className="font-extrabold text-brand-yellow text-base mt-4">
        Valor no Pix: <span className="text-brand-dark">{fmtPreco(total)}</span>
      </p>

      <button
        type="button"
        onClick={onFinalizar}
        disabled={enviando || !cpfValido}
        className="w-full h-12 mt-3 rounded-xl font-extrabold text-sm bg-brand-yellow text-brand-dark active:scale-[0.98] transition-transform disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {enviando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Gerando PIX...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" /> Finalizar Compra com PIX
          </>
        )}
      </button>
    </div>
  );
}

function CartaoForm({
  total,
  cpf,
  setCpf,
  erroCpf,
  cartao,
  setCartao,
  enviando,
  onFinalizar,
}: {
  total: number;
  cpf: string;
  setCpf: (v: string) => void;
  erroCpf?: string;
  cartao: DadosCartao;
  setCartao: (c: DadosCartao) => void;
  enviando: boolean;
  onFinalizar: () => void;
}) {
  const [verCvv, setVerCvv] = useState(false);
  const [tocado, setTocado] = useState({
    numero: false,
    nome: false,
    validade: false,
    cvv: false,
  });

  const cpfValido = validarCpf(cpf);

  const validacao = useMemo(() => {
    return validarCartao({
      numero: cartao.numero,
      validade: cartao.validade,
      cvv: cartao.cvv,
      nome: cartao.nome,
    });
  }, [cartao.numero, cartao.validade, cartao.cvv, cartao.nome]);

  const bandeira = validacao.bandeira;
  const podeFinalizar = cpfValido && validacao.ok;
  const parcelasMax = Math.min(12, Math.max(1, Math.floor(total / 5))); // sem parcela < R$5

  // Erros individuais — apenas mostra se o campo ja foi tocado
  const errosCampo = useMemo(() => {
    const e: Partial<Record<"numero" | "validade" | "cvv" | "nome", string>> = {};
    const num = cartao.numero.replace(/\D/g, "");
    if (tocado.numero) {
      if (num.length === 0) e.numero = "Informe o número";
      else if (!bandeira.comprimentos.includes(num.length)) {
        e.numero = `Cartão precisa ter ${bandeira.comprimentos.join(" ou ")} dígitos`;
      } else {
        const v = validarCartao({ numero: cartao.numero, validade: "12/99", cvv: "000" });
        if (v.erros.includes("Numero do cartao invalido")) e.numero = "Número inválido";
      }
    }
    if (tocado.nome && cartao.nome.trim().length < 3) e.nome = "Informe o nome impresso";
    if (tocado.validade) {
      if (!/^\d{2}\/\d{2}$/.test(cartao.validade)) e.validade = "MM/AA";
      else if (validacao.erros.some((er) => er.includes("validade")))
        e.validade = "Validade expirada";
    }
    if (tocado.cvv) {
      const cvvLen = cartao.cvv.replace(/\D/g, "").length;
      if (cvvLen === 0) e.cvv = "Informe";
      else if (cvvLen !== bandeira.cvvComprimento)
        e.cvv = `${bandeira.cvvComprimento} dígitos`;
    }
    return e;
  }, [tocado, cartao.numero, cartao.nome, cartao.validade, cartao.cvv, bandeira, validacao.erros]);

  return (
    <div className="bg-yellow-50/40 border-t border-yellow-100 px-5 py-4 space-y-4">
      {/* Pré-visualização do cartão */}
      <PreviewCartao
        numero={cartao.numero}
        nome={cartao.nome}
        validade={cartao.validade}
        bandeiraId={bandeira.id}
      />

      {/* Aviso modo teste */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 leading-relaxed">
        <p>
          <span className="font-bold">Modo teste:</span> os dados do cartão serão registrados
          internamente apenas para validação durante o período de testes. Nenhum valor é cobrado.
        </p>
      </div>

      <div>
        <label className="text-xs font-bold text-brand-dark mb-1.5 flex items-center justify-between">
          <span>Número do cartão</span>
          {bandeira.id !== "desconhecida" && (
            <span className="text-[10px] uppercase tracking-wider text-brand-yellow font-bold">
              {bandeira.nome}
            </span>
          )}
        </label>
        <div className="relative">
          <input
            type="tel"
            inputMode="numeric"
            value={cartao.numero}
            onChange={(e) => setCartao({ ...cartao, numero: formatarNumeroCartao(e.target.value) })}
            onBlur={() => setTocado((t) => ({ ...t, numero: true }))}
            placeholder="0000 0000 0000 0000"
            maxLength={23}
            style={{ fontSize: 16 }}
            className={`w-full h-12 pl-4 pr-12 rounded-xl border bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400 font-mono tracking-wider ${
              errosCampo.numero ? "border-red-400" : "border-gray-200"
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <BandeiraIcone id={bandeira.id} />
          </div>
        </div>
        {errosCampo.numero && <p className="text-xs text-red-500 mt-1">{errosCampo.numero}</p>}
      </div>

      <div>
        <label className="text-xs font-bold text-brand-dark mb-1.5 block">
          Nome impresso no cartão
        </label>
        <input
          type="text"
          value={cartao.nome}
          onChange={(e) => setCartao({ ...cartao, nome: e.target.value.toUpperCase() })}
          onBlur={() => setTocado((t) => ({ ...t, nome: true }))}
          placeholder="COMO ESTÁ NO CARTÃO"
          style={{ fontSize: 16 }}
          className={`w-full h-12 px-4 rounded-xl border bg-white text-base uppercase focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400 ${
            errosCampo.nome ? "border-red-400" : "border-gray-200"
          }`}
        />
        {errosCampo.nome && <p className="text-xs text-red-500 mt-1">{errosCampo.nome}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-brand-dark mb-1.5 block">Validade</label>
          <input
            type="tel"
            inputMode="numeric"
            value={cartao.validade}
            onChange={(e) => setCartao({ ...cartao, validade: formatValidade(e.target.value) })}
            onBlur={() => setTocado((t) => ({ ...t, validade: true }))}
            placeholder="MM/AA"
            maxLength={5}
            style={{ fontSize: 16 }}
            className={`w-full h-12 px-4 rounded-xl border bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400 font-mono ${
              errosCampo.validade ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errosCampo.validade && (
            <p className="text-xs text-red-500 mt-1">{errosCampo.validade}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-bold text-brand-dark mb-1.5 block">CVV</label>
          <div className="relative">
            <input
              type={verCvv ? "text" : "password"}
              inputMode="numeric"
              value={cartao.cvv}
              onChange={(e) =>
                setCartao({
                  ...cartao,
                  cvv: e.target.value.replace(/\D/g, "").slice(0, bandeira.cvvComprimento),
                })
              }
              onBlur={() => setTocado((t) => ({ ...t, cvv: true }))}
              placeholder={"•".repeat(bandeira.cvvComprimento)}
              maxLength={bandeira.cvvComprimento}
              style={{ fontSize: 16 }}
              className={`w-full h-12 pl-4 pr-10 rounded-xl border bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400 font-mono ${
                errosCampo.cvv ? "border-red-400" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={() => setVerCvv((v) => !v)}
              aria-label="Mostrar CVV"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              {verCvv ? "ocultar" : "mostrar"}
            </button>
          </div>
          {errosCampo.cvv && <p className="text-xs text-red-500 mt-1">{errosCampo.cvv}</p>}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-brand-dark mb-1.5 block">Parcelas</label>
        <select
          value={cartao.parcelas}
          onChange={(e) => setCartao({ ...cartao, parcelas: Number(e.target.value) })}
          style={{ fontSize: 16 }}
          className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow"
        >
          {Array.from({ length: parcelasMax }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}x de {fmtPreco(total / n)} {n === 1 ? "à vista" : "sem juros"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-brand-dark mb-1.5 block">CPF do titular</label>
        <input
          type="tel"
          inputMode="numeric"
          value={cpf}
          onChange={(e) => setCpf(formatCpf(e.target.value))}
          placeholder="000.000.000-00"
          maxLength={14}
          style={{ fontSize: 16 }}
          className={`w-full h-12 px-4 rounded-xl border bg-white text-base focus:outline-none focus:ring-2 focus:ring-brand-yellow placeholder:text-gray-400 ${
            erroCpf ? "border-red-400 bg-red-50/30" : "border-gray-200"
          }`}
        />
        {erroCpf && <p className="text-xs text-red-500 mt-1">{erroCpf}</p>}
      </div>

      <p className="font-extrabold text-brand-yellow text-base mt-2">
        Total no cartão: <span className="text-brand-dark">{fmtPreco(total)}</span>
      </p>

      <button
        type="button"
        onClick={onFinalizar}
        disabled={enviando || !podeFinalizar}
        className="w-full h-12 rounded-xl font-extrabold text-sm bg-brand-yellow text-brand-dark active:scale-[0.98] transition-transform disabled:opacity-60 inline-flex items-center justify-center gap-2"
      >
        {enviando ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Processando...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" /> Finalizar Compra com Cartão
          </>
        )}
      </button>

      <p className="text-[10px] text-gray-400 text-center inline-flex items-center justify-center gap-1 w-full">
        <Lock className="w-3 h-3" /> Pagamento processado em ambiente seguro
      </p>
    </div>
  );
}

// =====================================================================
// Preview do cartão (animado, mostra bandeira)
// =====================================================================
function PreviewCartao({
  numero,
  nome,
  validade,
  bandeiraId,
}: {
  numero: string;
  nome: string;
  validade: string;
  bandeiraId: Bandeira;
}) {
  const limpo = numero.replace(/\D/g, "");
  const blocos = bandeiraId === "amex" ? [4, 6, 5] : [4, 4, 4, 4];
  const exibicao: string[] = [];
  let idx = 0;
  for (const tam of blocos) {
    const slice = limpo.slice(idx, idx + tam);
    exibicao.push(slice.padEnd(tam, "•"));
    idx += tam;
  }

  return (
    <div className="relative w-full aspect-[1.586/1] max-w-sm mx-auto rounded-2xl bg-gradient-to-br from-brand-dark via-gray-800 to-gray-900 text-white p-5 shadow-lg overflow-hidden">
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(254,205,16,0.6) 0%, rgba(254,205,16,0) 60%)",
        }}
      />

      <div className="flex items-start justify-between">
        <div className="w-10 h-7 rounded bg-yellow-400/80 flex items-center justify-center">
          <div className="w-7 h-5 rounded-sm border border-yellow-700/40 grid grid-cols-3 grid-rows-2 gap-px p-0.5">
            <span className="bg-yellow-700/40" />
            <span className="bg-yellow-700/40" />
            <span className="bg-yellow-700/40" />
            <span className="bg-yellow-700/40" />
            <span className="bg-yellow-700/40" />
            <span className="bg-yellow-700/40" />
          </div>
        </div>
        <BandeiraLogo id={bandeiraId} />
      </div>

      <div className="mt-6 font-mono text-base sm:text-lg tracking-wider">
        {exibicao.join(" ")}
      </div>

      <div className="absolute bottom-4 left-5 right-5 flex justify-between items-end">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-wider text-gray-400">Titular</p>
          <p className="font-mono text-xs uppercase truncate">{nome || "NOME COMPLETO"}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-gray-400">Validade</p>
          <p className="font-mono text-xs">{validade || "MM/AA"}</p>
        </div>
      </div>
    </div>
  );
}

function BandeiraIcone({ id }: { id: Bandeira }) {
  if (id === "desconhecida") return <CreditCard className="w-6 h-6 text-gray-300" />;
  return <BandeiraLogo id={id} compacto />;
}

function BandeiraLogo({ id, compacto = false }: { id: Bandeira; compacto?: boolean }) {
  const cls = compacto ? "h-6" : "h-7";
  switch (id) {
    case "visa":
      return (
        <div className={`${cls} px-2 rounded bg-white text-blue-700 font-extrabold italic flex items-center text-xs`}>
          VISA
        </div>
      );
    case "mastercard":
      return (
        <div className="flex items-center -space-x-2">
          <div className={`${compacto ? "w-5 h-5" : "w-6 h-6"} rounded-full bg-red-500`} />
          <div className={`${compacto ? "w-5 h-5" : "w-6 h-6"} rounded-full bg-yellow-400`} />
        </div>
      );
    case "amex":
      return (
        <div className={`${cls} px-2 rounded bg-blue-600 text-white font-extrabold flex items-center text-[10px]`}>
          AMEX
        </div>
      );
    case "elo":
      return (
        <div className={`${cls} px-2 rounded bg-black text-yellow-400 font-extrabold italic flex items-center text-xs`}>
          ELO
        </div>
      );
    case "hipercard":
      return (
        <div className={`${cls} px-2 rounded bg-red-700 text-white font-extrabold italic flex items-center text-[10px]`}>
          Hiper
        </div>
      );
    case "diners":
      return (
        <div className={`${cls} px-2 rounded bg-blue-500 text-white font-extrabold flex items-center text-[10px]`}>
          Diners
        </div>
      );
    case "discover":
      return (
        <div className={`${cls} px-2 rounded bg-orange-500 text-white font-extrabold flex items-center text-[10px]`}>
          Discover
        </div>
      );
    case "jcb":
      return (
        <div className={`${cls} px-2 rounded bg-green-700 text-white font-extrabold flex items-center text-[10px]`}>
          JCB
        </div>
      );
    default:
      return null;
  }
}

function IconePix() {
  return (
    <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
      <svg viewBox="0 0 32 32" className="w-5 h-5" fill="none" aria-hidden="true">
        <path
          d="M16 2L2 16l14 14 14-14L16 2zm0 4l10 10-10 10L6 16 16 6z"
          fill="#00B274"
        />
        <circle cx="16" cy="16" r="4" fill="#00B274" />
      </svg>
    </div>
  );
}
