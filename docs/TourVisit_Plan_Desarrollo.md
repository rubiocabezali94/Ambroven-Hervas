# TourVisit — Plan de Desarrollo Detallado

**Versión:** 1.0 | **Fecha:** 20 de marzo de 2026 | **Metodología:** OpenSpec (Spec Driven Development)

---

## Resumen Ejecutivo

Plataforma web de gestión y reserva de visitas turísticas desarrollada con:

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

**Duración estimada:** 20 semanas | **Total de changes OpenSpec:** 26

---

## Flujo de Trabajo OpenSpec

Cada módulo o feature sigue este ciclo obligatorio:

```
/opsx:propose <nombre-del-change>
  ├── proposal.md   → qué construimos y por qué
  ├── specs/        → requisitos SHALL + escenarios GIVEN/WHEN/THEN
  ├── design.md     → enfoque técnico y decisiones de arquitectura
  └── tasks.md      → checklist de implementación numerado

/opsx:apply         → el AI implementa siguiendo tasks.md paso a paso
/opsx:archive       → mueve el change a openspec/changes/archive/
```

**Ninguna línea de código se escribe sin una spec previa.**
Cada spec delta queda versionado en Git, permitiendo revisar la evolución de requisitos.

---

## BLOQUE 0 — Setup OpenSpec y Entorno Base

**Semana 1 | Sin change number — es pre-condición**

### 0.1 — Instalar OpenSpec

```bash
npm install -g @fission-ai/openspec@latest
cd /Users/javierrubiocabezali/Workplace/Ambroven-Hervas
openspec init
```

Genera la carpeta `openspec/` con instrucciones para GitHub Copilot y slash commands activos.
Permite usar `/opsx:propose`, `/opsx:apply`, `/opsx:archive` directamente en el editor.

### 0.2 — Repositorio y estructura monorepo

```
Ambroven-Hervas/
  frontend/           → Angular SPA + SSR
  backend/            → Node.js + Express API REST
  docs/               → documentación del proyecto (aquí estás)
  infra/              → Docker, CI/CD, configuración de despliegue
  openspec/           → specs de todos los changes
    changes/
      <change-name>/
        proposal.md
        specs/
        design.md
        tasks.md
      archive/        → changes completados
    specs/            → specs permanentes consolidadas
  docker-compose.yml  → PostgreSQL + pgAdmin para desarrollo local
  .env.example        → todas las variables de entorno necesarias
  README.md           → instrucciones de arranque
```

**Git:**
- GitFlow: ramas `main`, `develop`, `feature/*`, `hotfix/*`
- Commits convencionales: `feat(catalog): add tour filter component`

### 0.3 — Docker y entorno local

```yaml
# docker-compose.yml (fragmento)
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: tourvisit_dev
      POSTGRES_USER: tourvisit
      POSTGRES_PASSWORD: (en .env)
  pgadmin:
    image: dpage/pgadmin4
    ports: ["5050:80"]
```

### 0.4 — CI/CD con GitHub Actions

- `ci.yml`: lint + tests en cada PR hacia `develop`
- `deploy.yml`: build + deploy a Firebase Hosting en merge a `main`
- Lighthouse CI en cada PR (target: > 85 Performance/Accessibility/SEO)

---

## BLOQUE 1 — Modelo de Datos

**Semanas 1–2 | Changes 1–6**

> **Principio:** el modelo de datos es el contrato de todo el sistema.
> Se define y cierra antes de escribir cualquier componente de UI o endpoint de backend.
> Si el modelo cambia aquí, los cambios se propagan limpiamente a las demás capas.

---

### Change 1: `data-model-user`

**`/opsx:propose data-model-user`**

**Entidad `User`**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK, auto-generado |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR | nullable (usuarios OAuth no tienen contraseña local) |
| name | VARCHAR(100) | NOT NULL |
| role | ENUM | `tourist` / `admin` |
| firebase_uid | VARCHAR(128) | UNIQUE, nullable |
| avatar_url | VARCHAR(500) | nullable |
| preferred_language | VARCHAR(5) | default `'es'` |
| created_at | TIMESTAMP | auto |
| updated_at | TIMESTAMP | auto |

**Specs clave:**
```
### Requirement: Email uniqueness
The system SHALL enforce unique email addresses across all users regardless of registration method.

### Requirement: Role-based access
The system SHALL support two roles: tourist, admin with distinct permissions.

#### Scenario: Google OAuth registration
- GIVEN a user registers via Google OAuth
- WHEN Firebase authentication succeeds
- THEN the system SHALL create a local user record linked by firebase_uid
- AND the system SHALL set role = 'tourist' by default
- AND password_hash SHALL remain null

#### Scenario: Duplicate email prevention
- GIVEN a user attempts to register with an existing email
- WHEN the registration endpoint is called
- THEN the system SHALL return HTTP 409 Conflict
- AND SHALL NOT create a duplicate user record
```

---

### Change 2: `data-model-tour`

**`/opsx:propose data-model-tour`**

