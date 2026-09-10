# Plantidex

Reescritura completa de Plantidex en React Native (Expo). Registro de especies nativas
offline-first, con mapeo comunitario en tiempo real vía Supabase + PostGIS.

> Este repo está en construcción por etapas. Estado actual: **scaffold del proyecto y
> tooling de calidad**. Autenticación, modelo de datos local y features aún no implementados.

## Stack

- Expo (managed) + Expo Router
- TypeScript estricto
- Zustand (estado UI local) + TanStack Query (estado de servidor)
- Supabase (Postgres + Auth + Storage + Realtime + PostGIS)
- expo-sqlite + Drizzle ORM (base de datos local offline-first)
- MMKV (cache liviana de sesión/preferencias)
- React Hook Form + Zod
- NativeWind (theming oscuro + verde)
- react-native-maps + react-native-map-clustering
- expo-camera / expo-image-picker / expo-location
- Jest + React Native Testing Library
- ESLint + Prettier + Husky + lint-staged
- Sentry
- EAS Build

## Requisitos

- Node 20+
- Un proyecto de Supabase (URL + anon key)
- Android Studio / Xcode para compilar nativo (opcional si usas Expo Go para desarrollo)

## Setup

```bash
npm install
cp .env.example .env
```

Completa `.env` con tus credenciales de Supabase:

```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
EXPO_PUBLIC_SENTRY_DSN=   # opcional en desarrollo
```

> Todas las variables de entorno usadas en el cliente deben tener el prefijo `EXPO_PUBLIC_`
> para que Expo las incluya en el bundle. Nunca pongas la `service_role key` aquí.

## Correr el proyecto

```bash
npm run start      # Metro bundler, elige plataforma desde la CLI
npm run android
npm run ios
npm run web
```

## Calidad de código

```bash
npm run lint          # ESLint
npm run lint:fix
npm run format         # Prettier
npm run typecheck      # tsc --noEmit (modo estricto)
```

Husky corre `lint-staged` (ESLint + Prettier sobre los archivos en stage) antes de cada commit.

## Base de datos local

El esquema vive en `db/schema.ts` (Drizzle sobre `expo-sqlite`). Las migraciones se aplican
automáticamente al abrir la app (`db/useDatabaseMigrations.ts`, llamado desde el layout raíz).

Si cambias `db/schema.ts`, genera la migración correspondiente y commitea el resultado
(`db/migrations/*.sql` + `migrations.js`):

```bash
npm run db:generate
```

## Backend remoto (Supabase)

El esquema remoto (tabla `species` con PostGIS, RPCs `upsert_species`/`soft_delete_species`/
`nearby_species`, políticas RLS y el bucket de Storage `species-photos`) vive en
`supabase/migrations/0001_species_postgis.sql`. Cópialo y ejecútalo una vez en el **SQL Editor**
de tu proyecto de Supabase (Project → SQL Editor → New query → pegar → Run).

La sincronización local→remoto corre en `features/sync/syncEngine.ts`: drena la cola de cambios
pendientes (`sync_queue`), sube la foto a Storage si corresponde, y hace upsert vía RPC. Se
dispara automáticamente (`useAutoSync`, en el layout raíz) al iniciar sesión, al volver la app a
foreground y al recuperar conexión; usa "el último cambio gana" (sobrescribe por timestamp, sin
merge) ya que cada especie solo la edita su propio autor.

## Tests

```bash
npm run test
npm run test:watch
npm run test:coverage
```

Usamos Jest (`jest-expo` preset) + React Native Testing Library. Los tests viven junto a cada
feature en carpetas `__tests__/`. E2E con Maestro está planeado (carpeta `.maestro/` como
placeholder) pero aún no implementado.

## Estructura del proyecto

```
app/                  # Rutas (Expo Router) — solo composición de pantallas
features/             # Lógica de dominio por feature (auth, species, map, sync)
  <feature>/
    components/
    hooks/
    services/         # repositorios: única capa que habla con Supabase/SQLite
    schemas/
    __tests__/
db/                    # Esquema Drizzle (SQLite local) y migraciones
lib/                   # Clientes (Supabase, MMKV), tema, permisos, env
components/ui/         # Componentes de UI genéricos, sin lógica de dominio
store/                 # Zustand (estado de UI local)
```

Regla de arquitectura: los componentes de UI **nunca** importan Supabase ni el cliente SQLite
directamente. Toda persistencia pasa por un repositorio en `features/<feature>/services/`, lo
que permite testear la UI con repos mockeados.

## Roadmap de este repo

1. ✅ Scaffold (Expo Router, TS estricto, NativeWind, tooling de calidad)
2. ✅ Autenticación con Supabase
3. ✅ Modelo de datos local (Drizzle) + repositorio de especies con tests
4. ✅ Registro de especies (formulario + cámara + GPS) con cola de sincronización offline
5. ✅ Listado y detalle de especies vía TanStack Query
6. ✅ Mapa comunitario con clustering
7. ⬜ Revisión de accesibilidad y tema oscuro/verde en todas las pantallas
8. ⬜ EAS Build para generar APK de prueba
