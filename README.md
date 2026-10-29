# InstrumentData_7B

Aplicación web para gestionar un inventario de instrumentos con registro, edición, eliminación, fotografía y persistencia real en PostgreSQL.

## Requisitos

- Node.js 18+
- npm
- PostgreSQL
- Cuenta de Vercel con Vercel Blob habilitado

## Instalación

1. En la raíz del proyecto, ejecutá:

```bash
npm install
```

2. Copiá `.env.example` a `.env.local` y completá los valores reales:

```bash
cp .env.example .env.local
```

Ejemplo:

```bash
POSTGRES_URL="postgres://postgres:mysecretpassword@localhost:5432/instrumentdata"
POSTGRES_URL_NON_POOLING="postgres://postgres:mysecretpassword@localhost:5432/instrumentdata"
POSTGRES_USER="postgres"
POSTGRES_HOST="localhost"
POSTGRES_PASSWORD="mysecretpassword"
POSTGRES_DATABASE="instrumentdata"
BLOB_READ_WRITE_TOKEN="tu_token_de_vercel_blob"
```

## Crear la base de datos y la tabla

### PostgreSQL local

```sql
CREATE DATABASE instrumentdata;
```

Luego ejecutá:

```sql
CREATE TABLE IF NOT EXISTS instruments (
  id SERIAL PRIMARY KEY,
  loader_name VARCHAR(255) NOT NULL,
  instrument_name VARCHAR(255) NOT NULL,
  part_number VARCHAR(255) NOT NULL,
  serial_number VARCHAR(255) NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### PostgreSQL en Vercel

Usá la misma definición SQL desde la consola de Vercel Postgres o desde algún cliente conectado a la base del proyecto.

## Ejecutar localmente

```bash
npm run dev
```

Abrí:

- http://localhost:3000

## Construir para producción

```bash
npm run build
npm run start
```

## Desplegar en Vercel

1. Subí este repositorio a GitHub.
2. Importá el proyecto en Vercel.
3. En la configuración del proyecto, agregá las mismas variables de entorno definidas en `.env.local`.
4. Asegurate de tener habilitado Vercel Blob y su token con permisos de escritura.
5. Desplegá la app.

## Dependencias instaladas

- next
- react
- react-dom
- @vercel/postgres
- @vercel/blob

## Cómo probarla localmente

1. Crear la base de datos y la tabla de instrumentos.
2. Copiar `.env.local` con las credenciales.
3. Ejecutar `npm install`.
4. Ejecutar `npm run dev`.
5. Cargar un instrumento con nombre del responsable, nombre del instrumento, parte, serie y fotografía.
6. Verificar que el registro quede visible en la tabla y permanezca después de reiniciar la app.

## Funcionalidades principales

- CRUD completo de instrumentos
- Formulario de alta con validaciones
- Edición y eliminación desde la vista principal
- Carga de imagen desde la computadora
- Almacenamiento de fotos en Vercel Blob
- Persistencia real en PostgreSQL
- Diseño responsive para móvil y escritorio