**Entidad `Tour`**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NOT NULL, min 50 chars |
| short_description | VARCHAR(300) | NOT NULL (para tarjetas de catálogo) |
| category | ENUM | `cultural` / `nature` / `gastronomy` / `adventure` / `urban` |
| price_per_person | DECIMAL(10,2) | NOT NULL, min: 0 |
| duration_hours | DECIMAL(4,1) | NOT NULL, min: 0.5 |
| max_capacity | INT | NOT NULL, min: 1 |
| language | VARCHAR(10)[] | NOT NULL, ej: `['es', 'en']` |
| images | VARCHAR(500)[] | NOT NULL, min: 1 imagen |
| status | ENUM | `draft` / `published` / `archived` |
| meeting_point | VARCHAR(300) | NOT NULL |
| meeting_point_lat | DECIMAL(10,8) | NOT NULL |
| meeting_point_lng | DECIMAL(11,8) | NOT NULL |
| operator_id | UUID | FK → User(id), NOT NULL |
| created_at | TIMESTAMP | auto |
| updated_at | TIMESTAMP | auto |

**Entidad `Waypoint`** (tabla separada, relación OneToMany con Tour)

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| tour_id | UUID | FK → Tour(id), ON DELETE CASCADE |
| lat | DECIMAL(10,8) | NOT NULL |
| lng | DECIMAL(11,8) | NOT NULL |
| order | INT | NOT NULL |
| label | VARCHAR(100) | NOT NULL |

**Specs clave:**
```
### Requirement: Tour visibility
The system SHALL only expose tours with status = 'published' to tourists.

### Requirement: Minimum images
The system SHALL require at least one image per tour before publishing.

#### Scenario: Draft tour visibility
- GIVEN a tour has status = 'draft'
- WHEN a tourist requests the tours catalog
- THEN the system SHALL NOT include the draft tour in the response

#### Scenario: Tour archiving
- GIVEN a tour has status = 'published' with active bookings
- WHEN an operator archives the tour
- THEN existing bookings SHALL remain valid
- AND no new bookings SHALL be accepted for the archived tour
```

---

### Change 3: `data-model-tour-slot`

**`/opsx:propose data-model-tour-slot`**

**Entidad `TourSlot`**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| tour_id | UUID | FK → Tour(id), ON DELETE CASCADE |
| start_datetime | TIMESTAMP WITH TIME ZONE | NOT NULL |
| end_datetime | TIMESTAMP WITH TIME ZONE | NOT NULL |
| available_spots | INT | NOT NULL, min: 0, CHECK ≤ tour.max_capacity |
| blocked | BOOLEAN | default `false` |
| blocked_reason | VARCHAR(200) | nullable |

**Specs clave:**
```
### Requirement: Concurrency safety
The system SHALL use SELECT FOR UPDATE when reading available_spots before a booking.

### Requirement: Spot limit
The system SHALL prevent available_spots from going below 0.

#### Scenario: Concurrent booking race condition
- GIVEN a TourSlot with available_spots = 1
- WHEN two concurrent booking requests arrive simultaneously
- THEN only one booking SHALL succeed with HTTP 201
- AND the second SHALL receive HTTP 409 Conflict with message "No spots available"
- AND available_spots SHALL be 0 after both requests complete

#### Scenario: Blocked slot
- GIVEN a TourSlot with blocked = true
- WHEN a tourist attempts to book that slot
- THEN the system SHALL return HTTP 409 Conflict with message "Slot not available"
```

---

### Change 4: `data-model-booking`

**`/opsx:propose data-model-booking`** *(depende de Changes 1, 2, 3)*

**Entidad `Booking`**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → User(id) |
| tour_id | UUID | FK → Tour(id) |
| slot_id | UUID | FK → TourSlot(id) |
| status | ENUM | `pending_payment` / `confirmed` / `cancelled` / `refunded` / `completed` |
| participants | INT | NOT NULL, min: 1 |
| total_price | DECIMAL(10,2) | NOT NULL |
| coupon_id | UUID | FK → Coupon(id), nullable |
| discount_amount | DECIMAL(10,2) | default 0 |
| stripe_payment_intent_id | VARCHAR(100) | nullable |
| stripe_payment_status | VARCHAR(50) | nullable |
| google_calendar_event_id | VARCHAR(200) | nullable |
| cancellation_reason | TEXT | nullable |
| cancelled_at | TIMESTAMP | nullable |
| created_at | TIMESTAMP | auto |
| updated_at | TIMESTAMP | auto |

**Entidad `Coupon`**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| code | VARCHAR(50) | UNIQUE, NOT NULL |
| discount_percent | INT | NOT NULL, entre 1 y 100 |
| valid_until | TIMESTAMP | NOT NULL |
| max_uses | INT | NOT NULL |
| use_count | INT | default 0 |
| active | BOOLEAN | default true |

**Specs clave:**
```
### Requirement: Booking atomicity
The system SHALL create a booking and decrement available_spots in a single database transaction.

#### Scenario: Payment timeout
- GIVEN a booking is created with status = 'pending_payment'
- WHEN 30 minutes pass without payment confirmation
- THEN the system SHALL cancel the booking
- AND SHALL restore the available_spots in the TourSlot
```

---

### Change 5: `data-model-review`

**`/opsx:propose data-model-review`** *(depende de Change 4)*

**Entidad `Review`**

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → User(id) |
| tour_id | UUID | FK → Tour(id) |
| booking_id | UUID | FK → Booking(id), UNIQUE |
| rating | INT | NOT NULL, entre 1 y 5 |
| comment | TEXT | NOT NULL, min 10 chars |
| status | ENUM | `pending` / `approved` / `rejected` |
| rejection_reason | VARCHAR(200) | nullable |
| created_at | TIMESTAMP | auto |

