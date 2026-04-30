"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { calcDesconto, fmtPreco, slugify } from "@/lib/utils";
import {
  atualizarProduto,
  criarProduto,
  excluirProduto,
  uploadImagemProduto,
  type ProdutoInput,
} from "./actions";

type Categoria = { id: string; nome: string };

type Props = {
  modo: "novo" | "editar";
  categorias: Categoria[];
  inicial: {
    id?: string;
    nome: string;
    slug: string;
    descricao: string | null;
    marca: string | null;
    volume: string | null;
    teor_alcoolico: string | null;
    temperatura: string | null;
    preco: number | null;
    preco_promocional: number | null;
    imagem_url: string | null;
    em_estoque: boolean;
    destaque: boolean;
    mais_vendido: boolean;
    novo: boolean;
    ordem: number;
    publicado: boolean;
    categoria_id: string;
  };
};

export function ProdutoForm({ modo, categorias, inicial }: Props) {
  const router = useRouter();
  const [salvando, startTransition] = useTransition();
  const [excluindo, setExcluindo] = useState(false);
  const [enviandoImg, setEnviandoImg] = useState(false);

  const [nome, setNome] = useState(inicial.nome);
  const [slug, setSlug] = useState(inicial.slug);
  const [slugManual, setSlugManual] = useState(modo === "editar");
  const [descricao, setDescricao] = useState(inicial.descricao ?? "");
  const [marca, setMarca] = useState(inicial.marca ?? "");
  const [volume, setVolume] = useState(inicial.volume ?? "");
  const [teor, setTeor] = useState(inicial.teor_alcoolico ?? "");
  const [temperatura, setTemperatura] = useState(inicial.temperatura ?? "");
  const [preco, setPreco] = useState<string>(inicial.preco?.toString() ?? "");
  const [precoPromo, setPrecoPromo] = useState<string>(inicial.preco_promocional?.toString() ?? "");
  const [imagemUrl, setImagemUrl] = useState(inicial.imagem_url ?? "");
  const [emEstoque, setEmEstoque] = useState(inicial.em_estoque);
  const [destaque, setDestaque] = useState(inicial.destaque);
  const [maisVendido, setMaisVendido] = useState(inicial.mais_vendido);
  const [novo, setNovo] = useState(inicial.novo);
  const [ordem, setOrdem] = useState(inicial.ordem ?? 0);
  const [publicado, setPublicado] = useState(inicial.publicado);
  const [categoriaId, setCategoriaId] = useState(inicial.categoria_id);

  const onChangeNome = (v: string) => {
    setNome(v);
    if (!slugManual) setSlug(slugify(v));
  };

  const precoNum = preco ? Number(preco.replace(",", ".")) : null;
  const promoNum = precoPromo ? Number(precoPromo.replace(",", ".")) : null;
  const desconto = calcDesconto(precoNum, promoNum);

  const fazerUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem máxima de 5 MB");
      return;
    }
    setEnviandoImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug || "produto");
      const r = await uploadImagemProduto(fd);
      if (!r.ok) {
        toast.error(r.erro);
        return;
      }
      setImagemUrl(r.url);
      toast.success("Imagem enviada!");
    } finally {
      setEnviandoImg(false);
    }
  };

  const salvar = () => {
    if (!nome.trim()) {
      toast.error("Nome obrigatório");
      return;
    }
    if (!categoriaId) {
      toast.error("Escolha uma categoria");
      return;
    }
    const input: ProdutoInput = {
      nome,
      slug: slug || slugify(nome),
      descricao,
      marca,
      volume,
      teor_alcoolico: teor,
      temperatura,
      preco: precoNum,
      preco_promocional: promoNum,
      imagem_url: imagemUrl || null,
      em_estoque: emEstoque,
      destaque,
      mais_vendido: maisVendido,
      novo,
      ordem,
      publicado,
      categoria_id: categoriaId,
    };
    startTransition(async () => {
      const r =
        modo === "editar" && inicial.id
          ? await atualizarProduto(inicial.id, input)
          : await criarProduto(input);
      if (!r.ok) {
        toast.error(r.erro);
        return;
      }
      toast.success(modo === "editar" ? "Produto salvo!" : "Produto criado!");
      if (modo === "novo" && "id" in r) {
        router.push(`/admin/produtos/${r.id}`);
      } else {
        router.refresh();
      }
    });
  };

  const excluir = async () => {
    if (!inicial.id) return;
    if (!confirm(`Excluir o produto "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setExcluindo(true);
    const r = await excluirProduto(inicial.id);
    setExcluindo(false);
    if (!r.ok) {
      toast.error(r.erro);
      return;
    }
    toast.success("Produto excluído");
    router.push("/admin/produtos");
  };

  return (
    <div className="grid sm:grid-cols-3 gap-5">
      <div className="sm:col-span-2 space-y-4">
        <Card titulo="Informações principais">
          <Field label="Nome *">
            <input
              type="text"
              value={nome}
              onChange={(e) => onChangeNome(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              placeholder="Cerveja Heineken Long Neck 330ml"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug" hint={`/produto/${slug || "exemplo"}`}>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugManual(true);
                }}
                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </Field>
            <Field label="Categoria *">
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              >
                <option value="">Escolha...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Descrição">
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </Field>
        </Card>

        <Card titulo="Preço">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Preço oficial (R$)">
              <input
                type="text"
                inputMode="decimal"
                value={preco}
                onChange={(e) => setPreco(e.target.value.replace(/[^\d.,]/g, ""))}
                placeholder="29,90"
                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </Field>
            <Field label="Preço promocional (R$)" hint="Opcional — aplica desconto">
              <input
                type="text"
                inputMode="decimal"
                value={precoPromo}
                onChange={(e) => setPrecoPromo(e.target.value.replace(/[^\d.,]/g, ""))}
                placeholder="24,90"
                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </Field>
          </div>
          {desconto > 0 && (
            <p className="text-xs text-brand-green font-bold">
              {desconto}% de desconto · Cliente paga {fmtPreco(promoNum!)} (em vez de {fmtPreco(precoNum!)})
            </p>
          )}
        </Card>

        <Card titulo="Detalhes (opcionais)">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Marca">
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </Field>
            <Field label="Volume">
              <input
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder="350ml"
                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </Field>
            <Field label="Teor alcoólico">
              <input
                type="text"
                value={teor}
                onChange={(e) => setTeor(e.target.value)}
                placeholder="5%"
                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </Field>
            <Field label="Temperatura">
              <input
                type="text"
                value={temperatura}
                onChange={(e) => setTemperatura(e.target.value)}
                placeholder="Gelada"
                className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card titulo="Imagem">
          <div className="aspect-square rounded-xl bg-gray-100 relative overflow-hidden flex items-center justify-center mb-3">
            {imagemUrl ? (
              <Image src={imagemUrl} alt="" fill sizes="200px" className="object-contain p-2" />
            ) : (
              <ImageIcon className="w-10 h-10 text-gray-300" />
            )}
            {enviandoImg && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-brand-dark" />
              </div>
            )}
          </div>
          <label className="w-full h-10 rounded-lg bg-brand-dark text-white text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer active:scale-95 hover:bg-black/85">
            <Upload className="w-3.5 h-3.5" /> {imagemUrl ? "Trocar" : "Enviar"} foto
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) fazerUpload(f);
              }}
            />
          </label>
          {imagemUrl && (
            <button
              type="button"
              onClick={() => setImagemUrl("")}
              className="w-full mt-2 text-xs text-gray-500 hover:text-red-500"
            >
              Remover imagem
            </button>
          )}
          <p className="text-[10px] text-gray-400 text-center mt-2">JPG/PNG/WEBP, até 5 MB</p>
        </Card>

        <Card titulo="Status & destaque">
          <Toggle label="Visível no site" value={publicado} onChange={setPublicado} />
          <Toggle label="Em estoque" value={emEstoque} onChange={setEmEstoque} />
          <Toggle label="Destaque" value={destaque} onChange={setDestaque} hint="Aparece em ofertas" />
          <Toggle label="Mais vendido" value={maisVendido} onChange={setMaisVendido} />
          <Toggle label="Novo" value={novo} onChange={setNovo} hint="Mostra selo NOVO" />
          <Field label="Ordem">
            <input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(Number(e.target.value) || 0)}
              className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </Field>
        </Card>

        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className="w-full h-12 rounded-xl font-extrabold text-sm bg-brand-yellow text-brand-dark active:scale-[0.98] inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {modo === "editar" ? "Salvar alterações" : "Criar produto"}
        </button>

        {modo === "editar" && (
          <button
            type="button"
            onClick={excluir}
            disabled={excluindo}
            className="w-full h-11 rounded-xl text-xs font-bold text-red-600 border border-red-100 hover:bg-red-50 inline-flex items-center justify-center gap-2"
          >
            {excluindo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Excluir produto
          </button>
        )}
      </div>
    </div>
  );
}

function Card({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{titulo}</h3>
      {children}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      {label && <span className="text-xs font-semibold text-brand-dark mb-1 block">{label}</span>}
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded mt-0.5"
      />
      <div className="flex-1">
        <span className="text-sm">{label}</span>
        {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
      </div>
    </label>
  );
}
