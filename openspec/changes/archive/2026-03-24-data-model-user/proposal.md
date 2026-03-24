## Why

La plataforma necesita un modelo de usuario que soporte tanto registro tradicional (email/contraseña) como OAuth con Google. Sin esta entidad no hay autenticación, roles ni control de acceso para ningún otro módulo del sistema.

## What Changes

- Nueva entidad `User` en PostgreSQL con soporte dual: credenciales locales y Firebase OAuth
- Campo `firebase_uid` para vincular cuentas OAuth sin contraseña local
- Sistema de roles (`tourist`, `admin`) como base del RBAC de toda la plataforma
- Soporte para idioma preferido del usuario (`preferred_language`) utilizado en notificaciones y UI

## Capabilities

### New Capabilities

- `user-registration`: Registro de nuevos usuarios vía email/contraseña o Google OAuth, con unicidad de email garantizada
- `user-roles`: Asignación y validación de roles (tourist / admin) para control de acceso en toda la API
- `user-profile`: Lectura y actualización del perfil del usuario autenticado (nombre, avatar, idioma preferido)

### Modified Capabilities

<!-- Sin cambios en capabilities existentes — este es el primer change del modelo de datos -->

## Impact

- **Base de datos**: nueva tabla `users` con índices en `email` y `firebase_uid`
- **Backend**: entidad TypeORM `User`, migración inicial, repositorio de usuario
- **Auth**: todos los endpoints de autenticación dependen de esta entidad
- **Otros changes**: Changes 2–5 referencian `User` como FK; Change 17 (`backend-auth`) implementa los endpoints sobre este modelo
