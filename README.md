# TourVisit — Plataforma de Visitas Turísticas

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