-- =====================================================================
-- Zé Chegou 24h — Migration 0001 (initial)
-- Cole TUDO no Supabase Dashboard → SQL Editor → New query → Run.
-- =====================================================================

-- ============== EXTENSIONS ==============
create extension if not exists "uuid-ossp";

-- ============== ENUMS ==============
do $$
begin
  if not exists (select 1 from pg_type where typname = 'pedido_status') then
    create type pedido_status as enum (
      'aguardando_pagamento',
      'pago',
      'em_separacao',
      'em_entrega',
      'concluido',
      'cancelado'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'forma_pagamento') then
    create type forma_pagamento as enum ('pix', 'card', 'cash');
  end if;
end $$;

-- ============== TABELA: pedidos ==============
create table if not exists public.pedidos (
  id uuid primary key default uuid_generate_v4(),
  numero text not null unique,
  status pedido_status not null default 'aguardando_pagamento',
  forma_pagamento forma_pagamento not null default 'pix',

  -- cliente
  cliente_nome text not null,
  cliente_telefone text not null,
  cliente_cpf text,

  -- endereco (jsonb pra flexibilidade)
  endereco jsonb not null,

  -- valores
  subtotal numeric(10, 2) not null default 0,
  taxa_entrega numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,

  observacoes text,

  -- gateway de pagamento
  gateway_id text,
  gateway_status text,
  paid_at timestamptz,

  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_pedidos_status on public.pedidos (status);
create index if not exists idx_pedidos_criado_em on public.pedidos (criado_em desc);
create index if not exists idx_pedidos_telefone on public.pedidos (cliente_telefone);

-- ============== TABELA: itens_pedido ==============
create table if not exists public.itens_pedido (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  produto_id text not null,
  produto_slug text not null,
  produto_nome text not null,
  quantidade integer not null check (quantidade > 0),
  preco_unitario numeric(10, 2) not null,
  imagem text,
  criado_em timestamptz not null default now()
);

create index if not exists idx_itens_pedido_pedido_id on public.itens_pedido (pedido_id);

-- ============== TABELA: eventos_pedido (auditoria) ==============
create table if not exists public.eventos_pedido (
  id uuid primary key default uuid_generate_v4(),
  pedido_id uuid not null references public.pedidos(id) on delete cascade,
  tipo text not null,         -- 'criado', 'pago', 'em_entrega', 'concluido', 'cancelado', 'observacao'
  dados jsonb,
  criado_em timestamptz not null default now()
);

create index if not exists idx_eventos_pedido_id on public.eventos_pedido (pedido_id, criado_em desc);

-- ============== TABELA: app_admins (lista de admins liberados) ==============
create table if not exists public.app_admins (
  email text primary key,
  nome text,
  criado_em timestamptz not null default now()
);

-- ============== FUNCAO: trigger atualizado_em ==============
create or replace function public.set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_pedidos_atualizado_em on public.pedidos;
create trigger trg_pedidos_atualizado_em
before update on public.pedidos
for each row execute function public.set_atualizado_em();

-- ============== FUNCAO: registrar evento ao mudar status ==============
create or replace function public.registrar_evento_pedido()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.eventos_pedido (pedido_id, tipo, dados)
    values (new.id, 'criado', jsonb_build_object('status', new.status));
    return new;
  end if;

  if (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into public.eventos_pedido (pedido_id, tipo, dados)
    values (new.id, new.status::text, jsonb_build_object(
      'de', old.status,
      'para', new.status
    ));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pedidos_evento_status on public.pedidos;
create trigger trg_pedidos_evento_status
after insert or update on public.pedidos
for each row execute function public.registrar_evento_pedido();

-- ============== FUNCAO: e_admin? ==============
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.app_admins a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = auth.uid()
  );
$$;

-- ============== ROW LEVEL SECURITY ==============
alter table public.pedidos enable row level security;
alter table public.itens_pedido enable row level security;
alter table public.eventos_pedido enable row level security;
alter table public.app_admins enable row level security;

-- pedidos: anon pode INSERT (criar pedido), apenas admin pode SELECT/UPDATE
drop policy if exists "anon insere pedidos" on public.pedidos;
create policy "anon insere pedidos"
  on public.pedidos for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin le pedidos" on public.pedidos;
create policy "admin le pedidos"
  on public.pedidos for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin atualiza pedidos" on public.pedidos;
create policy "admin atualiza pedidos"
  on public.pedidos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- itens_pedido: anon insere (junto com pedido), admin le tudo
drop policy if exists "anon insere itens" on public.itens_pedido;
create policy "anon insere itens"
  on public.itens_pedido for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin le itens" on public.itens_pedido;
create policy "admin le itens"
  on public.itens_pedido for select
  to authenticated
  using (public.is_admin());

-- eventos_pedido: apenas admin
drop policy if exists "admin le eventos" on public.eventos_pedido;
create policy "admin le eventos"
  on public.eventos_pedido for select
  to authenticated
  using (public.is_admin());

-- app_admins: apenas o proprio admin pode ver
drop policy if exists "admin le admins" on public.app_admins;
create policy "admin le admins"
  on public.app_admins for select
  to authenticated
  using (public.is_admin());

-- =====================================================================
-- DEPOIS DE RODAR ESSE SQL:
-- 1) Vai em Authentication → Users → Add user → Send invite
--    Coloca seu email. Voce vai receber um link de magic link.
-- 2) Volta no SQL Editor e roda:
--      insert into app_admins (email, nome) values ('SEU@EMAIL.COM', 'Seu Nome');
--    (Substitui SEU@EMAIL.COM pelo email que voce convidou)
-- 3) Acessa /admin/login no site, entra com magic link.
-- =====================================================================