**Specs clave:**
```
### Requirement: Review eligibility
The system SHALL only allow users with a booking of status 'completed' to submit a review for that tour.

### Requirement: One review per booking
The system SHALL limit one review per booking (enforced by UNIQUE constraint on booking_id).

### Requirement: Moderation
The system SHALL require admin approval before a review is publicly visible.

#### Scenario: Ineligible review attempt
- GIVEN a user has a booking with status = 'confirmed' (not yet completed)
- WHEN the user attempts to submit a review
- THEN the system SHALL return HTTP 403 Forbidden
```

---

### Change 6: `database-setup`

**`/opsx:propose database-setup`**

- `docker-compose.yml` con PostgreSQL 16 + pgAdmin
- `backend/src/data-source.ts` — configuración TypeORM con entidades, migraciones y logging
- Migración inicial con todas las entidades y sus relaciones
- Índices de rendimiento:
  - `idx_tour_status_category` en `Tour(status, category)`
  - `idx_tour_price` en `Tour(price_per_person)`
  - `idx_slot_tour_date` en `TourSlot(tour_id, start_datetime)`
  - `idx_booking_user` en `Booking(user_id, status)`
  - `idx_review_tour_status` en `Review(tour_id, status)`
  - **tsvector index** en `Tour` para full-text search
- **Seed de datos de desarrollo:**
  - 3 usuarios operadores
  - 10 tours publicados (variedad de categorías, idiomas, precios)
  - 5 tours en estado draft
  - 60 slots distribuidos en los próximos 2 meses
  - 50 usuarios turistas
  - 30 reservas con distintos estados
  - 20 reseñas (15 aprobadas, 5 pendientes)
  - 3 cupones de descuento

---

## BLOQUE 2 — UI Angular (módulo a módulo con mocks)

**Semanas 3–9 | Changes 7–15**

> Todos los módulos se desarrollan inicialmente contra **mock data local**.
> El backend NO es necesario en este bloque.
> Al completar este bloque, la app es 100% navegable sin backend real.
> La conexión al backend real ocurre en el Bloque 3, sin tocar los componentes.

---

### Change 7: `frontend-scaffolding`

**`/opsx:propose frontend-scaffolding`**

```bash
ng new frontend --routing --style=scss --ssr
cd frontend
ng add @angular/material
```

**Estructura de carpetas Angular:**
```
frontend/src/app/
  core/
    models/          → interfaces TypeScript (espejo de entidades de BD)
      tour.model.ts
      booking.model.ts
      user.model.ts
      review.model.ts
      coupon.model.ts
    services/        → servicios singleton
    guards/
      auth.guard.ts
      role.guard.ts
    interceptors/
      auth.interceptor.ts    → inyecta JWT en cada petición
      error.interceptor.ts   → manejo global de errores HTTP
    config/          → constantes, enums, configuración
  shared/
    components/      → componentes reutilizables (botones, modales, loaders...)
    pipes/
    directives/
  features/
    catalog/
    booking/
    auth/
    admin/
    map/
    reviews/
    profile/
  environments/
    environment.ts        → apunta a mock/local
    environment.prod.ts   → apunta a API en producción
```

**Configuración base a implementar:**
- `AuthInterceptor`: añade `Authorization: Bearer <token>` en każda petición autenticada
- `ErrorInterceptor`: intercepta 401 (refresh token), 403 (redirect), 500 (toast de error)
- `AuthGuard`: redirige a `/auth/login` si no autenticado, preserva `returnUrl`
- `RoleGuard`: redirige a `/403` si rol insuficiente
- ESLint + Prettier con reglas Angular estrictas
- Karma + Jasmine para tests unitarios

---

### Change 8: `ui-catalog`

**`/opsx:propose ui-catalog`**

**Componentes:**
- `CatalogPageComponent` — página principal en `/catalog`
- `TourCardComponent` — tarjeta reutilizable con: imagen principal, título, descripción corta, precio por persona, duración, rating con estrellas, idiomas disponibles, badge de categoría
- `SearchFilterComponent` — panel de filtros con Angular Material:
  - Categoría (chips multi-selección)
  - Precio (range slider)
  - Duración (range slider en horas)
  - Valoración mínima (estrellas clicables)
  - Idioma del tour (checkboxes)
  - Fecha (datepicker)
- `CatalogToolbarComponent` — barra con toggle grid/lista, contador de resultados, ordenación

**Comportamiento:**
- Lazy-loading con `IntersectionObserver` al llegar al final de la página
- URL params reflejan filtros activos (compartible por link)
- Favoritos para usuarios autenticados (icono corazón en cada tarjeta)

```
### Requirement: Filter persistence
The system SHALL persist active filters in the URL as query parameters.

#### Scenario: Price filter
- GIVEN a user sets price filter to 0–50€
- WHEN the catalog renders
- THEN only tours with price_per_person <= 50 SHALL appear

#### Scenario: Lazy loading
- GIVEN the catalog shows 12 tours initially
- WHEN the user scrolls to the bottom
- THEN the system SHALL load the next 12 tours
- AND SHALL NOT render a loading spinner for the initial batch
```

---

