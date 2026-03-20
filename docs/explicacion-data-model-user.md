# ¿Qué hemos construido? — Change `data-model-user` explicado para un junior

> Este documento explica, paso a paso y en lenguaje sencillo, todo lo que se implementó en el primer cambio del proyecto: el **modelo de datos de usuario**.

---

## El contexto: ¿qué problema resolvíamos?

La aplicación necesita saber quién es la persona que la usa. Para eso hay que guardar esa información en algún sitio: una base de datos. Este cambio define exactamente **qué datos guardamos de cada usuario y cómo los guardamos**.

---

## Las 4 cosas que hicimos

### 1. Definimos los roles de usuario

Antes de nada, decidimos que solo hay **dos tipos de usuario** en el sistema:

- **`tourist`** — el visitante normal que reserva tours.
- **`admin`** — el empleado de Ambroven-Hervas que gestiona la plataforma.

Eso lo escribimos en un fichero `enums.ts` tanto en el backend como en el frontend:

```typescript
// backend/src/entities/enums.ts
export enum UserRole {
  TOURIST = 'tourist',
  ADMIN  = 'admin',
}
```

Un `enum` es simplemente una lista de valores permitidos con nombre. Usar un enum evita errores de tipeo: si alguien escribe `'tourits'` en vez de `'tourist'`, TypeScript se lo impedirá en tiempo de compilación.

---

### 2. Creamos la entidad `User` (TypeORM)

Una **entidad** en TypeORM es una clase de TypeScript que TypeORM traduce a una tabla SQL. Es decir, cada propiedad de la clase se convierte en una columna de la tabla.

Así quedó la clase:

```typescript
// backend/src/entities/User.ts
@Entity('users')            // → crea la tabla "users" en PostgreSQL
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;               // clave primaria, UUID automático

  @Index({ unique: true })
  @Column()
  email: string;            // único, no pueden existir dos iguales

  @Column({ nullable: true })
  password_hash: string | null;  // puede ser null si el usuario entra con Google

  @Column()
  name: string;

  @Column({ enum: UserRole, default: UserRole.TOURIST })
  role: UserRole;           // por defecto, todo el mundo es turista

  @Index({ unique: true })
  @Column({ nullable: true })
  firebase_uid: string | null;   // ID de Google/Firebase, puede ser null

  @Column({ nullable: true })
  avatar_url: string | null;

  @Column({ default: 'es' })
  preferred_language: string;   // idioma preferido ('es', 'en', 'fr', 'pt')

  @CreateDateColumn()
  created_at: Date;         // TypeORM lo rellena solo al crear

  @UpdateDateColumn()
  updated_at: Date;         // TypeORM lo actualiza solo al modificar
}
```

Puntos clave para entender:

- **`nullable: true`** significa que ese campo puede estar vacío en la base de datos. Por ejemplo, si un usuario se registra por email+contraseña, el campo `firebase_uid` estará vacío.
- **`@Index({ unique: true })`** crea un índice en la base de datos que garantiza que no haya dos filas con el mismo valor. Si intentas insertar un usuario con un email que ya existe, PostgreSQL lanzará un error.
- **`password_hash`** nunca guarda la contraseña en texto plano, solo el hash (resultado de pasarla por una función de encriptación como bcrypt). Así, si alguien roba la base de datos, no puede ver las contraseñas.

---

### 3. Conectamos TypeORM con PostgreSQL (DataSource)

TypeORM necesita saber a qué base de datos conectarse. Eso se configura en `data-source.ts`:

```typescript
// backend/src/data-source.ts
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: 5432,
  database: 'ambroven_dev',
  username: 'ambroven',
  password: process.env.DATABASE_PASSWORD,
  synchronize: false,   // ← IMPORTANTE: ver explicación abajo
  entities: [User],
  migrations: ['src/migrations/*.ts'],
});
```

**¿Por qué `synchronize: false`?**
TypeORM tiene un modo `synchronize: true` que modifica la base de datos automáticamente cada vez que arranca la app. Eso suena cómodo, pero en producción es **muy peligroso**: si borras una propiedad de tu entidad, TypeORM borra esa columna (y todos sus datos) sin preguntar. Usando `synchronize: false` y migraciones, tú controlas exactamente cuándo y cómo cambia la base de datos.

