# Proposal: data-model-tour

**Change 2 de 26** | Depende de: `data-model-user` (Change 1)

## Why

El tour es el objeto central de la plataforma. Sin su entidad definida no puede existir catálogo, reserva, mapa ni panel de administración. Este change cierra el contrato de datos del tour antes de que cualquier capa superior (UI, backend) lo consuma.

Los tours tienen coordenadas geográficas para el mapa (Google Maps), array de imágenes, array de idiomas disponibles, múltiples puntos de paso (waypoints) y un ciclo de vida con tres estados (draft → published → archived). La entidad `Waypoint` se mantiene en tabla separada para simplificar las consultas geoespaciales y permitir reordenación sin actualizar arrays.

## What Changes

### Entidad `Tour`

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK, auto-generado |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NOT NULL, mín. 50 chars |
| short_description | VARCHAR(300) | NOT NULL |
| category | ENUM | `cultural` / `nature` / `gastronomy` / `adventure` / `urban` |
| price_per_person | DECIMAL(10,2) | NOT NULL, CHECK ≥ 0 |
| duration_hours | DECIMAL(4,1) | NOT NULL, CHECK ≥ 0.5 |
| max_capacity | INT | NOT NULL, CHECK ≥ 1 |
| language | VARCHAR(10)[] | NOT NULL, mín. 1 elemento |
| images | VARCHAR(500)[] | NOT NULL, mín. 1 elemento |
| status | ENUM | `draft` / `published` / `archived` |
| meeting_point | VARCHAR(300) | NOT NULL |
| meeting_point_lat | DECIMAL(10,8) | NOT NULL |
| meeting_point_lng | DECIMAL(11,8) | NOT NULL |
| operator_id | UUID | FK → User(id), NOT NULL |
| search_vector | TSVECTOR | generado de title + description, índice GIN |
| created_at | TIMESTAMP | auto |
| updated_at | TIMESTAMP | auto |

### Entidad `Waypoint` (tabla separada)

| Campo | Tipo | Restricciones |
|---|---|---|
| id | UUID | PK |
| tour_id | UUID | FK → Tour(id), ON DELETE CASCADE |
| lat | DECIMAL(10,8) | NOT NULL |
| lng | DECIMAL(11,8) | NOT NULL |
| order | INT | NOT NULL |
| label | VARCHAR(100) | NOT NULL |

## Capabilities

- **tour-visibility** — ciclo de vida draft/published/archived y reglas de visibilidad para turistas
- **tour-images** — validación de imagen mínima antes de publicar
- **tour-archiving** — archivado con reservas activas preservadas
- **waypoints** — puntos de ruta geoespaciales en tabla separada con orden preservado

## Non-goals

- Creación de slots de disponibilidad (Change 3: `data-model-tour-slot`)
- Endpoints REST del catálogo (Change 18: `backend-catalog`)
- Componentes de UI del catálogo (Change 8: `ui-catalog`)
- Búsqueda full-text por tsvector (se define el índice aquí, el endpoint en Change 18)

## Impact

- Nuevas tablas: `tours`, `waypoints`
- Nuevo ENUM PostgreSQL: `tour_category_enum`, `tour_status_enum`
- FK: `tours.operator_id` → `users.id`
- FK: `waypoints.tour_id` → `tours.id` ON DELETE CASCADE
- Base para Changes 3, 4, 5, 8, 13, 14, 18