### Change 9: `ui-tour-detail`

**`/opsx:propose ui-tour-detail`**

**Componentes:**
- `TourDetailPageComponent` — página en `/tours/:id`
- `ImageGalleryComponent` — galería con lightbox, thumbnails, navegación por teclado
- `TourItineraryComponent` — lista de waypoints numerados con mapa embebido
- `TourInfoSidebarComponent` — precio, duración, idiomas, capacidad máxima, botón "Reservar ahora"
- `ShareTourComponent` — botones para compartir en redes + copiar enlace

**Comportamiento:**
- CTA de reserva sticky en mobile
- Botón "Reservar" deshabilitado si no hay slots disponibles con tooltip explicativo
- Meta tags dinámicos para SEO (título, descripción, og:image)
- Schema.org markup para tours (rich snippets en Google)

```
#### Scenario: No available slots
- GIVEN a tour has no TourSlots with available_spots > 0
- WHEN a tourist views the tour detail
- THEN the "Book Now" button SHALL be disabled
- AND SHALL display "No availability — check back soon"

#### Scenario: Share link
- GIVEN a user copies the tour link
- WHEN another user opens that link
- THEN the page SHALL render with correct og:title and og:image meta tags
```

---

### Change 10: `ui-auth`

**`/opsx:propose ui-auth`**

**Componentes:**
- `LoginPageComponent` — email/password + botón "Continuar con Google"
- `RegisterPageComponent` — formulario con validación en tiempo real:
  - Email (formato válido, único — feedback asíncrono)
  - Contraseña (indicador de fortaleza: débil/media/fuerte)
  - Nombre completo
- `ForgotPasswordPageComponent` — input de email + confirmación de envío
- `UserProfilePageComponent` — edición de nombre, avatar, idioma preferido

```
### Requirement: Post-login redirect
The system SHALL redirect the user to the originally requested URL after successful login.

#### Scenario: Protected route access
- GIVEN a non-authenticated user navigates to /booking/new
- WHEN the AuthGuard evaluates the route
- THEN the system SHALL redirect to /auth/login?returnUrl=%2Fbooking%2Fnew
- AND after successful login SHALL redirect to /booking/new

#### Scenario: Password strength
- GIVEN a user types a password in the register form
- WHEN the password has 8+ chars with uppercase, lowercase and number
- THEN the strength indicator SHALL show "Strong"
```

---

### Change 11: `ui-booking-flow`

**`/opsx:propose ui-booking-flow`**

**Componentes — Wizard de 4 pasos con Angular Material Stepper:**

1. `SlotSelectorComponent`
   - Calendario visual con fechas disponibles resaltadas en verde
   - Fechas sin disponibilidad en gris claro (no seleccionables)
   - Al seleccionar fecha, muestra los horarios disponibles para ese día

2. `ParticipantSelectorComponent`
   - Selector numérico de participantes
   - Precio total calculado en tiempo real: `participants × price_per_person`
   - Campo de cupón de descuento con validación asíncrona
   - Resumen del precio antes y después del descuento

3. `PaymentFormComponent`
   - Stripe Elements: número de tarjeta, expiración, CVC
   - Apple Pay / Google Pay si el dispositivo lo soporta
   - Loader durante procesamiento, sin posibilidad de doble submit

4. `BookingConfirmationComponent`
   - Resumen completo de la reserva
   - Botón "Añadir a Google Calendar"
   - Código de reserva / QR
   - Enlace a "Mis reservas"

```
### Requirement: Real-time price
The system SHALL update the total price in real time as participants are selected.

### Requirement: Navigation prevention
The system SHALL show a confirmation dialog if the user attempts to leave the payment step.

#### Scenario: Slot capacity limit
- GIVEN a TourSlot has available_spots = 3
- WHEN the participant selector renders
- THEN the maximum selectable value SHALL be 3

#### Scenario: Invalid coupon
- GIVEN a user enters an expired coupon code
- WHEN the coupon is validated
- THEN an error message "Coupon expired" SHALL appear inline
- AND the discount SHALL NOT be applied
```

---

### Change 12: `ui-my-bookings`

**`/opsx:propose ui-my-bookings`**

**Componentes:**
- `MyBookingsPageComponent` — tabs: **Próximas** / **Pasadas** / **Canceladas**
- `BookingCardComponent` — resumen de reserva: tour, fecha, participantes, precio, estado con badge de color
- `BookingDetailPageComponent` — detalle completo con QR, acciones según estado
- `CancelBookingDialogComponent` — modal de confirmación con selector de motivo de cancelación

```
#### Scenario: Cancel action visibility
- GIVEN a booking has status = 'confirmed'
- WHEN the booking card renders
- THEN a "Cancel booking" action SHALL be visible
- AND GIVEN a booking has status = 'completed'
- THEN no cancel action SHALL be visible

#### Scenario: Countdown
- GIVEN a booking is 2 days in the future
- WHEN the booking card renders
- THEN a countdown "2 days to go" SHALL be displayed
```

---

### Change 13: `ui-map-interactive`

**`/opsx:propose ui-map-interactive`**

**Componentes:**
- `MapPageComponent` — página `/map`, mapa a pantalla completa
- `TourMarkerComponent` — marcador custom con miniatura del tour
- `MapSidebarComponent` — panel lateral deslizable con `TourCardComponent` mini al seleccionar marcador
- Clúster de marcadores con `@angular/google-maps` + `MarkerClustererPlus`