---

### 4. Generamos y ejecutamos una migración

Una **migración** es un script SQL versionado que TypeORM genera automáticamente comparando tu entidad con el estado actual de la base de datos. Es la forma correcta de hacer cambios en la BD sin perder datos.

**Paso 1 — Generar:**
```bash
npm run migration:generate -- src/migrations/CreateUserTable
```
TypeORM comparó la entidad `User` con la BD (que estaba vacía) y generó este SQL:

```sql
CREATE TYPE "users_role_enum" AS ENUM('tourist', 'admin');

CREATE TABLE "users" (
  "id"                 uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "email"              varchar(255) NOT NULL,
  "password_hash"      varchar,
  "name"               varchar(100) NOT NULL,
  "role"               "users_role_enum" NOT NULL DEFAULT 'tourist',
  "firebase_uid"       varchar(128),
  "avatar_url"         varchar(500),
  "preferred_language" varchar(5) NOT NULL DEFAULT 'es',
  "created_at"         TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at"         TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX ON "users"("email");
CREATE UNIQUE INDEX ON "users"("firebase_uid");
```

**Paso 2 — Ejecutar:**
```bash
npm run migration:run
```
TypeORM ejecutó el SQL contra la base de datos local (`ambroven_dev`). La tabla `users` ya existe en PostgreSQL.

---

### 5. Creamos los tipos en el frontend

El frontend (Angular) también necesita saber la forma del objeto `User`. Para no duplicar lógica, creamos una **interfaz TypeScript** que espeja la entidad del backend (sin `password_hash`, porque el frontend nunca debería ver eso):

```typescript
// frontend/src/app/core/models/user.model.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  firebase_uid: string | null;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}
```

Tener este tipo en el frontend permite que TypeScript avise si, por ejemplo, intentas acceder a `user.apellidos` siendo que ese campo no existe.

---

### 6. Creamos el DTO de actualización de perfil

Un **DTO** (Data Transfer Object) es un objeto que define qué campos acepta un endpoint concreto. En este caso, el endpoint `PATCH /api/v1/users/me` permite que el usuario actualice su perfil.

```typescript
// backend/src/dtos/update-profile.dto.ts
export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(100)
  name?: string;

  @IsOptional() @IsUrl() @MaxLength(500)
  avatar_url?: string;

  @IsOptional() @IsEnum(AllowedLanguage)
  preferred_language?: AllowedLanguage;    // solo 'es', 'en', 'fr' o 'pt'

  // email no está aquí — no se puede cambiar por este endpoint
}
```

**¿Por qué no incluimos `email`?** Cambiar el email es una operación delicada: hay que verificar que el nuevo email es real (enviar un correo de confirmación), comprobar que no está ya en uso, etc. Eso se hará en un endpoint específico más adelante. Excluirlo del DTO hace que sea **imposible** cambiarlo por accidente desde este endpoint.

La librería `class-validator` lee esos decoradores (`@IsString`, `@IsUrl`, etc.) y valida los datos de entrada automáticamente. Si alguien manda `preferred_language: 'aaa'`, el middleware de validación rechaza la petición con un error 400 antes de que llegue al controlador.

---

## Resumen de archivos creados

| Archivo | Para qué sirve |
|---|---|
| `backend/src/entities/enums.ts` | Define los roles del sistema (`tourist`, `admin`) |
| `backend/src/entities/User.ts` | Define la tabla `users` en PostgreSQL via TypeORM |
| `backend/src/data-source.ts` | Configura la conexión de TypeORM a PostgreSQL |
| `backend/src/migrations/1774004473168-CreateUserTable.ts` | Script SQL versionado que creó la tabla `users` |
| `backend/src/dtos/update-profile.dto.ts` | Valida los datos del endpoint `PATCH /users/me` |
| `frontend/src/app/core/models/user.model.ts` | Interfaz TypeScript del usuario para el frontend |
| `frontend/src/app/core/models/enums.ts` | Copia del enum de roles para el frontend |

---

## ¿Qué viene después?

Lo siguiente es definir el modelo de datos de los **tours** (`data-model-tour`): qué información guardamos de cada tour, sus fotos, precio, idioma, etc. El proceso será el mismo: entidad → migración → tipos frontend.
