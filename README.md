# Ambroven Hervás — Plataforma de Visitas Turísticas

Aplicación web SPA para gestión y reserva de visitas turísticas. Conecta turistas con experiencias culturales y naturales locales, con catálogo de tours, sistema de reservas integrado con Google Calendar, pagos online y visualización de rutas en mapas.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | Angular 17+ (SSR) + Angular Material + SCSS |
| **Backend** | Node.js + Express + TypeScript + TypeORM |
| **Base de datos** | PostgreSQL 16 |
| **Auth** | Firebase Authentication (Google OAuth 2.0) + JWT |
| **Pagos** | Stripe (Elements, Apple Pay, Google Pay) |
| **Mapas** | Google Maps JavaScript API |
| **Calendario** | Google Calendar API v3 |
| **Email** | SendGrid Dynamic Templates |
| **Despliegue** | Firebase Hosting + Cloud Run + Cloud SQL (GCP) |
| **Metodología** | OpenSpec SDD — cada feature es un change atómico |

---

## Estructura del monorepo

```
Ambroven-Hervas/
  frontend/           → Angular SPA + SSR
  backend/            → Node.js + Express API REST
  docs/               → documentación del proyecto
  infra/              → Docker, CI/CD, configuración de despliegue
  openspec/           → specs de todos los changes (proposal + design + tasks)
    changes/          → changes en progreso
    changes/archive/  → changes completados
    specs/            → specs permanentes consolidadas
  docker-compose.yml  → PostgreSQL 16 + pgAdmin para desarrollo local
  .env.example        → todas las variables de entorno necesarias
```

---

## Arranque rápido

### Pre-requisitos
- Node.js v20.19.0+
- Docker Desktop
- Git

### Instalación

```bash
# 1. Clonar el repositorio
git clone <url>
cd Ambroven-Hervas

# 2. Copiar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Levantar base de datos
docker compose up -d

# 4. Backend
cd backend && npm install && npm run dev

# 5. Frontend
cd frontend && npm install && ng serve
```

---

## Servicios Docker

| Servicio | Puerto | Descripción |
|---|---|---|
| PostgreSQL 16 | `5432` | Base de datos principal (`ambroven_dev`) |
| pgAdmin 4 | `5050` | Interfaz web de administración de BD |

```bash
docker compose up -d      # levantar servicios
docker compose down       # detener servicios
docker compose logs -f    # ver logs en tiempo real
```

---

## Comandos del backend

```bash
cd backend

npm run dev               # servidor en modo desarrollo (hot-reload)
npm run build             # compilar TypeScript → dist/
npm run start             # ejecutar compilado

npm run migration:generate -- src/migrations/NombreMigracion  # generar migración
npm run migration:run     # aplicar migraciones pendientes
npm run migration:revert  # revertir última migración
```

---

## Flujo de trabajo

### GitFlow
- `main` — código en producción
- `develop` — rama de integración principal
- `feature/*` — nuevas funcionalidades
- `hotfix/*` — correcciones urgentes en producción

Formato de commits: `feat(catalog): add tour filter component`

### OpenSpec (Spec Driven Development)
Ninguna línea de código se escribe sin una spec previa. Cada feature sigue el ciclo:

```
/opsx:propose <nombre>   → genera proposal.md + specs/ + design.md + tasks.md
/opsx:apply              → el AI implementa siguiendo tasks.md paso a paso
/opsx:archive            → mueve el change completado a openspec/changes/archive/
```

---

## Estado del proyecto

Ver [`docs/CHECKLIST.md`](docs/CHECKLIST.md) para el seguimiento detallado de tareas.

| Bloque | Descripción | Estado |
|---|---|---|
| Bloque 0 | Setup del entorno | ✅ Completado |
| Change 1 | `data-model-user` | ✅ Completado (pendiente archive) |
| Change 2 | `data-model-tour` | 🔄 En progreso |
| Change 3–6 | Slots, Bookings, Reviews, DB Setup | ⏳ Pendiente |

---

## Documentación

- [`docs/AmbrovenHervas_Requerimientos.md`](docs/AmbrovenHervas_Requerimientos.md) — requerimientos funcionales y no funcionales
- [`docs/AmbrovenHervas_Plan_Desarrollo.md`](docs/AmbrovenHervas_Plan_Desarrollo.md) — plan de desarrollo detallado (26 changes, 20 semanas)
- [`docs/CHECKLIST.md`](docs/CHECKLIST.md) — fuente de verdad del progreso