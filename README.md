# KinEstilistas

Aplicación web B2B desarrollada como **Trabajo Fin de Grado** para digitalizar y centralizar la gestión entre un distribuidor de productos profesionales de peluquería y sus clientes.

El objetivo del proyecto es ofrecer una plataforma única desde la que administrar accesos, usuarios, clientes, operaciones comerciales y futuras funcionalidades de catálogo, rutas, visitas y seguimiento, todo ello con una base técnica moderna, mantenible y escalable.

---

## Descripción del proyecto

KinEstilistas nace como una propuesta de transformación digital para un entorno en el que gran parte de la operativa suele estar dispersa entre hojas de cálculo, herramientas aisladas y procesos manuales.

La aplicación busca resolver ese problema mediante una arquitectura web moderna con distintos roles de usuario y una estructura modular que facilite su ampliación progresiva.

Actualmente, el proyecto ya incorpora una base funcional sólida para:

- autenticación de usuarios con control de acceso por rol,
- gestión de solicitudes de acceso,
- administración de usuarios,
- auditoría y trazabilidad de accesos,
- base de datos relacional con migraciones versionadas,
- primeros cimientos para módulos comerciales y de clientes.

---

## Objetivos

- Centralizar la gestión interna del sistema en una única aplicación.
- Mejorar la trazabilidad de accesos y acciones administrativas.
- Facilitar la escalabilidad del sistema mediante módulos.
- Diferenciar claramente las funcionalidades según el tipo de usuario.
- Sentar una base técnica válida para un entorno real de producción.

---

## Roles del sistema

La aplicación está planteada para trabajar con varios perfiles:

- **Administrador**: supervisa usuarios, solicitudes, configuración y operaciones internas.
- **Comercial**: enfocado a gestión comercial, clientes, visitas y rutas.
- **Cliente**: acceso a su espacio dentro de la plataforma.

---

## Estado del proyecto

Proyecto en desarrollo.

A día de hoy ya existe una base funcional orientada a:

- gestión de acceso y autenticación,
- protección de rutas privadas,
- segregación por roles,
- trazabilidad de sesiones y eventos de acceso,
- migraciones modulares de base de datos,
- estructura preparada para seguir ampliando módulos de negocio.

---

## Stack tecnológico

### Frontend y aplicación web
- **Next.js**
- **React**
- **TypeScript**
- **App Router**
- **Tailwind CSS**
- **Framer Motion**

### Autenticación y seguridad
- **Auth.js / NextAuth**
- Proveedor de credenciales
- Sesiones basadas en JWT
- Protección de rutas mediante `proxy.ts`

### Persistencia y backend
- **PostgreSQL**
- **TypeORM**
- **Docker Compose**
- Migraciones versionadas

### Servicios adicionales
- **Cloudinary** para la gestión de imágenes

### Documentación
- **LaTeX** para la documentación técnica del TFG

---

## Estructura del repositorio

```text
.
├── docker-compose.yml              # Base de datos PostgreSQL en Docker
├── app-tfg/                        # Aplicación principal
│   ├── app/                        # Rutas, páginas, API y componentes
│   ├── lib/                        # Lógica compartida, auth, utils, TypeORM
│   ├── migrations/typeorm/         # Migraciones versionadas
│   ├── public/                     # Recursos estáticos
│   ├── auth.ts                     # Configuración de autenticación
│   ├── proxy.ts                    # Protección de rutas y compatibilidad
│   └── package.json
└── docs/
    └── docs/                       # Documentación técnica en LaTeX
````

> **Importante:** la aplicación no está en la raíz del repositorio, sino dentro de la carpeta `app-tfg/`.

---

## Funcionalidades principales

### 1. Autenticación y acceso

* Inicio de sesión con credenciales.
* Control de acceso según rol.
* Protección de rutas privadas.
* Redirecciones automáticas según el tipo de usuario.

### 2. Gestión de usuarios

* Registro y solicitudes de acceso.
* Administración de usuarios desde panel interno.
* Cambio de estado y control de permisos.

### 3. Auditoría y trazabilidad

* Registro de intentos de acceso.
* Registro de inicios de sesión correctos e incorrectos.
* Seguimiento de eventos relacionados con sesiones.

### 4. Base para gestión comercial

* Estructura inicial para clientes.
* Base para rutas comerciales.
* Base para visitas comerciales.

### 5. Documentación técnica

* Memoria del TFG mantenida en paralelo al desarrollo.
* Organización por secciones y anexos en LaTeX.

---

## Requisitos previos

Antes de arrancar el proyecto, necesitas tener instalado:

* **Node.js** 20 o superior
* **npm**
* **Docker Desktop** o un entorno compatible con Docker
* **Git**

---

## Puesta en marcha en local

### 1. Clonar el repositorio

```bash
git clone https://github.com/MadaoSurmanito/app-tfg.git
cd app-tfg
```

### 2. Levantar la base de datos

Desde la raíz del repositorio:

```bash
docker compose up -d
```

### 3. Entrar en la aplicación

```bash
cd app-tfg
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Configurar variables de entorno

