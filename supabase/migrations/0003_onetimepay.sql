-- =====================================================================
-- Zé Chegou 24h — Migration 0003 (OneTimePay)
-- Adiciona campos do PIX e webhook + permite consulta pública pelo número
-- =====================================================================

-- ============== ALTERAR TABELA: pedidos ==============
alter table public.pedidos
  add column if not exists pix_qr_code text,
  add column if not exists pix_qr_image text,
  add column if not exists pix_expires_at timestamptz,
  add column if not exists order_url text,
  add column if not exists receipt_url text,
  add column if not exists webhook_payload jsonb;

-- gateway_id ja existia mas vamos garantir o tipo
-- gateway_status tambem (do migration 0001)

create index if not exists idx_pedidos_gateway_id on public.pedidos (gateway_id);

-- ============== TABELA: webhook_eventos (auditoria de webhooks recebidos) ==============
create table if not exists public.webhook_eventos (
  id uuid primary key default uuid_generate_v4(),
  fonte text not null default 'onetimepay',
  evento text not null,                 -- TRANSACTION_PAID, TRANSACTION_CANCELED, etc.
  identifier text,                       -- nosso identifier
  transaction_id text,                   -- id do gateway
  pedido_id uuid references public.pedidos(id) on delete set null,
  payload jsonb not null,
  processado boolean not null default false,
  erro text,
  criado_em timestamptz not null default now()
);

create index if not exists idx_webhook_eventos_pedido on public.webhook_eventos (pedido_id);
create index if not exists idx_webhook_eventos_transaction on public.webhook_eventos (transaction_id);
create index if not exists idx_webhook_eventos_criado on public.webhook_eventos (criado_em desc);

-- RLS — somente admin le. Webhook escreve via service role (bypassa RLS).
alter table public.webhook_eventos enable row level security;

drop policy if exists "admin le webhooks" on public.webhook_eventos;
create policy "admin le webhooks"
  on public.webhook_eventos for select
  to authenticated
  using (public.is_admin());

-- ============== POLICY EXTRA: anon le proprio pedido pelo numero ==============
-- Necessario pra tela /pedido/[numero] (cliente acompanha status do pix)
-- Sem isso, so o admin via service role conseguiria ler.
-- Aqui escolhi expor SELECT publico restrito por numero (string aleatoria).
-- A tela /pedido/[numero] no app usa service role (rota servidor),
-- entao na pratica nao precisamos relaxar a policy. Mantemos so admin.
-- (Se um dia a tela virar client-side, criar policy "anon le por numero" e expor minimo.)

-- =====================================================================
-- FIM
-- =====================================================================
