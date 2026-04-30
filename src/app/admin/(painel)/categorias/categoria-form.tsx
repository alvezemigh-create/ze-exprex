"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageIcon, Loader2, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import {
  atualizarCategoria,
  criarCategoria,
  excluirCategoria,
  uploadImagemCategoria,
  type CategoriaInput,
} from "./actions";

type Props = {
  modo: "novo" | "editar";
  inicial: {
    id?: string;
    nome: string;
    slug: string;
    descricao: string | null;
    icone: string | null;
    imagem_url: string | null;
    ordem: number;
    publicada: boolean;
  };
};

const ICONES_SUGERIDOS = [
  "beer",
  "wine",
  "martini",
  "coffee",
  "droplets",
  "snowflake",
  "shopping-bag",
  "candy",
  "cigarette",
  "flame",
  "package",
  "utensils-crossed",
];

export function CategoriaForm({ modo, inicial }: Props) {
  const router = useRouter();
  const [salvando, startTransition] = useTransition();
  const [excluindo, setExcluindo] = useState(false);
  const [enviandoImg, setEnviandoImg] = useState(false);

  const [nome, setNome] = useState(inicial.nome);
  const [slug, setSlug] = useState(inicial.slug);
  const [slugManual, setSlugManual] = useState(modo === "editar");
  const [descricao, setDescricao] = useState(inicial.descricao ?? "");
  const [icone, setIcone] = useState(inicial.icone ?? "");
  const [imagemUrl, setImagemUrl] = useState(inicial.imagem_url ?? "");
  const [ordem, setOrdem] = useState(inicial.ordem ?? 0);
  const [publicada, setPublicada] = useState(inicial.publicada ?? true);

  const onChangeNome = (v: string) => {
    setNome(v);
    if (!slugManual) setSlug(slugify(v));
  };

  const fazerUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem máxima de 5 MB");
      return;
    }
    setEnviandoImg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("slug", slug || "categoria");
      const r = await uploadImagemCategoria(fd);
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
    const input: CategoriaInput = {
      nome,
      slug: slug || slugify(nome),
      descricao: descricao || undefined,
      icone: icone || undefined,
      imagem_url: imagemUrl || null,
      ordem,
      publicada,
    };
    startTransition(async () => {
      const r =
        modo === "editar" && inicial.id
          ? await atualizarCategoria(inicial.id, input)
          : await criarCategoria(input);
      if (!r.ok) {
        toast.error(r.erro);
        return;
      }
      toast.success(modo === "editar" ? "Categoria salva!" : "Categoria criada!");
      if (modo === "novo" && "id" in r) {
        router.push(`/admin/categorias/${r.id}`);
      } else {
        router.refresh();
      }
    });
  };

  const excluir = async () => {
    if (!inicial.id) return;
    if (!confirm(`Excluir a categoria "${nome}"? Esta ação não pode ser desfeita.`)) return;
    setExcluindo(true);
    const r = await excluirCategoria(inicial.id);
    setExcluindo(false);
    if (!r.ok) {
      toast.error(r.erro);
      return;
    }
    toast.success("Categoria excluída");
    router.push("/admin/categorias");
  };

  return (
    <div className="grid sm:grid-cols-3 gap-5">
      <div className="sm:col-span-2 space-y-4">
        <Card titulo="Informações">
          <Field label="Nome *">
            <input
              type="text"
              value={nome}
              onChange={(e) => onChangeNome(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              placeholder="Cervejas"
            />
          </Field>
          <Field label="Slug (URL)" hint={`Aparece em /produtos?category=${slug || "exemplo"}`}>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugManual(true);
              }}
              className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              placeholder="cervejas"
            />
          </Field>
          <Field label="Descrição (opcional)">
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </Field>
        </Card>

        <Card titulo="Ícone (Lucide)" subtitulo="Usado quando não há imagem">
          <Field label="">
            <input
              type="text"
              value={icone}
              onChange={(e) => setIcone(e.target.value.toLowerCase())}
              className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
              placeholder="beer"
            />
          </Field>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ICONES_SUGERIDOS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcone(i)}
                className={`text-xs font-mono px-2 py-1 rounded ${
                  icone === i ? "bg-brand-yellow text-brand-dark font-bold" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {i}
              </button>
            ))}
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
            <Upload className="w-3.5 h-3.5" /> Trocar imagem
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
        </Card>

        <Card titulo="Configurações">
          <Field label="Ordem">
            <input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(Number(e.target.value) || 0)}
              className="w-full h-11 px-3 rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-yellow"
            />
          </Field>
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={publicada}
              onChange={(e) => setPublicada(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">Visível no site</span>
          </label>
        </Card>

        <button
          type="button"
          onClick={salvar}
          disabled={salvando}
          className="w-full h-12 rounded-xl font-extrabold text-sm bg-brand-yellow text-brand-dark active:scale-[0.98] inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {modo === "editar" ? "Salvar alterações" : "Criar categoria"}
        </button>

        {modo === "editar" && (
          <button
            type="button"
            onClick={excluir}
            disabled={excluindo}
            className="w-full h-11 rounded-xl text-xs font-bold text-red-600 border border-red-100 hover:bg-red-50 inline-flex items-center justify-center gap-2"
          >
            {excluindo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Excluir categoria
          </button>
        )}
      </div>
    </div>
  );
}

function Card({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2.5">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">{titulo}</h3>
        {subtitulo && <p className="text-[11px] text-gray-400">{subtitulo}</p>}
      </div>
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
