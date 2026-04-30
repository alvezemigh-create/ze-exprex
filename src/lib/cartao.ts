/**
 * Helpers de validacao e formatacao de cartao de credito.
 * Cliente E servidor podem usar (sem dependencias de runtime).
 */

export type Bandeira =
  | "visa"
  | "mastercard"
  | "amex"
  | "elo"
  | "hipercard"
  | "diners"
  | "discover"
  | "jcb"
  | "desconhecida";

export type BandeiraInfo = {
  id: Bandeira;
  nome: string;
  comprimentos: number[];
  cvvComprimento: number;
};

const BANDEIRAS: { id: Bandeira; nome: string; regex: RegExp; comprimentos: number[]; cvvComprimento: number }[] = [
  // Elo — baseado nos prefixos publicos mais comuns. Testar ANTES de Visa/Master
  // por causa de 4011/5067. Lista resumida pra evitar regex gigante.
  {
    id: "elo",
    nome: "Elo",
    regex:
      /^(401178|401179|431274|438935|451416|457393|457631|457632|504175|506699|5067[0-7]\d|509\d{3}|627780|636297|636368|650(03[1-3]|0(4\d|5[01])|07[4-8]|9(0[1-9]|1\d|20))|6516(5[2-9]|[67]\d)|6550(0\d|1\d|2\d|3[1-3]|(4[1-9]|[5-8]\d)|9(0[1-9]|1\d|2[0-8])))/,
    comprimentos: [16],
    cvvComprimento: 3,
  },
  { id: "hipercard", nome: "Hipercard", regex: /^(606282|3841)/, comprimentos: [16], cvvComprimento: 3 },
  { id: "amex", nome: "American Express", regex: /^3[47]/, comprimentos: [15], cvvComprimento: 4 },
  { id: "diners", nome: "Diners Club", regex: /^(36|30[0-5]|3095|38|39)/, comprimentos: [14], cvvComprimento: 3 },
  { id: "discover", nome: "Discover", regex: /^(6011|65|64[4-9]|622)/, comprimentos: [16], cvvComprimento: 3 },
  { id: "jcb", nome: "JCB", regex: /^35(2[89]|[3-8]\d)/, comprimentos: [16], cvvComprimento: 3 },
  { id: "visa", nome: "Visa", regex: /^4/, comprimentos: [13, 16, 19], cvvComprimento: 3 },
  {
    id: "mastercard",
    nome: "Mastercard",
    regex: /^(5[1-5]|2(2(2[1-9]|[3-9]\d)|[3-6]\d{2}|7([01]\d|20)))/,
    comprimentos: [16],
    cvvComprimento: 3,
  },
];

/** Detecta a bandeira a partir dos primeiros digitos do cartao. */
export function detectarBandeira(numero: string): BandeiraInfo {
  const limpo = numero.replace(/\D/g, "");
  for (const b of BANDEIRAS) {
    if (b.regex.test(limpo)) {
      return { id: b.id, nome: b.nome, comprimentos: b.comprimentos, cvvComprimento: b.cvvComprimento };
    }
  }
  return { id: "desconhecida", nome: "Desconhecida", comprimentos: [16], cvvComprimento: 3 };
}

/**
 * Algoritmo de Luhn — usado pra validar checksum de qualquer cartao.
 * Nao garante que o cartao "existe", so que os digitos passam no checksum.
 */
export function validarLuhn(numero: string): boolean {
  const limpo = numero.replace(/\D/g, "");
  if (limpo.length < 12) return false;
  let soma = 0;
  let alterna = false;
  for (let i = limpo.length - 1; i >= 0; i--) {
    let d = parseInt(limpo[i], 10);
    if (alterna) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    soma += d;
    alterna = !alterna;
  }
  return soma % 10 === 0;
}

/** Valida formato MM/AA e se ainda nao expirou. */
export function validarValidade(valor: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(valor.trim());
  if (!m) return false;
  const mes = parseInt(m[1], 10);
  const ano = 2000 + parseInt(m[2], 10);
  if (mes < 1 || mes > 12) return false;
  const agora = new Date();
  // Cartao vale ate o ULTIMO dia do mes de validade
  const fim = new Date(ano, mes, 0, 23, 59, 59);
  return fim >= agora;
}

/**
 * Validacao completa do cartao (formato, Luhn, bandeira, validade, CVV).
 * Retorna lista de erros (vazia = OK).
 */
export function validarCartao(input: {
  numero: string;
  validade: string;
  cvv: string;
  nome?: string;
}): { ok: boolean; erros: string[]; bandeira: BandeiraInfo } {
  const erros: string[] = [];
  const bandeira = detectarBandeira(input.numero);
  const num = input.numero.replace(/\D/g, "");

  if (!bandeira.comprimentos.includes(num.length)) {
    erros.push(`Numero do cartao deve ter ${bandeira.comprimentos.join(" ou ")} digitos`);
  }
  if (!validarLuhn(num)) {
    erros.push("Numero do cartao invalido");
  }
  if (!validarValidade(input.validade)) {
    erros.push("Data de validade invalida ou expirada");
  }
  if (input.cvv.replace(/\D/g, "").length !== bandeira.cvvComprimento) {
    erros.push(`CVV deve ter ${bandeira.cvvComprimento} digitos`);
  }
  if (input.nome !== undefined && input.nome.trim().length < 3) {
    erros.push("Informe o nome impresso no cartao");
  }
  return { ok: erros.length === 0, erros, bandeira };
}

/** Formata o numero do cartao em grupos (4-4-4-4 ou 4-6-5 pra Amex). */
export function formatarNumeroCartao(numero: string): string {
  const limpo = numero.replace(/\D/g, "").slice(0, 19);
  const bandeira = detectarBandeira(limpo);
  if (bandeira.id === "amex") {
    return limpo.replace(/(\d{4})(\d{6})?(\d{5})?/, (_m, a, b, c) =>
      [a, b, c].filter(Boolean).join(" "),
    );
  }
  if (bandeira.id === "diners") {
    return limpo.replace(/(\d{4})(\d{6})?(\d{4})?/, (_m, a, b, c) =>
      [a, b, c].filter(Boolean).join(" "),
    );
  }
  return limpo.replace(/(.{4})/g, "$1 ").trim();
}

/** Mascara o PAN — mostra so os ultimos 4. */
export function mascararCartao(numero: string): string {
  const limpo = numero.replace(/\D/g, "");
  if (limpo.length < 4) return "****";
  const ultimos = limpo.slice(-4);
  const hidden = "•".repeat(Math.max(limpo.length - 4, 0));
  // formata em grupos de 4 pra parecer cartao real
  return (hidden + ultimos).replace(/(.{4})/g, "$1 ").trim();
}
