**🌍 TOURVISIT**

Plataforma Web de Visitas Turísticas

**HOJA DE REQUERIMIENTOS DEL SISTEMA**

Versión 1.0 \| Marzo 2026 \| Confidencial

**Control de Versiones**

  ------------- ------------ ------------------------- ----------------------
  **Versión**   **Fecha**    **Descripción**           **Autor**

  1.0           2026-03-19   Documento inicial de      Equipo de Desarrollo
                             requerimientos            
  ------------- ------------ ------------------------- ----------------------

**1. Introducción**

**1.1 Propósito del Documento**

Este documento define los requerimientos funcionales y no funcionales
para el desarrollo de TourVisit, una plataforma web de gestión y reserva
de visitas turísticas. Sirve como contrato técnico entre el equipo de
desarrollo y los stakeholders del proyecto.

**1.2 Alcance del Proyecto**

TourVisit es una aplicación web de una sola página (SPA) desarrollada en
Angular 17+, orientada a conectar turistas con experiencias culturales y
naturales locales. Entre sus funcionalidades principales se incluyen:

-   Catálogo de tours y visitas turísticas

-   Sistema de reservas con integración a Google Calendar

-   Procesamiento de pagos en línea mediante Stripe

-   Panel de administración para gestores de tours

-   Visualización de rutas en mapas interactivos

-   Sistema de valoraciones y reseñas

**1.3 Definiciones y Acrónimos**

-   SPA: Single Page Application

-   API: Application Programming Interface

-   JWT: JSON Web Token

-   CRUD: Create, Read, Update, Delete

-   CI/CD: Continuous Integration / Continuous Deployment

-   UX/UI: Experiencia e Interfaz de Usuario

-   SSR: Server-Side Rendering

-   WCAG: Web Content Accessibility Guidelines

**1.4 Stakeholders**

-   Turistas y visitantes --- usuarios finales del sistema

-   Guías y operadores turísticos --- gestionan y ofrecen sus servicios

-   Administradores del sistema --- supervisan la plataforma

-   Equipo de desarrollo --- responsables de implementación

**2. Stack Tecnológico**

El sistema se desarrollará con las siguientes tecnologías, herramientas
y plataformas:

  ------------------ ------------------ ---------------------------------
  **Capa**           **Tecnología**     **Justificación**

  **Frontend**       Angular 17+        Framework principal, rendimiento
                                        y escalabilidad

  **Lenguaje**       TypeScript         Tipado estático, mejor
                                        mantenimiento de código

  **Estilos**        Angular Material + Diseño coherente y responsivo
                     SCSS               

  **Mapas**          Google Maps API    Visualización de rutas y puntos
                                        turísticos

  **Calendario**     Google Calendar    Gestión de reservas y
                     API                disponibilidad

  **Auth**           Firebase           Login social y gestión de
                     Authentication     usuarios

  **Backend**        Node.js + Express  API REST para lógica de negocio

  **Base de Datos**  PostgreSQL         Almacenamiento relacional de
                                        datos

  **ORM**            TypeORM            Mapeo objeto-relacional con
                                        TypeScript

  **Pagos**          Stripe             Procesamiento seguro de pagos en
                                        línea

  **Despliegue**     Firebase Hosting / Hosting escalable y CI/CD
                     GCP                integrado

  **IDE**            Visual Studio Code Editor principal con extensiones
                                        Angular
  ------------------ ------------------ ---------------------------------

**2.1 Entorno de Desarrollo**

-   IDE: Visual Studio Code con extensiones Angular Language Service,
    ESLint, Prettier

-   Control de versiones: Git + GitHub con flujo GitFlow

-   Node.js LTS (v20+) y Angular CLI

-   Docker para entorno de desarrollo local homogéneo

-   Postman para pruebas de API REST

**3. Requerimientos Funcionales**

