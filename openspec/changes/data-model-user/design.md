## Context

Es el primer change del modelo de datos. Define la entidad central del sistema: `User`. Todas las demás entidades (Tour, Booking, Review) referencian User mediante FK. No existe código previo — partimos de cero con TypeORM sobre PostgreSQL 16.

La plataforma soporta dos métodos de autenticación:
1. **Email/contraseña local** — `password_hash` relleno, `firebase_uid` null
2. **Google OAuth via Firebase** — `firebase_uid` relleno, `password_hash` null

## Goals / Non-Goals

**Goals:**
- Definir el esquema de la tabla `users` en PostgreSQL con todos los campos necesarios
- Soportar ambos flujos de autenticación desde el modelo (sin lógica de auth, eso es Change 17)
- Establecer el enum de roles como contrato de RBAC para toda la API
- Crear la entidad TypeORM lista para que las migraciones la puedan generar

**Non-Goals:**
- Implementar endpoints de login/registro (Change 17)
- Lógica de JWT o Firebase Admin SDK (Change 17)
- Gestión de sesiones o refresh tokens (Change 17)

## Decisions

### UUID como PK en lugar de SERIAL
Todos los IDs son UUID v4 generados por PostgreSQL (`uuid_generate_v4()`). Razón: evita enumeración de recursos en la API (seguridad), facilita sharding futuro y es consistente con el resto de entidades.

Alternativa descartada: `SERIAL` — predecible y enumerable.

### `password_hash` y `firebase_uid` son ambos nullable
Un usuario OAuth no tiene contraseña local; un usuario local no tiene `firebase_uid`. En lugar de dos tablas separadas (herencia de tabla) se usa una tabla única con campos opcionales, más simple para consultas y joins.

Alternativa descartada: tabla `oauth_providers` separada — sobreingeniería para un solo proveedor OAuth (Google).

### `role` como ENUM de PostgreSQL
Usar `CHECK CONSTRAINT` o tabla de roles sería más flexible pero innecesario para 2 roles fijos. El ENUM es más eficiente, con validación en BD y legible en consultas.

### `preferred_language` como VARCHAR(5)
Acepta códigos BCP 47 (`es`, `en`, `fr`, `pt`). No se usa FK a tabla de idiomas para evitar complejidad innecesaria — los idiomas válidos se validan en el DTO de la capa de aplicación.

## Risks / Trade-offs

- **[Riesgo] Cambio de proveedor OAuth futuro** → El campo `firebase_uid` es específico de Firebase. Si se añade otro proveedor (GitHub, Apple), haría falta una tabla `oauth_providers`. Mitigación: aceptable para MVP; se añadiría en un change futuro.
- **[Riesgo] Migración de contraseñas** → Si un usuario OAuth quiere añadir contraseña local después, el flujo de actualización debe verificar que no ya existe una cuenta local con ese email. Mitigación: validación en servicio de auth (Change 17).
