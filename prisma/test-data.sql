-- =====================================================
-- 1. VER USUÁRIOS EXISTENTES
-- =====================================================
SELECT id, name, email, role FROM users;

-- =====================================================
-- 2. CRIAR PRODUTOS DE TESTE
-- =====================================================

INSERT INTO products (id, name, description, retail_price, wholesale_price, quantity, weight, status, category, sku, active, created_at, updated_at)
VALUES 
  (
    'prod-hulk-test',
    'MEIA DO HULK TESTE',
    'Meia temática do Hulk',
    5.00,
    3.50,
    100,
    0.080,
    'ACTIVE',
    'MENS_SOCKS',
    'HULK-TEST',
    true,
    NOW(),
    NOW()
  ),
  (
    'prod-social-test',
    'Meia Social Preta Teste',
    'Meia social masculina',
    12.90,
    8.50,
    200,
    0.060,
    'ACTIVE',
    'DRESS_SOCKS',
    'SOCIAL-TEST',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Imagens
INSERT INTO product_images (id, url, alt, "order", "primary", product_id, created_at)
VALUES 
  ('img-hulk-test', '/placeholder-product.png', 'Hulk', 0, true, 'prod-hulk-test', NOW()),
  ('img-social-test', '/placeholder-product.png', 'Social', 0, true, 'prod-social-test', NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. CRIAR VENDAS (usa seu usuário existente)
-- =====================================================

-- VENDA PAGA - PRONTA PARA CRIAR ENVIO ⭐
INSERT INTO sales (
  id,
  sale_number, 
  status, 
  subtotal, 
  discount, 
  total, 
  payment_method, 
  notes,
  shipping_zip_code,
  shipping_street,
  shipping_number,
  shipping_complement,
  shipping_neighborhood,
  shipping_city,
  shipping_state,
  shipping_country,
  user_id, 
  created_at, 
  updated_at
)
SELECT
  gen_random_uuid(),
  '20251005-TESTPAGO',
  'PAID',
  25.80,
  0,
  25.80,
  'CREDIT_CARD',
  '🎯 VENDA PAGA - PRONTA PARA CRIAR ENVIO!',
  '06381470',
  'Rua Avelino Antônio da Silva',
  '219',
  'CASA 2',
  'Vila Silviânia',
  'Carapicuíba',
  'SP',
  'Brasil',
  id,
  NOW() - INTERVAL '1 day',
  NOW()
FROM users 
WHERE role = 'USER'
LIMIT 1
ON CONFLICT (sale_number) DO NOTHING;

-- VENDA PENDENTE
INSERT INTO sales (
  id,
  sale_number, 
  status, 
  subtotal, 
  discount, 
  total, 
  payment_method, 
  notes,
  shipping_zip_code,
  shipping_street,
  shipping_number,
  shipping_complement,
  shipping_neighborhood,
  shipping_city,
  shipping_state,
  shipping_country,
  user_id, 
  created_at, 
  updated_at
)
SELECT
  gen_random_uuid(),
  '20251005-TESTPEND',
  'PENDING',
  5.00,
  0,
  5.00,
  'PIX',
  'Venda pendente - aguardando pagamento',
  '06381470',
  'Rua Avelino Antônio da Silva',
  '219',
  NULL,
  'Vila Silviânia',
  'Carapicuíba',
  'SP',
  'Brasil',
  id,
  NOW(),
  NOW()
FROM users 
WHERE role = 'USER'
LIMIT 1
ON CONFLICT (sale_number) DO NOTHING;

-- =====================================================
-- 4. CRIAR ITENS DAS VENDAS
-- =====================================================

-- Itens da venda PAGA
INSERT INTO sale_items (quantity, unit_price, subtotal, discount, total, sale_type, sale_id, product_id, created_at)
SELECT 
  2,
  12.90,
  25.80,
  0,
  25.80,
  'RETAIL',
  s.id,
  'prod-social-test'::uuid,
  NOW()
FROM sales s
WHERE s.sale_number = '20251005-TESTPAGO'
  AND EXISTS (SELECT 1 FROM products WHERE id = 'prod-social-test'::uuid);

-- Itens da venda PENDENTE  
INSERT INTO sale_items (quantity, unit_price, subtotal, discount, total, sale_type, sale_id, product_id, created_at)
SELECT 
  1,
  5.00,
  5.00,
  0,
  5.00,
  'RETAIL',
  s.id,
  'prod-hulk-test'::uuid,
  NOW()
FROM sales s
WHERE s.sale_number = '20251005-TESTPEND'
  AND EXISTS (SELECT 1 FROM products WHERE id = 'prod-hulk-test'::uuid);

-- =====================================================
-- 5. VERIFICAR RESULTADOS
-- =====================================================

-- Ver vendas criadas
SELECT 
  s.sale_number as "📋 Número",
  u.name as "👤 Cliente",
  s.status as "Status",
  s.total as "💰 Total",
  CONCAT(s.shipping_city, '/', s.shipping_state) as "📍 Cidade",
  s.shipping_zip_code as "CEP",
  CASE 
    WHEN s.melhor_envio_order_id IS NOT NULL THEN '✅'
    WHEN s.shipping_zip_code IS NOT NULL THEN '📦'
    ELSE '❌'
  END as "Envio",
  TO_CHAR(s.created_at, 'DD/MM HH24:MI') as "🕐 Data"
FROM sales s
JOIN users u ON s.user_id = u.id
WHERE s.sale_number LIKE '20251005%'
ORDER BY s.created_at DESC;

-- Contar tudo
SELECT 
  'Vendas Teste Criadas' as info, 
  COUNT(*) as total 
FROM sales 
WHERE sale_number LIKE '20251005%';