A continuación se listan todos los requerimientos funcionales del
sistema, clasificados por prioridad (Alta, Media, Baja) y versión
objetivo:

  ----------- ------------------------------- --------------- ------------- ---------------
  **ID**      **Descripción**                 **Prioridad**   **Versión**   **Estado**

  **RF-01**   Catálogo de visitas turísticas  **Alta**        1.0           **Pendiente**

  **RF-02**   Detalle de visita con galería   **Alta**        1.0           **Pendiente**
              de imágenes                                                   

  **RF-03**   Búsqueda y filtrado de visitas  **Alta**        1.0           **Pendiente**

  **RF-04**   Registro y login de usuarios    **Alta**        1.0           **Pendiente**

  **RF-05**   Reserva de citas con Google     **Alta**        1.0           **Pendiente**
              Calendar                                                      

  **RF-06**   Selección de fecha y hora       **Alta**        1.0           **Pendiente**
              disponibles                                                   

  **RF-07**   Confirmación de reserva por     **Alta**        1.0           **Pendiente**
              email                                                         

  **RF-08**   Gestión de reservas (ver,       **Alta**        1.0           **Pendiente**
              editar, cancelar)                                             

  **RF-09**   Integración de mapa interactivo **Media**       1.0           **Pendiente**

  **RF-10**   Valoraciones y reseñas de       **Media**       1.0           **Pendiente**
              usuarios                                                      

  **RF-11**   Pasarela de pago (Stripe)       **Alta**        1.0           **Pendiente**

  **RF-12**   Panel de administración de      **Alta**        1.0           **Pendiente**
              tours                                                         

  **RF-13**   Gestión de guías turísticos     **Media**       1.1           **Pendiente**

  **RF-14**   Notificaciones push y           **Baja**        1.1           **Pendiente**
              recordatorios                                                 

  **RF-15**   ~~Sistema de descuentos y cupones~~ **Baja**   1.1           **Descartado**

  **RF-16**   Multi-idioma (ES / EN)          **Media**       1.1           **Pendiente**

  **RF-17**   Informes y estadísticas para    **Media**       1.2           **Pendiente**
              admin                                                         

  **RF-18**   Política de cancelación con     **Alta**        1.0           **Pendiente**
              reembolso según plazo (100% >                                 
              7 días / 75% ≤ 7 días)                                        
  ----------- ------------------------------- --------------- ------------- ---------------

**4. Descripción Detallada de Módulos**

**4.1 Módulo de Catálogo Turístico**

El núcleo de la plataforma. Mostrará el listado de visitas disponibles
con funcionalidades avanzadas de búsqueda.

-   Listado en cuadrícula y lista con paginación lazy-loading

-   Filtros por: categoría, precio, duración, valoración, idioma del
    tour, fecha

-   Página de detalle con galería fotográfica, descripción completa,
    mapa embebido e itinerario

-   Sistema de favoritos para usuarios autenticados

-   Compartir en redes sociales y generación de enlace permanente

**4.2 Módulo de Reservas y Google Calendar**

Funcionalidad central del proyecto. La integración con Google Calendar
permitirá a los usuarios ver disponibilidad real y crear eventos
automáticamente en su calendario personal.

-   Selector visual de calendario con fechas disponibles resaltadas

-   Elección de horario según slots configurados por el operador

-   Confirmación automática con evento en Google Calendar del usuario

-   Recordatorio por email 24 horas antes de la visita

-   Sincronización bidireccional: cancelaciones se reflejan en Google
    Calendar

-   El operador puede bloquear fechas o modificar capacidad máxima

**4.3 Módulo de Autenticación**

-   Registro con email y contraseña + verificación de correo

-   Login social con Google OAuth 2.0 (Firebase Authentication)

-   Recuperación de contraseña por email

-   Gestión de roles: Turista, Operador, Administrador

-   Cierre de sesión con invalidación de token JWT

**4.4 Módulo de Pagos (Stripe)**

-   Selección del número de participantes con precio dinámico

-   Formulario de pago seguro con Stripe Elements

-   Pago del importe total en el momento de la reserva (sin pago aplazado ni depósitos)

-   Soporte para tarjetas de crédito/débito y Apple Pay / Google Pay

-   Generación automática de factura en PDF por email

-   Política de cancelación y reembolso:
    -   Cancelación con **más de 7 días** de antelación: reembolso del **100%** del importe
    -   Cancelación con **7 días o menos**: reembolso del **75%** (retención del 25% como penalización)

-   Gestión de divisas y precios en EUR por defecto

