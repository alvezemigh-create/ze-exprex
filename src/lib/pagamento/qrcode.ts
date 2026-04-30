import "server-only";
import QRCode from "qrcode";

/**
 * Gera um QR Code em formato data URL (base64) a partir do payload PIX (copia-e-cola).
 * Retorna algo como: "data:image/png;base64,iVBORw0K..."
 *
 * Usado quando o gateway nao manda imagem propria (ex: MarchaBB so manda o codigo
 * de copia-e-cola). Pra OneTimePay, que ja manda a imagem, nao precisa chamar.
 */
export async function gerarQrCodeDataUrl(payload: string): Promise<string | null> {
  if (!payload) return null;
  try {
    return await QRCode.toDataURL(payload, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: { dark: "#000000", light: "#FFFFFF" },
    });
  } catch (e) {
    console.error("[qrcode] falha ao gerar", e);
    return null;
  }
}
