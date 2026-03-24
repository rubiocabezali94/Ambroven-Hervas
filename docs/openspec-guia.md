# Guía de OpenSpec para el equipo

> **A quién va dirigido:** desarrolladores que se incorporan al proyecto y quieren entender cómo se organiza y planifica el trabajo antes de escribir código.

---

## ¿Qué es OpenSpec?

OpenSpec es una **metodología de desarrollo guiada por especificaciones** (Spec-Driven Development, SDD). La idea central es sencilla:

> **Ningún código se escribe sin una especificación previa.**

En lugar de empezar a programar directamente cuando llega una tarea nueva, primero se genera un conjunto de documentos que describen *qué* hay que construir, *por qué* y *cómo*. Solo cuando esos documentos están listos se pasa a implementar.

En este proyecto, OpenSpec está integrado como una herramienta CLI y como una serie de habilidades del agente de IA (GitHub Copilot), lo que permite generar y revisar los documentos de manera asistida.

---

## ¿Por qué se usa en este proyecto?

El proyecto TourVisit tiene muchas piezas que deben encajar: Angular, NestJS, PostgreSQL, Stripe, Google Calendar, Firebase Auth... Un error de diseño en un módulo puede bloquear varios módulos después.

OpenSpec ayuda a:

- **Detectar problemas de diseño antes de codificar**, cuando son baratos de corregir.
- **Coordinar al equipo**: todos parten de la misma especificación escrita.
- **Facilitar revisiones de código**: el PR tiene contexto claro de qué debía hacer.
- **Incorporar nuevos miembros** rápidamente: los documentos explican el *porqué* de las decisiones.

---

## La estructura de un *change*

Cada unidad de trabajo se llama **change** (cambio). Un change representa una funcionalidad o pieza del sistema (por ejemplo: "modelo de datos del usuario" o "flujo de reserva").

Cada change vive en su propia carpeta dentro de `openspec/changes/<nombre-del-change>/` y contiene estos artefactos:

```
openspec/changes/data-model-user/
├── .openspec.yaml     ← metadatos internos del change (no editar manualmente)
├── proposal.md        ← qué se va a construir y por qué
├── design.md          ← cómo se va a construir (decisiones técnicas)
├── tasks.md           ← lista de tareas concretas de implementación
└── specs/
    ├── user-profile/
    │   └── spec.md    ← especificación detallada de cada capability
    ├── user-registration/
    │   └── spec.md
    └── user-roles/
        └── spec.md
```

### Artefacto 1: `proposal.md` — El *qué* y el *por qué*

Responde a tres preguntas:
- **Why**: ¿Por qué es necesario este change? ¿Qué problema resuelve?
- **What Changes**: ¿Qué se va a crear o modificar concretamente?
- **Impact**: ¿Qué otras partes del sistema se ven afectadas?

También incluye una sección **Non-goals** que deja claro qué *no* cubre este change, para evitar que el scope se expanda sin control.

### Artefacto 2: `specs/` — El *qué exactamente*

Cada capability (funcionalidad) declarada en el proposal tiene su propia `spec.md`. Las specs usan un formato preciso:

- **`The system SHALL...`** para describir requisitos ("el sistema deberá...")
- **`GIVEN / WHEN / THEN`** para describir escenarios de comportamiento

Ejemplo:
```
GIVEN a user with role "tourist"
WHEN they request GET /api/v1/tours
THEN the system SHALL return a paginated list of published tours
```

Las specs cubren siempre el *happy path* y también los casos de error y edge cases. Esto evita descubrir casos no contemplados durante el desarrollo.

### Artefacto 3: `design.md` — El *cómo*

Documenta las decisiones técnicas: estructura de la base de datos, endpoints de la API, contratos de DTOs, decisiones de arquitectura. Es la referencia técnica para implementar.

### Artefacto 4: `tasks.md` — El *qué hacer paso a paso*

Lista de tareas concretas de implementación, numeradas en formato `1.1`, `1.2`, `2.1`... Cada tarea está pensada para completarse en menos de 2 horas. Al final de cada fase hay un **criterio de verificación** que permite saber si la implementación es correcta.

Al implementar, las tareas se van marcando completadas:
```markdown
- [x] 1.1 Crear entidad TypeORM User  ← completada
- [ ] 1.2 Generar migración inicial    ← pendiente
```

---

## El ciclo de vida de un change

```
1. PROPOSE  →  2. SPECS  →  3. DESIGN  →  4. TASKS  →  5. APPLY  →  6. ARCHIVE
   (propuesta)   (esp. detallada)  (diseño técnico)  (tareas)   (implementar)  (archivar)
```

| Paso | Comando / Acción | Resultado |
|---|---|---|
| **Propose** | `/opsx:propose <nombre>` | Se crean `proposal.md`, `design.md` y `tasks.md` |
| **Specs** | Generadas junto con la propuesta | Ficheros `spec.md` por capability |
| **Apply** | `/opsx:apply <nombre>` | El agente implementa las tareas del `tasks.md` |
| **Archive** | `/opsx:archive <nombre>` | El change se mueve a `openspec/changes/archive/` |

---

## El fichero `config.yaml`

En `openspec/config.yaml` está la configuración global del proyecto: el stack tecnológico, las convenciones de código, las reglas de seguridad y las instrucciones de cómo deben redactarse los artefactos.

Este fichero es la "memoria" del proyecto: cuando el agente genera una spec o un diseño, lo consulta para garantizar que todo sea coherente con las decisiones ya tomadas (UUID como PK, JWT sin localStorage, SELECT FOR UPDATE en reservas, etc.).

---

## Ejemplo real: el change `data-model-user`

Para que quede concreto, este es el primer change del proyecto:

- **Propósito**: crear la entidad `User` en PostgreSQL con soporte para registro con email/contraseña y con Google OAuth.
- **Capabilities definidas**: `user-registration`, `user-roles`, `user-profile`.
- **Impacto declarado**: todos los changes 2–5 dependen de esta entidad como FK.
- **Resultado en código**: la entidad [backend/src/entities/User.ts](../backend/src/entities/User.ts) y su migración correspondiente.

El change ya está **archivado** (en `openspec/changes/archive/`), lo que indica que está implementado y cerrado.

---

## Reglas del proyecto para los artefactos

Estas reglas están en el `config.yaml` y guían la calidad de los documentos:

| Artefacto | Reglas clave |
|---|---|
| `proposal.md` | Máx. 400 palabras. Siempre incluir "Non-goals". Referenciar el número de change. |
| `specs/` | Formato SHALL + GIVEN/WHEN/THEN. Cubrir siempre errores y edge cases. |
| `tasks.md` | Cada tarea completable en < 2 horas. Criterio de verificación al final de cada fase. |

---

## Resumen en una frase

> OpenSpec garantiza que antes de tocar el código, todo el equipo ha acordado **qué** se construye, **por qué**, **cómo** y **en qué orden**, mediante documentos versionados junto al propio código.