**4.5 Mapa Interactivo (Google Maps)**

-   Visualización de todos los tours disponibles en el mapa

-   Clúster de marcadores para zonas con múltiples tours

-   Detalle de tour al hacer clic sobre el marcador

-   Trazado de ruta de la visita con waypoints

-   Indicación del punto de encuentro y de fin de ruta

**4.6 Panel de Administración**

-   Dashboard con KPIs: reservas del día, ingresos, ocupación

-   CRUD completo de tours: crear, editar, publicar, archivar

-   Gestión de reservas: ver estado, cancelar, reembolsar

-   Gestión de usuarios y roles

-   Moderación de reseñas y comentarios

-   Exportación de informes en CSV y PDF

**5. Requerimientos No Funcionales**

  ------------ -------------------- --------------------------------- ---------------
  **ID**       **Categoría**        **Requerimiento**                 **Métrica**

  **RNF-01**   **Rendimiento**      La app debe cargar en menos de 3  LCP \< 3s
                                    segundos en conexión estándar     

  **RNF-02**   **Rendimiento**      Las búsquedas deben responder en  \< 500 ms
                                    menos de 500ms                    

  **RNF-03**   **Disponibilidad**   El sistema debe estar disponible  99.5% uptime
                                    el 99.5% del tiempo               

  **RNF-04**   **Seguridad**        Comunicaciones cifradas con TLS   HTTPS
                                    1.3                               obligatorio

  **RNF-05**   **Seguridad**        Tokens JWT con expiración de 1    JWT + Refresh
                                    hora para autenticación           

  **RNF-06**   **Escalabilidad**    Soportar hasta 5.000 usuarios     5K concurrent
                                    concurrentes                      

  **RNF-07**   **Accesibilidad**    Cumplir estándar WCAG 2.1 nivel   WCAG 2.1 AA
                                    AA                                

  **RNF-08**   **Responsividad**    Diseño adaptable a móvil, tablet  Mobile-first
                                    y escritorio                      

  **RNF-09**   **SEO**              Implementar Server-Side Rendering SSR activo
                                    con Angular Universal             

  **RNF-10**   **Mantenibilidad**   Cobertura mínima de tests         \>= 80%
                                    unitarios del 80%                 coverage
  ------------ -------------------- --------------------------------- ---------------

**6. Estructura de Módulos del Sistema**

  -------------------- --------------------------------- ------------------
  **Módulo**           **Funcionalidades**               **Responsable**

  **Catálogo           Listado, detalle, búsqueda,       Frontend Dev
  Turístico**          filtros, galería                  

  **Autenticación**    Registro, login, OAuth Google,    Full-Stack Dev
                       recuperar contraseña              

  **Reservas &         Disponibilidad, citas, Google     Full-Stack Dev
  Calendario**         Calendar API, confirmación        

  **Pagos**            Integración Stripe, facturas,     Backend Dev
                       reembolsos                        

  **Mapa Interactivo** Google Maps, rutas, puntos de     Frontend Dev
                       interés                           

  **Reseñas & Rating** Valoraciones, comentarios,        Full-Stack Dev
                       moderación                        

  **Panel Admin**      Gestión de tours, reservas,       Full-Stack Dev
                       usuarios, estadísticas            

  **Notificaciones**   Email, push notifications,        Backend Dev
                       recordatorios                     
  -------------------- --------------------------------- ------------------

**7. Arquitectura del Sistema**

**7.1 Arquitectura General**

El sistema seguirá una arquitectura de tres capas con separación clara
entre frontend, backend y base de datos:

-   Frontend (Angular SPA): Comunica con el backend mediante API REST y
    con servicios de Google directamente mediante sus SDKs (Maps,
    Calendar, Auth)

-   Backend (Node.js + Express): API REST que gestiona la lógica de
    negocio, autenticación y comunicación con base de datos y servicios
    externos

-   Base de datos (PostgreSQL): Almacenamiento persistente de datos con
    TypeORM como capa de abstracción

**7.2 Estructura de Carpetas Angular**

-   src/app/core/ --- Servicios singleton, guards, interceptors

-   src/app/shared/ --- Componentes reutilizables, pipes, directivas

-   src/app/features/ --- Módulos lazy-loaded por funcionalidad