```
### Requirement: Marker clustering
The system SHALL cluster markers when more than 3 tours overlap within 50px.

### Requirement: Geolocation
The system SHALL center the map on the user's geolocation on first load (with explicit permission).

#### Scenario: Marker click
- GIVEN multiple tour markers are visible on the map
- WHEN the user clicks a tour marker
- THEN the sidebar SHALL slide in with the tour card
- AND SHALL include a "View Detail" button linking to /tours/:id
```

---

### Change 14: `ui-admin-panel`

**`/opsx:propose ui-admin-panel`** *(módulo lazy-loaded en `/admin`, protegido por RoleGuard)*

**Componentes:**
- `AdminDashboardComponent`
  - KPI cards: reservas hoy, ingresos del mes, ocupación media, tours activos
  - Gráfico de reservas por día (últimos 30 días) con `ng2-charts` + Chart.js
  - Gráfico de ingresos por categoría (donut chart)
- `TourManagerComponent` — tabla paginada con filtro por estado, acciones: editar/publicar/archivar
- `TourFormComponent`
  - Formulario completo con todos los campos del tour
  - Upload de imágenes con drag & drop + preview
  - Editor de waypoints: añadir puntos en mapa Google Maps clicando
- `AdminBookingsTableComponent` — tabla con filtros por: fecha, tour, estado + acciones cancelar/reembolsar
- `AdminUsersTableComponent` — lista de usuarios con actualización de rol
- `ReviewModerationComponent` — cola de reseñas pendientes con aprobar/rechazar + motivo

```
### Requirement: Admin access restriction
The system SHALL restrict all /admin routes to users with role = 'admin'.

#### Scenario: Archive tour with active bookings
- GIVEN a tour has 3 confirmed bookings
- WHEN an admin clicks "Archive tour"
- THEN a warning dialog SHALL show: "This tour has 3 active bookings. Archive anyway?"
```

---

### Change 15: `ui-reviews`

**`/opsx:propose ui-reviews`**

**Componentes:**
- `ReviewListComponent` — lista de reseñas aprobadas con paginación, ordenación (más recientes / más valoradas)
- `ReviewFormComponent` — formulario con: rating interactivo de estrellas, textarea de comentario, contador de caracteres
- `RatingSummaryComponent` — distribución visual de estrellas (barras de porcentaje) + nota media destacada

```
#### Scenario: Review form visibility
- GIVEN a user is authenticated AND has a completed booking for the tour
- WHEN the tour detail page renders
- THEN the review form SHALL be visible
- AND GIVEN the user already submitted a review
- THEN the form SHALL be replaced with "You have already reviewed this tour"

#### Scenario: Rating summary
- GIVEN a tour has 10 reviews: 5★×4, 4★×3, 3★×2, 2★×1, 1★×0
- WHEN the rating summary renders
- THEN the average rating SHALL show 4.0
- AND the 5★ bar SHALL show 40%
```

---

## BLOQUE 3 — Backend + Integraciones

**Semanas 10–17 | Changes 16–24**

> Al completar cada change de backend, se sustituye el mock del change de UI correspondiente
> por la URL real. Los tipos TypeScript no cambian — ya eran correctos desde los modelos.

---

### Change 16: `backend-scaffolding`

**`/opsx:propose backend-scaffolding`**

**Estructura de carpetas:**
```
backend/src/
  config/         → data-source.ts, env.ts, constants.ts
  entities/       → entidades TypeORM
  controllers/    → manejo de peticiones HTTP
  services/       → lógica de negocio
  repositories/   → queries a BD
  middlewares/
    auth.middleware.ts      → verifica JWT
    role.middleware.ts      → RBAC
    error.middleware.ts     → manejo centralizado de errores
    rate-limit.middleware.ts
  routes/         → definición de rutas Express
  utils/          → helpers reutilizables
  types/          → tipos TypeScript custom
```

**Middlewares de seguridad (en orden de aplicación):**
1. `helmet()` — HTTP security headers
2. `cors({ origin: process.env.FRONTEND_URL })` — CORS restrictivo
3. `express-rate-limit` (100 req / 15 min general; 5 req / 15 min en `/auth/login`)
4. `morgan('combined')` — logging de peticiones
5. `express.json({ limit: '10mb' })` — body parser
6. `class-validator` + `class-transformer` — validación de DTOs

**API:**
- Prefijo: `/api/v1/`
- `GET /api/health` — estado del servidor y conexión a BD
- Swagger UI en `/api/docs` (generado con `swagger-jsdoc`)
- Manejo de errores: clase `AppError` con código HTTP, mensaje y detalles de validación

---

### Change 17: `backend-auth`

**`/opsx:propose backend-auth`**

