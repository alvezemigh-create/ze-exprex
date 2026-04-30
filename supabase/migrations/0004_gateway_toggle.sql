-- =====================================================================
-- Zé Chegou 24h — Migration 0004 (Gateway toggle: OneTimePay <> MarchaBB)
-- Adiciona controle de gateway ativo + fonte do pedido
-- =====================================================================

-- ============== TABELA: app_config (configuracoes globais chave/valor) ==============
create table if not exists public.app_config (
  chave text primary key,
  valor jsonb not null,
  atualizado_em timestamptz not null default now(),
  atualizado_por text
);

drop trigger if exists trg_app_config_atualizado_em on public.app_config;
create trigger trg_app_config_atualizado_em
before update on public.app_config
for each row execute function public.set_atualizado_em();

alter table public.app_config enable row level security;

drop policy if exists "admin le config" on public.app_config;
create policy "admin le config"
  on public.app_config for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admin escreve config" on public.app_config;
create policy "admin escreve config"
  on public.app_config for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- valor inicial — mantemos onetimepay como default
insert into public.app_config (chave, valor)
values ('gateway_pagamento_ativo', '"onetimepay"'::jsonb)
on conflict (chave) do nothing;

-- ============== ALTERAR TABELA: pedidos ==============
-- Marca qual gateway processou cada pedido (pra webhook e status saberem qual API consultar)
alter table public.pedidos
  add column if not exists gateway_pagamento text not null default 'onetimepay';

create index if not exists idx_pedidos_gateway_pagamento on public.pedidos (gateway_pagamento);

-- =====================================================================
-- FIM
-- =====================================================================
