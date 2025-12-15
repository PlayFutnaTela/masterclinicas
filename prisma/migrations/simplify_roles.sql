-- Simplificar sistema de roles: mover role para tabela User e remover UserOrganization
-- ===== SIMPLIFICADO: Alterações para role global no usuário =====

-- 1. Remover enum antigo se existir
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- 2. Criar enum novo com os valores corretos
CREATE TYPE "UserRole" AS ENUM('super_admin', 'admin', 'operador');

-- 3. Adicionar coluna role na tabela users com o tipo correto
ALTER TABLE users ADD COLUMN role "UserRole" DEFAULT 'operador';

-- 4. Migrar roles existentes da tabela user_organizations para users
-- Para usuários que são admin em alguma organização, definir como admin
UPDATE users
SET role = 'admin'
WHERE id IN (
  SELECT DISTINCT "userId"
  FROM user_organizations
  WHERE role = 'admin'
);

-- Para usuários que são super admin (email específico), definir como super_admin
UPDATE users
SET role = 'super_admin'
WHERE email = 'admin@masterclínicas.com';

-- 5. Remover tabela user_organizations (não precisamos mais dela)
DROP TABLE user_organizations CASCADE;