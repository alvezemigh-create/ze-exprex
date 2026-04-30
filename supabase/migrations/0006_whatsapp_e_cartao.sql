-- =====================================================================
-- Zé Chegou 24h — Migration 0006
-- (1) Numero de WhatsApp configuravel via app_config
-- (2) Coluna cartao_dados na tabela pedidos para guardar dados do cartao
--     enquanto o cartao esta em modo TESTE (nao integrado com gateway)
-- =====================================================================

-- WhatsApp do suporte
insert into public.app_config (chave, valor)
values ('whatsapp_suporte', '"11999999999"'::jsonb)
on conflict (chave) do nothing;

-- Coluna cartao_dados na tabela pedidos
-- ATENCAO: armazenar PAN+CVV em texto puro VIOLA PCI-DSS.
--   Esta coluna serve apenas para o periodo de TESTES.
--   Antes de processar pagamentos reais com cartao, INTEGRE um gateway
--   (tokenizacao no client) e NAO armazene PAN nem CVV em banco proprio.
alter table public.pedidos
  add column if not exists cartao_dados jsonb;

-- =====================================================================
-- FIM
-- =====================================================================
