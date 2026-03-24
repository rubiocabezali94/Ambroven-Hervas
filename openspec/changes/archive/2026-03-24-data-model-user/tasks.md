## 1. Entidad TypeORM

- [x] 1.1 Crear `backend/src/entities/User.ts` con todos los campos definidos en el plan (UUID PK, email, password_hash nullable, name, role ENUM, firebase_uid nullable, avatar_url, preferred_language, created_at, updated_at)
- [x] 1.2 Definir el ENUM `UserRole` con valores `tourist`, `admin` en `backend/src/entities/enums.ts`
- [x] 1.3 Añadir índices `UNIQUE` en `email` y `firebase_uid` usando `@Index({ unique: true })`
- [x] 1.4 Registrar la entidad `User` en `backend/src/data-source.ts`

**Verificación**: `npx typeorm entity:show User` muestra todos los campos sin errores de TypeScript.

## 2. Migración

- [x] 2.1 Generar la migración inicial: `npm run migration:generate -- src/migrations/CreateUserTable`
- [x] 2.2 Revisar el SQL generado: debe incluir `CREATE TYPE user_role_enum`, `CREATE TABLE users`, índices únicos en `email` y `firebase_uid`
- [x] 2.3 Ejecutar la migración contra la BD local: `npm run migration:run`

**Verificación**: La tabla `users` aparece en pgAdmin (`http://localhost:5050`) con todos los campos y constraints correctos.

## 3. Tipos TypeScript compartidos

- [x] 3.1 Crear `frontend/src/app/core/models/user.model.ts` con la interfaz `User` (espejo de la entidad, sin `password_hash`)
- [x] 3.2 Crear `frontend/src/app/core/models/enums.ts` con el enum `UserRole` para uso en el frontend

**Verificación**: El archivo compila sin errores con `ng build --no-optimization`.

## 4. Validación

- [x] 4.1 Crear `backend/src/dtos/update-profile.dto.ts` con `class-validator`: campos `name`, `avatar_url`, `preferred_language` (enum: `es`, `en`, `fr`, `pt`)
- [x] 4.2 Asegurar que `email` no es editable desde el DTO de actualización de perfil (no incluirlo)

**Verificación**: Un DTO con `preferred_language: 'zz'` falla la validación de `class-validator`.