**Endpoints:**

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/auth/register` | Crea usuario en Firebase + BD local |
| POST | `/api/v1/auth/login` | Devuelve JWT (1h) + establece refresh token en cookie |
| POST | `/api/v1/auth/refresh` | Renueva JWT usando refresh token de la cookie |
| POST | `/api/v1/auth/logout` | Invalida refresh token en BD, limpia cookie |
| POST | `/api/v1/auth/forgot-password` | Envía email de recuperación con SendGrid |
| GET | `/api/v1/users/me` | Perfil del usuario autenticado |
| PATCH | `/api/v1/users/me` | Actualiza perfil (nombre, avatar, idioma) |

**Seguridad:**
```
JWT almacenado en memoria en Angular (nunca en localStorage → protección XSS)
Refresh token en HttpOnly, Secure, SameSite=Strict cookie → protección CSRF
Rate limit de 5 intentos /15min en /auth/login con IP-based blocking
Tokens JWT firmados con RS256 (clave asimétrica), expiración 1h
Refresh tokens con expiración 30 días, revocables individualmente en BD
```

---

### Change 18: `backend-catalog`

**`/opsx:propose backend-catalog`**

**Endpoints:**

| Método | Ruta | Auth requerida |
|---|---|---|
| GET | `/api/v1/tours` | No |
| GET | `/api/v1/tours/featured` | No |
| GET | `/api/v1/tours/:id` | No |
| POST | `/api/v1/tours` | Sí (admin) |
| PATCH | `/api/v1/tours/:id` | Sí (operador propietario / admin) |

**`GET /api/v1/tours` — Query params:**
- `category`, `price_min`, `price_max`, `duration_min`, `duration_max`
- `rating_min` (filtra por rating medio ≥ valor)
- `language`, `date` (filtra slots disponibles a partir de esa fecha)
- `search` (full-text search en title + description)
- `page` (default: 1), `limit` (default: 12, max: 50)
- `sort`: `price_asc`, `price_desc`, `rating_desc`, `newest`

**Full-text search PostgreSQL:**
```sql
-- Columna generada en entidad Tour:
@Column({ type: 'tsvector', select: false })
@Index()
searchVector: string;

-- En el servicio:
WHERE "searchVector" @@ plainto_tsquery('spanish', :query)
ORDER BY ts_rank("searchVector", plainto_tsquery('spanish', :query)) DESC
```

---

### Change 19: `backend-bookings`

**`/opsx:propose backend-bookings`**

**Endpoints:**

| Método | Ruta | Auth |
|---|---|---|
| GET | `/api/v1/tours/:id/slots` | No |
| POST | `/api/v1/bookings` | Sí (tourist) |
| GET | `/api/v1/bookings/:id` | Sí (propietario / admin) |
| PATCH | `/api/v1/bookings/:id/cancel` | Sí (propietario / admin) |
| GET | `/api/v1/users/me/bookings` | Sí |

**Lógica de creación de reserva (transacción atómica):**
```
1. BEGIN TRANSACTION
2. SELECT slot FOR UPDATE WHERE id = :slotId
3. IF slot.available_spots < participants THEN ROLLBACK + 409
4. IF slot.blocked = true THEN ROLLBACK + 409
5. INSERT INTO booking (status = 'pending_payment')
6. UPDATE slot SET available_spots = available_spots - participants
7. COMMIT
8. Crear PaymentIntent en Stripe → devolver client_secret al frontend
```

---

### Change 20: `integration-google-calendar`

**`/opsx:propose integration-google-calendar`**

**Flujo OAuth 2.0:**
```
1. Frontend solicita URL de autorización al backend
2. Backend genera URL con scope = 'https://www.googleapis.com/auth/calendar.events'
3. Usuario acepta en pantalla de Google
4. Google redirige a /api/v1/auth/google-calendar/callback?code=...
5. Backend intercambia code por access_token + refresh_token
6. Backend almacena tokens cifrados asociados al user_id
```

**`GoogleCalendarService`:**
- `createEvent(booking)` — crea evento con: título del tour, descripción, location (meeting_point), reminder 24h, attendees (email del usuario)
- `updateEvent(eventId, booking)` — actualiza si se modifica la reserva
- `deleteEvent(eventId)` — elimina al cancelar
- Tokens se refrescan automáticamente si han expirado

```
#### Scenario: Calendar event creation
- GIVEN a booking is confirmed after payment
- WHEN the payment webhook fires
- THEN a Google Calendar event SHALL be created for the user
- AND the google_calendar_event_id SHALL be stored in the booking record
- AND the event SHALL have a 24h reminder notification

#### Scenario: Booking cancellation sync
- GIVEN a booking has a google_calendar_event_id
- WHEN the booking is cancelled
- THEN the Google Calendar event SHALL be deleted
```

---

### Change 21: `integration-stripe`

**`/opsx:propose integration-stripe`**

**Endpoints:**

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/payments/create-intent` | Crea PaymentIntent, devuelve client_secret |
| POST | `/api/v1/payments/webhook` | Recibe eventos de Stripe (firmados) |
| POST | `/api/v1/payments/refund/:bookingId` | Inicia reembolso |

**Webhook — eventos gestionados:**
- `payment_intent.succeeded` → confirmar booking + enviar email + crear evento Calendar + generar factura PDF
- `payment_intent.payment_failed` → marcar booking como fallido + restaurar available_spots
- `charge.refunded` → actualizar booking a `refunded`

**Seguridad del webhook:**
```typescript
// Verificación de firma obligatoria — rechaza cualquier petición no firmada
const event = stripe.webhooks.constructEvent(
  req.body,       // raw body (NO parseado por express.json)
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
);
```

**Factura PDF:**
- Generada con `pdfkit` al confirmar el pago
- Incluye: logo TourVisit, datos del tour, fecha, participantes, desglose de precio, número de reserva
- Enviada por email adjunta con SendGrid

