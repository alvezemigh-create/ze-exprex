-- =====================================================================
-- Zé Chegou 24h — Migration 0005 (Métodos de pagamento ativos)
-- Adiciona toggles individuais de cada metodo (PIX, cartão, dinheiro).
-- Permite ao admin habilitar/desabilitar cada um. Quando desabilitado,
-- o cliente ve "Desabilitado pelo fornecedor" na tela de pagamento.
-- =====================================================================

insert into public.app_config (chave, valor)
values
  ('metodo_pix_ativo', 'true'::jsonb),
  ('metodo_cartao_ativo', 'false'::jsonb),
  ('metodo_dinheiro_ativo', 'false'::jsonb)
on conflict (chave) do nothing;

-- =====================================================================
-- FIM
-- =====================================================================
