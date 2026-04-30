// Seed do catalogo no Supabase
// Le os JSONs locais e faz upsert nas tabelas categorias + produtos.
// Os IDs (uuid) sao gerados pelo banco; usamos o slug como chave de upsert.
//
// Uso:
//   node scripts/seed-supabase.mjs
//
// Requer .env.local com:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

async function carregarEnv() {
  try {
    const envPath = path.join(ROOT, ".env.local");
    const txt = await readFile(envPath, "utf8");
    for (const linha of txt.split(/\r?\n/)) {
      if (!linha || linha.trim().startsWith("#")) continue;
      const m = /^([A-Z0-9_]+)\s*=\s*"?([^"\r\n]+)"?\s*$/i.exec(linha);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

await carregarEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Faltam NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

console.log("Conectado em", SUPABASE_URL);

// ============================================================
// Carrega JSONs
// ============================================================

const categoriasJson = JSON.parse(
  await readFile(path.join(ROOT, "src/data/categorias.json"), "utf8"),
);
const catalogoJson = JSON.parse(
  await readFile(path.join(ROOT, "src/data/catalogo.json"), "utf8"),
);

console.log(`Lidos: ${categoriasJson.length} categorias, ${catalogoJson.length} produtos`);

// ============================================================
// Upsert de categorias
// ============================================================

const categoriasParaInserir = categoriasJson.map((c) => ({
  nome: c.name?.trim(),
  slug: c.slug,
  descricao: c.description || null,
  icone: c.icon || null,
  imagem_url: c.imageUrl || null,
  ordem: c.sortOrder ?? 0,
  publicada: true,
}));

console.log("\nInserindo categorias...");
const { data: catData, error: catErr } = await sb
  .from("categorias")
  .upsert(categoriasParaInserir, { onConflict: "slug" })
  .select("id, slug");

if (catErr) {
  console.error("Erro ao inserir categorias:", catErr);
  process.exit(1);
}

console.log(`OK: ${catData.length} categorias`);

// Mapa slug -> id (do banco)
const mapaCatSlugId = new Map(catData.map((c) => [c.slug, c.id]));

// Mapa antigo (id legado do JSON) -> slug -> id novo
const mapaCatLegadoNovo = new Map();
for (const c of categoriasJson) {
  const novoId = mapaCatSlugId.get(c.slug);
  if (novoId) mapaCatLegadoNovo.set(c.id, novoId);
}

// ============================================================
// Upsert de produtos (em batches de 100 pra nao estourar timeout)
// ============================================================

const produtosParaInserir = catalogoJson
  .map((p) => {
    const categoriaId = mapaCatLegadoNovo.get(p.categoryId);
    if (!categoriaId) {
      console.warn(`Produto ${p.slug} sem categoria valida (legado: ${p.categoryId}) — ignorado`);
      return null;
    }
    return {
      nome: p.name?.trim() || "",
      slug: p.slug,
      descricao: p.description || null,
      marca: p.brand || null,
      volume: p.volume || null,
      teor_alcoolico: p.alcoholContent || null,
      temperatura: p.temperature || null,
      preco: p.price ?? null,
      preco_promocional: p.promoPrice ?? null,
      imagem_url: p.imageUrl || null,
      em_estoque: p.inStock !== false,
      destaque: !!p.featured,
      mais_vendido: !!p.bestSeller,
      novo: !!p.isNew,
      ordem: p.sortOrder ?? 0,
      publicado: true,
      categoria_id: categoriaId,
    };
  })
  .filter(Boolean);

console.log(`\nInserindo ${produtosParaInserir.length} produtos em batches...`);

const TAM_BATCH = 200;
let totalInseridos = 0;

for (let i = 0; i < produtosParaInserir.length; i += TAM_BATCH) {
  const batch = produtosParaInserir.slice(i, i + TAM_BATCH);
  const { error } = await sb.from("produtos").upsert(batch, { onConflict: "slug" });
  if (error) {
    console.error(`Erro no batch ${i}:`, error);
    process.exit(1);
  }
  totalInseridos += batch.length;
  process.stdout.write(`\r  ${totalInseridos}/${produtosParaInserir.length}   `);
}

console.log("\nOK: catalogo migrado pro Supabase.");
console.log("\nResumo:");
console.log(`  ${catData.length} categorias`);
console.log(`  ${totalInseridos} produtos`);
