# SKILL: TourVisit — Angular 17+ Full-Stack Development

## Cuándo usar este skill

Activa este skill cuando se pida cualquiera de lo siguiente en el proyecto TourVisit:

- Crear o modificar componentes, servicios, guards, interceptors o pipes de Angular
- Implementar o tocar endpoints del backend Node.js + Express
- Escribir entidades, repositorios o migraciones con TypeORM + PostgreSQL
- Integrar Google Calendar API, Google Maps API o Firebase Auth
- Implementar flujos de Stripe (checkout, webhooks, reembolsos)
- Escribir tests con Jest (backend) o Karma/Jasmine (frontend)
- Crear o actualizar módulos lazy-loaded en la estructura de features

---

## Stack y versiones fijadas

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Frontend | Angular | 17+ (standalone components) |
| Lenguaje | TypeScript | 5.x strict mode |
| Estilos | Angular Material + SCSS | Material 17+ |
| Auth | Firebase Authentication | SDK v10 (modular) |
| Mapas | Google Maps JS API | v3 weekly |
| Calendario | Google Calendar API | v3 |
| Backend | Node.js + Express | Node 20 LTS |
| ORM | TypeORM | 0.3.x |
| Base de datos | PostgreSQL | 15+ |
| Pagos | Stripe | SDK v14+ |
| Email | SendGrid | SDK v7+ |

---

## Estructura de carpetas Angular (obligatoria)

```
src/
├── app/
│   ├── core/                     # Singleton: servicios, guards, interceptors
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── models/               # Interfaces y tipos globales
│   ├── shared/                   # Componentes, pipes y directivas reutilizables
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   └── features/                 # Módulos lazy-loaded por funcionalidad
│       ├── catalog/
│       ├── booking/
│       ├── auth/
│       ├── admin/
│       ├── map/
│       └── reviews/
├── environments/
│   ├── environment.ts            # development
│   └── environment.prod.ts       # production
```

---

## Reglas de componentes Angular

### Siempre usar standalone components (Angular 17+)

```typescript
// CORRECTO
@Component({
  selector: 'app-tour-card',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule],
  templateUrl: './tour-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourCardComponent {
  @Input({ required: true }) tour!: Tour;
}

// INCORRECTO — no usar NgModules para componentes nuevos
@NgModule({ declarations: [TourCardComponent] })
```

### Signals para estado reactivo (preferir sobre BehaviorSubject en componentes)

```typescript
// CORRECTO para estado local de componente
export class CatalogComponent {
  tours = signal<Tour[]>([]);
  loading = signal(false);
  filteredTours = computed(() =>
    this.tours().filter(t => t.active)
  );
}
```

### Interfaces siempre en `core/models/` — nunca inline

```typescript
// src/app/core/models/tour.model.ts
export interface Tour {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;          // en minutos
  maxParticipants: number;
  category: TourCategory;
  location: GeoLocation;
  images: string[];
  rating: number;
  active: boolean;
  createdAt: Date;
}

export type TourCategory = 'cultural' | 'natural' | 'gastronomic' | 'adventure';
```

---

## Reglas de servicios Angular

### Patrón para servicios que consumen la API REST

```typescript
@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(ENVIRONMENT).apiUrl;

  getAll(filters?: TourFilters): Observable<PaginatedResponse<Tour>> {
    const params = this.buildParams(filters);
    return this.http.get<PaginatedResponse<Tour>>(`${this.apiUrl}/tours`, { params });
  }

  getById(id: string): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}/tours/${id}`);
  }

  // Manejo de errores siempre en el servicio, no en el componente
  private buildParams(filters?: TourFilters): HttpParams {
    let params = new HttpParams();
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.priceMax) params = params.set('priceMax', filters.priceMax);
    return params;
  }
}
```

### Interceptor JWT (ya existe en core/interceptors/)

```typescript
// No añadir headers Authorization manualmente en los servicios.
// El AuthInterceptor en core/interceptors/auth.interceptor.ts lo hace automático.
// Solo excluir rutas públicas en el interceptor con la lista allowedUrls.
```

---

## Reglas de autenticación (Firebase)

### Usar el SDK modular (tree-shakeable) — nunca el compat

```typescript
// CORRECTO
import { getAuth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';

// INCORRECTO
import { AngularFireAuth } from '@angular/fire/compat/auth';
```

### Guard de rutas protegidas

```typescript
// core/guards/auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuth => isAuth || router.createUrlTree(['/auth/login']))
  );
};
```

---

## Reglas de Google Calendar API

### Flujo obligatorio de integración

1. El backend obtiene y renueva el OAuth token — nunca exponer refresh tokens al frontend
2. El frontend llama al propio backend (`POST /bookings`) — el backend crea el evento en Calendar
3. El ID del evento de Calendar se guarda en la tabla `bookings` de PostgreSQL

```typescript
// Backend: booking.service.ts
async createBookingWithCalendarEvent(dto: CreateBookingDto): Promise<Booking> {
  const event = await this.googleCalendarService.createEvent({
    summary: `TourVisit: ${dto.tourTitle}`,
    start: { dateTime: dto.startTime, timeZone: 'Europe/Madrid' },
    end: { dateTime: dto.endTime, timeZone: 'Europe/Madrid' },
    attendees: [{ email: dto.userEmail }],
  });

  return this.bookingRepository.save({
    ...dto,
    calendarEventId: event.id,
    status: BookingStatus.CONFIRMED,
  });
}
```

### Caché obligatoria para slots de disponibilidad

```typescript
// Cachear la respuesta de disponibilidad 5 minutos para no agotar cuota
@CacheKey('availability')
@CacheTTL(300)
async getAvailability(tourId: string, date: string): Promise<TimeSlot[]> { ... }
```

---

## Reglas de Stripe

### Flujo de pago (obligatorio seguir este orden)

```
Frontend solicita checkout → Backend crea PaymentIntent → 
Frontend confirma con Stripe.js → Webhook en backend confirma → 
Backend actualiza estado de reserva → Email de confirmación
```

### Nunca procesar confirmación de pago solo desde el frontend

```typescript
// INCORRECTO — confiar solo en el callback del frontend
onPaymentSuccess() {
  this.bookingService.confirmBooking(this.bookingId); // vulnerable a manipulación
}

