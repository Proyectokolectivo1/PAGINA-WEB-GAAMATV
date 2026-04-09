# Gaama Tv - Streaming Platform

Plataforma de streaming construida con Next.js y Supabase.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-supabase-anon-key
```

3. Ejecutar el servidor de desarrollo:
```bash
npm run dev
```

4. Abrir [http://localhost:3000](http://localhost:3000)

## Configuración de Supabase

Crea las siguientes tablas en tu proyecto de Supabase:

```sql
-- Canales
CREATE TABLE channels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  number TEXT NOT NULL,
  is_live BOOLEAN DEFAULT false,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Programas
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  channel TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Películas
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  year TEXT NOT NULL,
  rating TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Series
CREATE TABLE series (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  years TEXT NOT NULL,
  seasons TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Estructura del Proyecto

```
gaama-tv/
├── app/
│   ├── globals.css    # Estilos globales
│   ├── layout.js      # Layout principal
│   └── page.js        # Página principal
├── lib/
│   └── supabase.js    # Cliente de Supabase
├── public/
│   └── logo.png       # Logo de Gaama Tv
├── .env.local.example # Ejemplo de variables de entorno
├── next.config.js     # Configuración de Next.js
├── package.json       # Dependencias del proyecto
└── README.md          # Este archivo
```

## Características

- 🎬 Canales de TV en vivo
- 📺 Programación del día
- 🎥 Películas y series
- 💳 Planes de suscripción
- 📱 Diseño responsive
- 🎨 Paleta de colores personalizada