---

### Change 22: `backend-admin`

**`/opsx:propose backend-admin`**

**Endpoints (todos requieren role admin):**

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/v1/admin/dashboard` | KPIs del día y mes |
| GET | `/api/v1/admin/bookings` | Todas las reservas con filtros |
| PATCH | `/api/v1/admin/bookings/:id/cancel` | Cancelación forzada |
| GET | `/api/v1/admin/users` | Lista de usuarios (solo admin) |
| PATCH | `/api/v1/admin/users/:id/role` | Cambio de rol (solo admin) |
| GET | `/api/v1/admin/reviews/pending` | Cola de reseñas pendientes |
| PATCH | `/api/v1/admin/reviews/:id` | Aprobar o rechazar reseña |
| GET | `/api/v1/admin/reports/bookings` | Exportación CSV/PDF de reservas |

**Dashboard KPIs (query optimizada):**
```sql
SELECT
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) AS bookings_today,
  SUM(total_price) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())) AS revenue_month,
  AVG(available_spots::float / t.max_capacity) AS avg_occupancy
FROM bookings b
JOIN tour_slots ts ON b.slot_id = ts.id
JOIN tours t ON b.tour_id = t.id
WHERE b.status = 'confirmed'
```

---

### Change 23: `backend-notifications`

**`/opsx:propose backend-notifications`**

**Job de recordatorios (node-cron):**
```
Cron expression: '0 9 * * *'   → cada día a las 09:00
1. Consultar reservas con start_datetime BETWEEN NOW()+24h AND NOW()+25h AND status = 'confirmed'
2. Para cada reserva: enviar email con SendGrid Dynamic Template
3. Template usa preferred_language del usuario para seleccionar idioma ES/EN/FR
4. Registro del envío en tabla notification_logs para evitar duplicados
```

**Tabla `notification_log` (evita duplicados en caso de reinicio del servidor):**

| Campo | Tipo |
|---|---|
| id | UUID |
| booking_id | UUID |
| type | ENUM: `reminder_24h` / `confirmation` / `cancellation` |
| sent_at | TIMESTAMP |

---

### Change 24: `i18n`

**`/opsx:propose i18n`**

**Frontend (Angular `@angular/localize`):**
- Idiomas: ES (base), EN, FR
- Todas las cadenas en templates marcadas con `i18n` attribute
- Archivos de traducción: `messages.xlf`, `messages.en.xlf`, `messages.fr.xlf`
- Selector de idioma en navbar: persiste en `localStorage`, establece `lang` attribute en `<html>`
- Rutas con prefijo de idioma: `/es/catalogo`, `/en/catalog`, `/fr/catalogue`

**Backend:**
- Respuestas de error localizadas según header `Accept-Language`
- Emails de SendGrid con Dynamic Templates multilingüe (una template, variables de idioma)

---

## BLOQUE 4 — Testing, QA y Despliegue

**Semanas 18–20 | Changes 25–26**

---

### Change 25: `testing-strategy`

**`/opsx:propose testing-strategy`**

**Backend — Jest:**
```
Cobertura objetivo: ≥ 80%
- Tests unitarios: todos los Services (mocks de TypeORM y APIs externas)
- Tests de integración: endpoints críticos (POST /auth, POST /bookings, POST /payments/webhook)
- Mocking: repositorios TypeORM, Firebase Admin, Stripe, Google Calendar, SendGrid
```

**Frontend — Karma + Jasmine:**
```
Cobertura objetivo: ≥ 80%
- Tests de componentes: TourCardComponent, BookingFlowComponent, PaymentFormComponent
- Tests de servicios: AuthService, BookingService, TourService
- Tests de guards: AuthGuard, RoleGuard
- Tests de interceptors: AuthInterceptor, ErrorInterceptor
```

**E2E — Cypress:**
```
Flujos críticos:
1. Registro de usuario nuevo → verificación email
2. Login con Google OAuth
3. Búsqueda de tour con filtros → ver detalle
4. Flujo completo de reserva con pago (Stripe test mode)
5. Cancelación de reserva con reembolso
6. Operador crea nuevo tour desde panel admin
7. Moderación de reseña pendiente

Navegadores: Chrome (principal), Firefox (cross-browser)
```

**Auditorías:**
- Lighthouse CI en cada PR (threshold: Performance 85, Accessibility 90, SEO 90, Best Practices 90)
- OWASP ZAP scan automatizado en staging antes de cada release
- Revisión manual OWASP Top 10 en puntos críticos: auth, pagos, inputs de usuarios, file uploads

---

### Change 26: `deployment`

**`/opsx:propose deployment`**

**Frontend — Firebase Hosting + Cloud Run:**
```bash
ng build --configuration=production
# SSR (Angular Universal) en Cloud Run
# Static assets en Firebase Hosting (CDN global)
firebase deploy --only hosting
```

**Backend — Cloud Run (autoscaling):**
```dockerfile
# Dockerfile multi-stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

**Base de datos — Cloud SQL (GCP):**
- PostgreSQL 16 con backups automáticos diarios (retención 7 días)
- Private IP (no expuesta a internet)
- Migraciones ejecutadas como step previo al deploy: `typeorm migration:run`
- Connection pooling con `pgBouncer`

