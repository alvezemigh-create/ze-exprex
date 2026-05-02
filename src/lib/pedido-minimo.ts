import { fmtPreco } from "@/lib/utils";

/** Subtotal mínimo (soma dos itens, em R$) para finalizar pedido. */
export const PEDIDO_MINIMO_REAIS = 10;

export function subtotalAbaixoDoMinimo(subtotal: number): boolean {
  return subtotal < PEDIDO_MINIMO_REAIS;
}

/** Mensagem única para toast, servidor e UI. */
export function mensagemErroPedidoMinimo(): string {
  return `Pedido mínimo de ${fmtPreco(PEDIDO_MINIMO_REAIS)}. Adicione mais itens ao carrinho.`;
}