-   src/app/features/catalog/ --- Catálogo de tours

-   src/app/features/booking/ --- Flujo de reserva

-   src/app/features/auth/ --- Autenticación

-   src/app/features/admin/ --- Panel de administración

-   src/environments/ --- Variables de entorno por stage

**7.3 APIs Externas Necesarias**

-   Google Calendar API v3 --- Gestión de eventos y disponibilidad

-   Google Maps JavaScript API --- Mapas y geocodificación

-   Google OAuth 2.0 --- Autenticación social

-   Stripe API --- Procesamiento de pagos

-   SendGrid API --- Envío de emails transaccionales

**8. Cronograma Estimado**

El proyecto se planifica en 10 fases para una duración total estimada de
20 semanas (5 meses):

  ---------- ----------------------- --------------- --------------- -------------
  **Fase**   **Actividades**         **Inicio**      **Fin**         **Semanas**

  **1**      Análisis y diseño       Sem 1           Sem 2           **2**
             UX/UI, arquitectura                                     

  **2**      Configuración del       Sem 3           Sem 3           **1**
             entorno, CI/CD,                                         
             estructura Angular                                      

  **3**      Módulo de catálogo,     Sem 4           Sem 6           **3**
             búsqueda y mapas                                        

  **4**      Autenticación y gestión Sem 7           Sem 8           **2**
             de usuarios                                             

  **5**      Módulo de reservas +    Sem 9           Sem 11          **3**
             Google Calendar API                                     

  **6**      Integración de pagos    Sem 12          Sem 13          **2**
             con Stripe                                              

  **7**      Panel de administración Sem 14          Sem 15          **2**

  **8**      Reseñas,                Sem 16          Sem 17          **2**
             notificaciones, i18n                                    

  **9**      Testing, QA y           Sem 18          Sem 19          **2**
             correcciones                                            

  **10**     Despliegue en           Sem 20          Sem 20          **1**
             producción y                                            
             documentación                                           
  ---------- ----------------------- --------------- --------------- -------------

**9. Criterios de Aceptación**

**9.1 Criterios Funcionales**

1.  El usuario puede buscar, filtrar y ver el detalle de cualquier tour
    disponible

2.  El usuario puede registrarse, iniciar sesión y gestionar su perfil

3.  El usuario puede realizar una reserva con pago y recibir
    confirmación por email

4.  El evento de reserva aparece correctamente en Google Calendar del
    usuario

5.  El usuario puede cancelar su reserva dentro del plazo establecido

6.  El administrador puede crear, editar y publicar tours desde el panel

7.  El sistema soporta al menos 3 idiomas (ES, EN, FR)

**9.2 Criterios Técnicos**

8.  Puntuación Lighthouse superior a 85 en Performance, Accessibility y
    SEO

9.  Cobertura de tests unitarios (Jest + Karma) superior al 80%

10. Zero errores críticos en análisis de seguridad (OWASP Top 10)

11. Tiempo de respuesta de API \< 200ms en el percentil 95

12. La app funciona correctamente en Chrome, Firefox, Safari y Edge

**10. Riesgos y Mitigaciones**

-   Riesgo: Cambios en la API de Google Calendar --- Mitigación: Capa de
    abstracción del servicio con versiones fijadas

-   Riesgo: Sobrepasar límites de cuota de Google APIs --- Mitigación:
    Implementar caché y monitorización de uso

-   Riesgo: Retrasos en integración de pagos --- Mitigación: Usar
    entorno sandbox de Stripe desde la fase inicial

-   Riesgo: Escalabilidad ante picos de tráfico --- Mitigación: Firebase
    Hosting + Cloud Run autoscaling

-   Riesgo: Vulnerabilidades de seguridad --- Mitigación: Auditorías de
    seguridad en cada sprint

**11. Aprobaciones**

Este documento debe ser revisado y firmado por los responsables antes de
iniciar el desarrollo.

  ----------------------- ----------------------- -----------------------
  **Rol**                 **Nombre**              **Firma / Fecha**

  **Product Owner**                               

  **Tech Lead**                                   

  **UX/UI Designer**                              
  ----------------------- ----------------------- -----------------------