**Secrets — Google Secret Manager:**
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `FIREBASE_SERVICE_ACCOUNT`
- `GOOGLE_CALENDAR_CREDENTIALS`
- `SENDGRID_API_KEY`
- `DATABASE_URL`
- `JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`

**Monitoring:**
- Google Cloud Logging: logs estructurados del backend
- Firebase Crashlytics: errores de frontend
- Cloud Monitoring: CPU, memoria, latencia de Cloud Run
- Uptime checks cada 5 minutos (target: 99.5% — RNF-03)
- Alertas por email si latencia p95 > 200ms o error rate > 1%

---

## Tabla Resumen de Changes OpenSpec

| # | Change | Bloque | Semana | Depende de |
|---|---|---|---|---|
| 1 | `data-model-user` | Modelo de datos | 1 | — |
| 2 | `data-model-tour` | Modelo de datos | 1 | #1 |
| 3 | `data-model-tour-slot` | Modelo de datos | 1 | #2 |
| 4 | `data-model-booking` | Modelo de datos | 2 | #1, #2, #3 |
| 5 | `data-model-review` | Modelo de datos | 2 | #4 |
| 6 | `database-setup` | Modelo de datos | 2 | #1–#5 |
| 7 | `frontend-scaffolding` | UI Angular | 3 | #1–#5 (modelos) |
| 8 | `ui-catalog` | UI Angular | 4 | #7 |
| 9 | `ui-tour-detail` | UI Angular | 4 | #7 |
| 10 | `ui-auth` | UI Angular | 5 | #7 |
| 11 | `ui-booking-flow` | UI Angular | 6 | #7, #8, #9 |
| 12 | `ui-my-bookings` | UI Angular | 6 | #7 |
| 13 | `ui-map-interactive` | UI Angular | 7 | #7 |
| 14 | `ui-admin-panel` | UI Angular | 8–9 | #7 |
| 15 | `ui-reviews` | UI Angular | 9 | #7 |
| 16 | `backend-scaffolding` | Backend | 10 | #6 |
| 17 | `backend-auth` | Backend | 10–11 | #16 |
| 18 | `backend-catalog` | Backend | 11–12 | #16, #17 |
| 19 | `backend-bookings` | Backend | 12–13 | #16, #17, #18 |
| 20 | `integration-google-calendar` | Integraciones | 13 | #19 |
| 21 | `integration-stripe` | Integraciones | 14–15 | #19 |
| 22 | `backend-admin` | Backend | 15–16 | #16–#19 |
| 23 | `backend-notifications` | Backend | 16 | #19, #21 |
| 24 | `i18n` | Transversal | 17 | #7–#23 |
| 25 | `testing-strategy` | QA | 18–19 | todos |
| 26 | `deployment` | Despliegue | 20 | todos |

---

## Requerimientos Funcionales Cubiertos

| RF | Descripción | Changes |
|---|---|---|
| RF-01 | Catálogo de visitas turísticas | #8, #18 |
| RF-02 | Detalle con galería de imágenes | #9, #18 |
| RF-03 | Búsqueda y filtrado de visitas | #8, #18 |
| RF-04 | Registro y login de usuarios | #10, #17 |
| RF-05 | Reserva con Google Calendar | #11, #19, #20 |
| RF-06 | Selección de fecha y hora | #11, #19 |
| RF-07 | Confirmación de reserva por email | #21, #23 |
| RF-08 | Gestión de reservas | #12, #19 |
| RF-09 | Mapa interactivo | #13 |
| RF-10 | Valoraciones y reseñas | #15, #22 |
| RF-11 | Pasarela de pago Stripe | #11, #21 |
| RF-12 | Panel de administración | #14, #22 |
| RF-13 | Gestión de guías turísticos | #14, #22 |
| RF-14 | Notificaciones y recordatorios | #23 |
| RF-15 | Sistema de descuentos y cupones | #4, #11, #19 |
| RF-16 | Multi-idioma ES/EN/FR | #24 |
| RF-17 | Informes y estadísticas admin | #22 |

---

## Principios de Arquitectura

| Decisión | Justificación |
|---|---|
| **SSR desde el inicio** (`ng new --ssr`) | Cumple RNF-09 (SEO), Lighthouse > 85 |
| **JWT en memoria + refresh en HttpOnly cookie** | Protección XSS (no localStorage) y CSRF (SameSite=Strict) |
| **Webhooks Stripe firmados** | Autenticidad verificada — rechaza eventos no firmados |
| **SELECT FOR UPDATE en reservas** | Evita race conditions en slots con alta concurrencia |
| **Angular Signals** (Angular 17) | Estado reactivo sin NgRx — menor complejidad |
| **Módulos lazy-loaded** | Bundle inicial mínimo → LCP < 3s (RNF-01) |
| **Full-text search PostgreSQL** | Búsqueda eficiente sin Elasticsearch — simplicidad operacional |
| **Interfaces TS espejo de entidades** | Contrato único desde Change 7 → sin desajustes de tipos |
| **Mock data en Bloque 2** | UI completamente desarrollable sin backend → dos flujos en paralelo |
| **node-cron + notification_log** | Recordatorios idempotentes sin sistemas de colas externos |

---

*Documento generado el 20 de marzo de 2026. Actualizar tras completar cada change de OpenSpec.*
