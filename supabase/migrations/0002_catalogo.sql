-- Catalogo de produtos e categorias gerenciaveis pelo painel admin

-- =============================================================
-- 1. TABELAS
-- =============================================================

create extension if not exists "uuid-ossp";

create table if not exists public.categorias (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  slug text not null unique,
  descricao text,
  icone text,                    -- nome do icone Lucide (ex: 'beer', 'droplets')
  imagem_url text,               -- caminho relativo ou URL absoluta
  ordem integer not null default 0,
  publicada boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists categorias_ordem_idx on public.categorias(ordem);
create index if not exists categorias_publicada_idx on public.categorias(publicada);

create table if not exists public.produtos (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  slug text not null unique,
  descricao text,
  marca text,
  volume text,
  teor_alcoolico text,
  temperatura text,
  preco numeric(10, 2),               -- preco oficial / de tabela
  preco_promocional numeric(10, 2),   -- desconto opcional (se < preco, vira destaque)
  imagem_url text,
  em_estoque boolean not null default true,
  destaque boolean not null default false,
  mais_vendido boolean not null default false,
  novo boolean not null default false,
  ordem integer not null default 0,
  publicado boolean not null default true,
  categoria_id uuid not null references public.categorias(id) on delete restrict,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists produtos_categoria_ordem_idx on public.produtos(categoria_id, ordem);
create index if not exists produtos_publicado_idx on public.produtos(publicado);
create index if not exists produtos_destaque_idx on public.produtos(destaque) where destaque = true;
create index if not exists produtos_mais_vendido_idx on public.produtos(mais_vendido) where mais_vendido = true;

-- Trigger pra atualizar atualizado_em em ambas as tabelas
drop trigger if exists set_atualizado_em_categorias on public.categorias;
create trigger set_atualizado_em_categorias
  before update on public.categorias
  for each row execute function public.set_atualizado_em();

drop trigger if exists set_atualizado_em_produtos on public.produtos;
create trigger set_atualizado_em_produtos
  before update on public.produtos
  for each row execute function public.set_atualizado_em();

-- =============================================================
-- 2. RLS
-- =============================================================

alter table public.categorias enable row level security;
alter table public.produtos enable row level security;

-- Qualquer um pode ler (catalogo é publico)
drop policy if exists "categorias_select_publico" on public.categorias;
create policy "categorias_select_publico" on public.categorias
  for select using (true);

drop policy if exists "produtos_select_publico" on public.produtos;
create policy "produtos_select_publico" on public.produtos
  for select using (true);

-- Apenas admin escreve (insert/update/delete)
drop policy if exists "categorias_admin_insert" on public.categorias;
create policy "categorias_admin_insert" on public.categorias
  for insert with check (public.is_admin());

drop policy if exists "categorias_admin_update" on public.categorias;
create policy "categorias_admin_update" on public.categorias
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categorias_admin_delete" on public.categorias;
create policy "categorias_admin_delete" on public.categorias
  for delete using (public.is_admin());

drop policy if exists "produtos_admin_insert" on public.produtos;
create policy "produtos_admin_insert" on public.produtos
  for insert with check (public.is_admin());

drop policy if exists "produtos_admin_update" on public.produtos;
create policy "produtos_admin_update" on public.produtos
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "produtos_admin_delete" on public.produtos;
create policy "produtos_admin_delete" on public.produtos
  for delete using (public.is_admin());

-- =============================================================
-- 3. STORAGE BUCKET (publico, leitura aberta, upload so admin)
-- =============================================================

-- Cria o bucket se ainda nao existir
insert into storage.buckets (id, name, public)
values ('catalogo', 'catalogo', true)
on conflict (id) do nothing;

-- Policies de storage
drop policy if exists "catalogo_select_publico" on storage.objects;
create policy "catalogo_select_publico" on storage.objects
  for select using (bucket_id = 'catalogo');

drop policy if exists "catalogo_admin_insert" on storage.objects;
create policy "catalogo_admin_insert" on storage.objects
  for insert with check (bucket_id = 'catalogo' and public.is_admin());

drop policy if exists "catalogo_admin_update" on storage.objects;
create policy "catalogo_admin_update" on storage.objects
  for update using (bucket_id = 'catalogo' and public.is_admin()) with check (bucket_id = 'catalogo' and public.is_admin());

drop policy if exists "catalogo_admin_delete" on storage.objects;
create policy "catalogo_admin_delete" on storage.objects
  for delete using (bucket_id = 'catalogo' and public.is_admin());
