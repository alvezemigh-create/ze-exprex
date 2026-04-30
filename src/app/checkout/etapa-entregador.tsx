"use client";

import Image from "next/image";
import { Bike, Clock, MapPin, Star } from "lucide-react";

// Dados do entregador — por enquanto hardcoded (visual no funil).
// Quando virar real, vem do banco baseado em geolocalizacao do pedido.
const ENTREGADOR = {
  nome: "Carlos Henrique",
  foto: "/entregador.jpg",
  placa: "ABC-2J45",
  modelo: "Honda CG 160 Start",
  avaliacao: 4.9,
  entregas: 1284,
  distanciaKm: 2.1,
  tempoEstimadoMin: 15,
};

type EnderecoBasico = {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
};

export function EtapaEntregador({ endereco }: { endereco: EnderecoBasico }) {
  const enderecoFmt = [
    endereco.street && `${endereco.street}${endereco.number ? `, ${endereco.number}` : ""}`,
    endereco.neighborhood,
    endereco.city && endereco.state ? `${endereco.city} - ${endereco.state}` : endereco.city,
  ]
    .filter(Boolean)
    .join(", ");

  // Mapa OpenStreetMap embed — gratuito, sem chave de API. O OSM busca pelo endereco
  // em texto. Funciona pra qualquer CEP/endereco brasileiro.
  const queryMapa = encodeURIComponent(enderecoFmt || endereco.cep || "Brasil");
  const mapaUrl = `https://maps.google.com/maps?q=${queryMapa}&z=15&t=m&output=embed`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden bg-brand-yellow flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Bike className="w-5 h-5 text-brand-dark" />
          <div className="font-display text-brand-dark">
            <span className="font-extrabold">ENTREGADOR</span>{" "}
            <span className="font-extrabold text-white drop-shadow">A CAMINHO</span>
            <p className="text-[10px] font-bold leading-none mt-0.5">DA SUA REGIÃO</p>
          </div>
        </div>
        <span className="text-2xl">🛵</span>
      </div>

      {/* Card do entregador */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-brand-yellow">
            <Image
              src={ENTREGADOR.foto}
              alt={ENTREGADOR.nome}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-brand-dark text-base truncate">{ENTREGADOR.nome}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
              <span className="text-xs font-bold text-brand-dark">{ENTREGADOR.avaliacao}</span>
              <span className="text-xs text-gray-400">
                · {ENTREGADOR.entregas.toLocaleString("pt-BR")} entregas
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] uppercase font-bold tracking-wider bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                ● Online
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-100">
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">Placa</p>
            <p className="font-extrabold text-brand-dark text-sm font-mono mt-0.5">
              {ENTREGADOR.placa}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{ENTREGADOR.modelo}</p>
          </div>
          <div className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
              Tempo estimado
            </p>
            <p className="font-extrabold text-brand-dark text-sm mt-0.5 inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-brand-yellow" /> {ENTREGADOR.tempoEstimadoMin} min
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">{ENTREGADOR.distanciaKm} km de você</p>
          </div>
        </div>
      </div>

      {/* Mapa do endereço */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-brand-yellow mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Local de entrega
            </p>
            <p className="text-sm text-gray-700 leading-tight mt-0.5">
              {enderecoFmt || "Endereço informado"}
            </p>
          </div>
        </div>
        <div className="relative w-full aspect-[16/10] bg-gray-100">
          <iframe
            src={mapaUrl}
            title="Mapa do local de entrega"
            loading="lazy"
            className="w-full h-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-[11px] text-yellow-900 flex items-start gap-2">
        <span className="text-base leading-none mt-0.5">⚡</span>
        <p className="leading-relaxed">
          <span className="font-bold">Entregador atribuído!</span> Confirme o pagamento na próxima
          tela pra ele iniciar a entrega.
        </p>
      </div>
    </div>
  );
}
