# Equipos de Iglesia

Webapp para gestionar los equipos de trabajo de una iglesia: crear
equipos, añadir personas, planificar servicios/eventos y asignar quién
sirve en cada puesto, con confirmación por parte de cada persona.

## Roles

- **Admin principal**: control total sobre toda la app (crear equipos,
  gestionar personas, ascender a otros admins).
- **Líder de equipo**: gestiona solo su(s) propio(s) equipo(s) — añade
  personas, crea servicios y asigna puestos.
- **Miembro**: ve sus asignaciones y las confirma o rechaza.

El primer usuario que se registra en la app se convierte
automáticamente en admin principal.

## Datos que se guardan

Lo mínimo: nombre (puede ser cualquiera, no hace falta que sea el
legal), email y contraseña (cifrada). Nada más.

## Requisitos

- Node.js 20+
- PostgreSQL

## Puesta en marcha

1. Copia `.env.example` a `.env` y ajusta `DATABASE_URL`, genera un
   `AUTH_SECRET` con `openssl rand -base64 32`, y elige un
   `REGISTRATION_CODE` (el código que la gente tendrá que escribir para
   poder crear una cuenta).
2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Aplica el esquema de base de datos:

   ```bash
   npx prisma migrate deploy
   ```

4. Arranca el servidor:

   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000) y regístrate:
   la primera cuenta creada será el admin principal.

## Stack técnico

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma + PostgreSQL,
NextAuth (login por email/contraseña).
