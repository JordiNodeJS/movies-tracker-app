# 🎬 Movies Tracker App

Una aplicación web para gestionar y hacer seguimiento de películas, construida con Next.js 16, Prisma ORM, Neon Serverless Postgres y TMDB API.

## 📋 Información de la Base de Datos

### 🗄️ Configuración Neon

- **Proyecto:** `movies-tracker` (ID: `billowing-grass-71670123`)
- **Base de datos:** `neondb`
- **Esquema principal:** `movies_tracker_app_2` ✅
- **Versión PostgreSQL:** 17

### 📊 Tablas del Esquema `movies_tracker_app_2`

| Tabla              | Descripción                            |
| ------------------ | -------------------------------------- |
| `users`            | Usuarios registrados (autenticación)   |
| `watchlist_items`  | Películas en la lista de seguimiento   |
| `ratings`          | Valoraciones de películas por usuarios |
| `notes`            | Notas personales sobre películas       |
| `recommendations`  | Recomendaciones de películas           |
| `user_preferences` | Preferencias de usuario                |
| `view_history`     | Historial de visualización             |
| `genre_cache`      | Cache de géneros de películas          |

## 🚀 Tecnologías Utilizadas

- **Frontend:** Next.js 16 (App Router), React Server Components
- **Backend:** Server Actions, API Routes
- **Base de datos:** Neon Serverless Postgres con Prisma ORM
- **API Externa:** TMDB API para datos de películas
- **Autenticación:** JWT con cookies HTTP-only
- **Estilos:** Tailwind CSS 4
- **Internacionalización:** next-intl (español, catalán, inglés)

## 🛠️ Instalación y Configuración

### Requisitos Previos

- Node.js 18+
- pnpm (v10+)
- Cuenta en [Neon](https://neon.tech)
- Token de acceso de [TMDB API](https://www.themoviedb.org/settings/api)

### Variables de Entorno

Crea un archivo `.env.local` con:

```bash
# Base de datos Neon
DATABASE_URL="postgresql://usuario:password@host/neondb?sslmode=require"

# TMDB API
TMDB_ACCESS_TOKEN="tu_token_de_tmdb"

# JWT Secret
JWT_SECRET="tu_secreto_jwt_seguro"
```

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JordiNodeJS/movies-tracker-app.git
cd movies-tracker-app

# Instalar dependencias
pnpm install

# Generar cliente Prisma
pnpm prisma generate

# Sincronizar base de datos
pnpm db:push

# Iniciar servidor de desarrollo
pnpm dev
```

## 📖 Uso

La aplicación permite:

- ✅ Registro y autenticación de usuarios
- ✅ Búsqueda de películas via TMDB API
- ✅ Gestión de lista de seguimiento personal
- ✅ Valoración de películas (1-5 estrellas)
- ✅ Añadir notas personales a películas
- ✅ Recomendaciones personalizadas
- ✅ Historial de visualización
- ✅ Múltiples idiomas (ES/CA/EN)

## 🏗️ Arquitectura

### Estructura de Carpetas

```
src/
├── app/              # Next.js App Router
├── components/       # Componentes React
├── lib/             # Utilidades y configuraciones
├── hooks/           # Custom hooks
└── i18n/            # Internacionalización
```

### Patrones de Desarrollo

- **Server Components:** Para renderizado en servidor
- **Server Actions:** Para mutaciones y formularios
- **Caching:** Next.js cache para optimización
- **Validación:** Validación de datos en servidor

## 🧪 Comandos Disponibles

```bash
# Desarrollo
pnpm dev              # Iniciar servidor de desarrollo

# Construcción
pnpm build            # Construir para producción
pnpm start            # Iniciar servidor de producción

# Base de datos
pnpm db:push          # Sincronizar esquema con base de datos
pnpm db:studio        # Abrir Prisma Studio

# Calidad de código
pnpm lint             # Ejecutar ESLint
pnpm type-check       # Verificar tipos TypeScript
```

## 🚀 Despliegue

La aplicación está optimizada para desplegar en [Vercel](https://vercel.com):

1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno
3. Despliega automáticamente con cada push a `main`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
