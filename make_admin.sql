-- Substitua o e-mail pelo do usuário que você deseja promover
UPDATE public.users 
SET roles = 'admin' 
WHERE email = 'oss@servicos.com';
