// Gera mapas de imagens (slug -> caminho local) pra produtos e categorias.
// Roda uma vez via "npm run gerar-mapa-imagens" e tambem antes de cada build.
import { readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, parse, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = join(__dirname, "..");

function escanear(subdir) {
  const pasta = join(raiz, "public", subdir);
  if (!existsSync(pasta)) return {};
  const arquivos = readdirSync(pasta, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name);
  const mapa = {};
  for (const arq of arquivos) {
    const { name } = parse(arq);
    mapa[name] = `/${subdir}/${arq}`;
  }
  return mapa;
}

const produtos = escanear("products");
const categorias = escanear("categories");

const dirSaida = join(raiz, "src", "data");
mkdirSync(dirSaida, { recursive: true });
writeFileSync(join(dirSaida, "imagens-produtos.json"), JSON.stringify(produtos), "utf8");
writeFileSync(join(dirSaida, "imagens-categorias.json"), JSON.stringify(categorias), "utf8");

console.log(`OK: ${Object.keys(produtos).length} imagens de produto + ${Object.keys(categorias).length} de categoria`);