// CORRECTO — dejar que el webhook de Stripe confirme en el backend
// El frontend solo muestra UI de éxito/error según la respuesta de Stripe.js
```

### Variables de entorno para Stripe

```typescript
// Nunca hardcodear. Siempre desde environment:
const stripe = Stripe(environment.stripePublicKey);
// La secret key SOLO en el backend, nunca en el frontend
```

---

## Reglas de TypeORM + PostgreSQL

### Entidades

```typescript
// src/entities/booking.entity.ts
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ nullable: true })
  calendarEventId: string;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @ManyToOne(() => Tour, { eager: false })
  tour: Tour;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Migraciones — nunca usar `synchronize: true` en producción

```typescript
// ormconfig usa synchronize solo en development
synchronize: process.env.NODE_ENV === 'development',

// En producción, siempre migraciones explícitas:
// npm run migration:generate -- src/migrations/AddCalendarEventId
// npm run migration:run
```

---

## Reglas de estilos (Angular Material + SCSS)

### Variables globales en `styles/_variables.scss`

```scss
// Paleta TourVisit
$primary: #2E7D5C;      // verde turismo
$accent: #F5A623;       // naranja CTA
$warn: #D32F2F;

// Spacing system (usar siempre múltiplos de 8px)
$spacing-xs: 8px;
$spacing-sm: 16px;
$spacing-md: 24px;
$spacing-lg: 40px;
$spacing-xl: 64px;
```

### Mobile-first obligatorio

```scss
// CORRECTO
.tour-grid {
  display: grid;
  grid-template-columns: 1fr;                    // mobile

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);       // tablet
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);       // desktop
  }
}
```

### No usar estilos inline en templates Angular

```html
<!-- INCORRECTO -->
<mat-card style="margin: 16px; padding: 24px;">

<!-- CORRECTO -->
<mat-card class="tour-card">
```

---

## Reglas de testing

### Frontend — Karma/Jasmine, cobertura mínima 80%

```typescript
// Siempre hacer mock de servicios HTTP con HttpClientTestingModule
describe('TourService', () => {
  let service: TourService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TourService],
    });
    service = TestBed.inject(TourService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());
});
```

### Backend — Jest

```typescript
// Usar jest.mock() para TypeORM repositories
jest.mock('../repositories/booking.repository');

describe('BookingService', () => {
  it('debe crear reserva y evento de calendar', async () => {
    const mockRepo = { save: jest.fn().mockResolvedValue(mockBooking) };
    // ...
  });
});
```

---

## Errores comunes a evitar

| Error | Solución |
|---|---|
| Suscribirse manualmente sin desuscribirse | Usar `async pipe` en templates o `takeUntilDestroyed()` |
| Lógica de negocio en componentes | Mover siempre a servicios en `core/services/` |
| Variables de entorno de Google/Stripe en el frontend | Solo `publicKey` en frontend, secrets solo en backend |
| `synchronize: true` en producción con TypeORM | Solo en dev, migraciones en producción |
| Crear eventos de Calendar desde el frontend | Siempre a través del backend |
| Confirmar pagos Stripe solo con callback del frontend | Validar siempre vía webhook en el backend |
| Llamadas directas a API sin interceptor de error | Usar el `ErrorInterceptor` de `core/interceptors/` |
| Importar módulo entero de Firebase (compat) | Usar SDK modular con imports específicos |

---

## Checklist antes de entregar código

- [ ] TypeScript en strict mode sin `any` explícitos
- [ ] Componente usa `ChangeDetectionStrategy.OnPush`
- [ ] No hay suscripciones sin `async pipe` o `takeUntilDestroyed()`
- [ ] Interfaces en `core/models/`, no inline
- [ ] Tests unitarios escritos (cobertura >= 80%)
- [ ] Sin `console.log` en producción (usar el `LoggerService`)
- [ ] Variables de entorno usadas, sin valores hardcodeados
- [ ] SCSS mobile-first con variables del sistema de diseño
- [ ] Lazy loading activo en el módulo de features correspondiente
- [ ] Accesibilidad: atributos `aria-label` en elementos interactivos
