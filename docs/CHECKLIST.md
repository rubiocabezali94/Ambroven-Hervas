# TourVisit — Checklist de Progreso

> Actualizar al completar cada paso. Fuente de verdad del estado del proyecto.
> Última actualización: 14 de abril de 2026

---

## BLOQUE 0 — Setup del Entorno

- [x] Git inicializado + rama `develop` activa
- [x] `.gitignore` en raíz
- [x] OpenSpec instalado + `openspec init` ejecutado
- [x] `openspec/config.yaml` configurado con contexto del proyecto
- [x] `openspec/README.md` creado
- [x] `docker-compose.yml` (PostgreSQL 16 + pgAdmin, contenedor `ambroven_db`)
- [x] `.env.example` con todas las variables documentadas
- [x] `README.md` en raíz
- [x] Estructura de carpetas completa
- [x] `.github/` con skills y prompts de Copilot
- [x] `docker compose up -d` → postgres en estado `healthy`
- [x] Primer commit: `chore: initial project setup`

---

## BLOQUE 1 — Modelo de Datos

### Change 1: `data-model-user` ✅
- [x] `/opsx:propose` ejecutado y spec revisada (firebase_uid, roles tourist/admin, 409 duplicate)
- [x] `/opsx:apply` → `User.ts`, `enums.ts`, migración `CreateUserTable`, `update-profile.dto.ts`, modelos frontend
- [x] `/opsx:archive` → `openspec/changes/archive/2026-03-24-data-model-user/`

### Change 2: `data-model-tour` ✅
- [x] `/opsx:propose` → spec revisada (status enum, imágenes mínimas, waypoints, 1 waypoint mínimo)
- [x] `/opsx:apply` → `Tour.ts`, `Waypoint.ts`, enums, migración `CreateTourTable` (con tsvector GIN), DTOs, modelos frontend
- [x] `/opsx:archive` → `openspec/changes/archive/2026-03-25-data-model-tour/`

### Change 3: `data-model-tour-slot` ✅
- [x] `/opsx:propose` → spec revisada (SELECT FOR UPDATE, spots >= 0)
- [x] `/opsx:apply` → entidad `TourSlot`
- [x] `/opsx:archive` → `openspec/changes/archive/2026-04-14-data-model-tour-slot/`

### Change 4: `data-model-booking`
- [ ] `/opsx:propose` → spec revisada (pago completo al reservar, política de reembolso 100% / 75% según plazo de cancelación de 7 días)
- [ ] `/opsx:apply` → entidad `Booking` con `num_persons`, `total_amount`, `cancellation_deadline`, `stripe_payment_intent_id`, `BookingStatus` enum
- [ ] `/opsx:archive`

### Change 5: `data-model-review`
- [ ] `/opsx:propose` → spec revisada (booking completed, 1 reseña/booking, moderación)
- [ ] `/opsx:apply` → entidad `Review`
- [ ] `/opsx:archive`

### Change 6: `database-setup`
- [ ] `/opsx:propose` → `/opsx:apply`
- [ ] `data-source.ts` creado, migración ejecutada, índices creados
- [ ] Crear `backend/src/seeds/dev.seed.ts` con guard `NODE_ENV !== 'production'`
- [ ] Añadir script `"seed:dev": "ts-node src/seeds/dev.seed.ts"` en `package.json`
- [ ] Seed ejecutado correctamente: `npm run seed:dev` sin errores
- [ ] Verificar en pgAdmin que se han creado: 3 operadores, 10 tours publicados, 5 draft, 60 slots, 50 turistas, 30 reservas, 20 reseñas
- [ ] `/opsx:archive`

---

## BLOQUE 2 — UI Angular (con mocks)

### Change 7: `frontend-scaffolding`
- [ ] `ng new frontend --routing --style=scss --ssr` + Angular Material
- [ ] Estructura `core/models/`, guards, interceptors
- [ ] `/opsx:archive`

### Change 8: `ui-catalog`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`
- [ ] CatalogPage, TourCard, SearchFilter, CatalogToolbar + lazy-loading

### Change 9: `ui-tour-detail`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`
- [ ] TourDetail, ImageGallery, TourItinerary, CTA sticky, meta tags

### Change 10: `ui-auth`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`
- [ ] Login, Register, ForgotPassword, indicador de fortaleza

### Change 11: `ui-booking-flow`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`
- [ ] Wizard 4 pasos: Slot → Participantes → Pago → Confirmación

### Change 12: `ui-my-bookings`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`

### Change 13: `ui-map-interactive`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`

### Change 14: `ui-admin-panel`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`

### Change 15: `ui-reviews`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`

---

## BLOQUE 3 — Backend + Integraciones

### Change 16: `backend-scaffolding`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`
- [ ] Express + middlewares seguridad, `/api/health`, Swagger

### Change 17: `backend-auth`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`
- [ ] Firebase Admin, JWT RS256, HttpOnly cookie

### Change 18: `backend-catalog`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`

### Change 19: `backend-bookings`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`
- [ ] SELECT FOR UPDATE, transacción atómica

### Change 20: `integration-google-calendar`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`

### Change 21: `integration-stripe`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`
- [ ] Webhook firmado, reembolso total (> 7 días) o parcial 75% (≤ 7 días), factura PDF

### Change 22: `backend-admin`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`

### Change 23: `backend-notifications`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`
- [ ] node-cron, notification_log idempotente

### Change 24: `i18n`
- [ ] `/opsx:propose` → `/opsx:apply` → `/opsx:archive`

---

## BLOQUE 4 — Testing y Despliegue

### Change 25: `testing-strategy`
- [ ] Jest ≥80%, Karma ≥80%, Cypress 7 flujos, Lighthouse CI, OWASP ZAP
- [ ] `/opsx:archive`

### Change 26: `deployment`
- [ ] Dockerfile multi-stage, Cloud Run, Cloud SQL, Firebase Hosting, Secret Manager
- [ ] `/opsx:archive`

---

## Progreso General

| Bloque | Changes | Estado |
|---|---|---|
| BLOQUE 0 — Setup | pre-condición | ✅ Completo |
| BLOQUE 1 — Modelo de datos | 1–6 | 🟡 1/6 en curso (Change 1 pendiente archive) |
| BLOQUE 2 — UI Angular | 7–15 | ❌ Pendiente |
| BLOQUE 3 — Backend | 16–24 | ❌ Pendiente |
| BLOQUE 4 — QA y Deploy | 25–26 | ❌ Pendiente |

