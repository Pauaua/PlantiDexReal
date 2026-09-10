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
- Sentry (tracking de errores)
- Maestro (E2E)
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

Completa `.env` con tus credenciales:

```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
EXPO_PUBLIC_SENTRY_DSN=              # opcional en desarrollo
GOOGLE_MAPS_API_KEY=tu-api-key       # Maps SDK for Android habilitado en Google Cloud
```

> Las variables que usa el cliente en tiempo de ejecución deben tener el prefijo `EXPO_PUBLIC_`
> para que Expo las incluya en el bundle. `GOOGLE_MAPS_API_KEY` es la excepción: solo se lee al
> generar la config nativa (`app.config.ts`), nunca se bundlea. Nunca pongas la `service_role key`
> de Supabase en este archivo.

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

## EAS Build (generar un APK de prueba)

La configuración de build vive en `eas.json` con tres perfiles:

- **development**: build con `expo-dev-client` para desarrollo con módulos nativos.
- **preview**: APK instalable directamente en un dispositivo Android, sin pasar por Play Store —
  es el que quieres para repartir un build de prueba.
- **production**: `.aab` (App Bundle) para subir a Google Play.

Pasos (una sola vez):

```bash
npx eas-cli login          # inicia sesión con tu cuenta de expo.dev
npx eas-cli init           # crea el proyecto en EAS y te da un projectId
```

`eas init` te va a mostrar un `projectId` (un UUID). Como el proyecto usa `app.config.ts`
(no `app.json`), EAS no puede escribirlo automáticamente — pégalo tú en `app.config.ts`,
en `extra.eas.projectId`, o expórtalo como `EAS_PROJECT_ID` en tu `.env`.

Luego, para generar el APK de prueba:

```bash
npm run build:android:preview
```

Esto sube el proyecto a EAS, lo compila en la nube, y al terminar te da un link para descargar
el `.apk` e instalarlo directo en un dispositivo Android (o un link QR desde la CLI).

> Las variables de entorno (`EXPO_PUBLIC_SUPABASE_URL`, etc.) que necesita el build en la nube
> **no** se leen de tu `.env` local — debes cargarlas como [EAS Environment Variables](https://docs.expo.dev/eas/environment-variables/):
> `npx eas-cli env:create --scope project` (una vez por variable), o subir tu `.env` con
> `npx eas-cli env:push`.

## Tracking de errores (Sentry)

`lib/sentry.ts` inicializa el SDK (`Sentry.init`) al cargar `app/_layout.tsx`, y el layout raíz
está envuelto con `Sentry.wrap(...)` para captura automática de errores y trazas de navegación.
Si `EXPO_PUBLIC_SENTRY_DSN` no está seteada, queda deshabilitado (`enabled: false`) — no rompe
nada en desarrollo sin cuenta de Sentry.

Para activarlo:

1. Crea una cuenta/proyecto en [sentry.io](https://sentry.io) (plataforma: React Native).
2. Copia el **DSN** que te da (Settings → Projects → tu proyecto → Client Keys).
3. En tu `.env`, descomenta y completa:
   ```
   EXPO_PUBLIC_SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
   ```
4. Si vas a compilar con EAS, súbela también al entorno correspondiente:
   ```bash
   npx eas-cli env:push --environment preview --path .env
   ```

## Tests

```bash
npm run test
npm run test:watch
npm run test:coverage
```

Usamos Jest (`jest-expo` preset) + React Native Testing Library. Los tests viven junto a cada
feature en carpetas `__tests__/`.

### E2E con Maestro

Los flujos viven en `.maestro/flows/*.yaml` (smoke test de login, validación de formulario,
navegación entre login/registro). Corren contra un build instalado en un emulador/dispositivo
(no contra el bundle de desarrollo), así que primero necesitas un APK — el `preview` que genera
EAS Build sirve.

1. Instala el CLI de Maestro (una sola vez, fuera de este repo):
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```
   (En Windows, usa WSL — Maestro no tiene build nativo para Windows.)
2. Instala el APK en un emulador/dispositivo Android conectado.
3. Corre los flujos:
   ```bash
   npm run e2e                                    # todos los flujos
   maestro test .maestro/flows/smoke-test.yaml    # uno en particular
   ```

Los flujos existentes no requieren una cuenta de prueba (solo validan pantallas de auth). Un
flujo de "crear especie" de punta a punta (cámara + GPS + guardar) es el siguiente paso natural
a agregar aquí, siguiendo el mismo patrón — avísame cuando quieras que lo escriba.

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
7. ✅ Revisión de accesibilidad y tema oscuro/verde en todas las pantallas
8. ✅ EAS Build para generar APK de prueba (configurado — falta que corras `eas init` y `eas build`
   con tu cuenta de expo.dev)