Crea tu archivo `.env.local` dentro de `app-tfg/`.

Variables de base de datos detectadas en el proyecto:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kin
DB_USER=kin
DB_PASSWORD=kin
```

Si vas a usar subida de imágenes con Cloudinary, añade también:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_PROFILE_IMAGES_FOLDER=kinestilistas/profile-images
```

Además, configura las variables necesarias de autenticación para tu entorno.

### 6. Ejecutar migraciones

```bash
npm run migration:run
```

### 7. Arrancar el entorno de desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en:

```text
http://localhost:3000
```

---

## Scripts disponibles

```bash
npm run dev
npm run dev:clean
npm run build
npm run build:clean
npm run start
npm run start:clean
npm run lint
npm run typecheck
npm run migration:create
npm run migration:generate
npm run migration:run
npm run migration:revert
npm run migration:show
```

---

## Arquitectura general

El proyecto sigue una estructura moderna basada en Next.js con App Router, integrando interfaz, rutas del servidor y endpoints internos en una misma aplicación.

La persistencia se apoya en PostgreSQL y TypeORM, mientras que la autenticación se gestiona mediante Auth.js con sesiones JWT. La protección de rutas se centraliza en `proxy.ts`, donde también se contempla compatibilidad mínima de navegador.

Esta organización permite:

* mantener una separación clara entre interfaz, lógica de negocio y acceso a datos,
* evolucionar el sistema por módulos,
* reducir duplicidad de código,
* facilitar despliegue y mantenimiento.

---

## Base de datos y migraciones

La base de datos se gestiona mediante migraciones versionadas, lo que permite:

* reproducir el esquema de forma controlada,
* mantener trazabilidad de cambios,
* evolucionar módulos sin depender de scripts manuales aislados.

El proyecto ya incluye migraciones organizadas por módulos, con especial foco en:

* **M1**: acceso, usuarios, auditoría y datos base,
* **M2**: primeras tablas orientadas a gestión comercial.

---

## Documentación

La documentación técnica del proyecto se mantiene en paralelo dentro de la carpeta:

```text
docs/docs
```

Incluye una estructura en LaTeX orientada a la memoria del TFG, organizada por secciones, configuración, bibliografía y anexos.

---

## Líneas de evolución

El proyecto está preparado para seguir creciendo con nuevas funcionalidades, entre ellas:

* gestión avanzada de clientes,
* seguimiento comercial,
* rutas y visitas,
* catálogo de productos,
* pedidos,
* cuadros de mando,
* mejoras de seguridad y rendimiento.

---

## Autor

**Alejandro Sanz Huerta**

Proyecto desarrollado como **Trabajo Fin de Grado**.

---

## Notas finales

Este repositorio recoge tanto el desarrollo de la aplicación como parte de la documentación técnica asociada al proyecto.

La intención no es solo construir una aplicación funcional, sino también definir una base arquitectónica y documental sólida sobre la que seguir iterando y ampliando funcionalidades.