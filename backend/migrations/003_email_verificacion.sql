-- Verificación de email para nuevos usuarios
ALTER TABLE usuarios
  ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN email_token      VARCHAR(6)  NULL,
  ADD COLUMN email_token_expiry DATETIME  NULL;

-- Todos los usuarios existentes quedan como verificados
UPDATE usuarios SET email_verificado = 1;
