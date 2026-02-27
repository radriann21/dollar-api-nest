# 💵 Dollar API - NestJS

API REST para consultar tasas de cambio del dólar en Venezuela. Proporciona datos actualizados de múltiples fuentes como BCV (Banco Central de Venezuela) y Binance P2P, con análisis de brechas cambiarias y tendencias.

## 📋 Descripción

Sistema automatizado de recolección y consulta de tasas de cambio del dólar en Venezuela. La API obtiene datos de forma programada mediante web scraping y los almacena en una base de datos PostgreSQL, ofreciendo endpoints optimizados con caché Redis para consultas rápidas.

### Características principales

- ✅ **Recolección automática de datos** mediante tareas programadas (Cron)
- ✅ **Múltiples fuentes**: BCV y Binance P2P (pronto más)
- ✅ **Rate limiting** para proteger la API (60 req/min)
- ✅ **Análisis de tendencias** (UP, DOWN, STABLE) y variaciones
- ✅ **Cálculo de brecha cambiaria** entre fuentes
- ✅ **Documentación interactiva** con Swagger/Scalar

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

- **Framework**: NestJS 11
- **Base de datos**: PostgreSQL con Prisma ORM
- **Caché**: Redis (via Keyv)
- **Web Scraping**: Cheerio + Axios
- **Documentación**: Swagger + Scalar API Reference
- **Validación**: class-validator + class-transformer
- **Tareas programadas**: @nestjs/schedule

### Estructura de Módulos

```
src/
├── app.module.ts          # Módulo principal con configuración global
├── main.ts                # Bootstrap de la aplicación
├── prisma/                # Servicio de conexión a base de datos
├── scrapper/              # Servicio de web scraping
├── tasks/                 # Tareas programadas (Cron jobs)
├── rates/                 # Endpoints de consulta de tasas
└── analytics/             # Endpoints de análisis cambiario
```

## 🔄 Tareas Automatizadas

### Scraping y rastreo de las tasas de cambio

### Cálculo de Tendencias

Cada vez que se guarda un precio nuevo:

1. Se compara con el precio anterior de la misma fuente
2. Se calcula la variación absoluta
3. Se determina la tendencia (UP/DOWN/STABLE)

## 🚀 API Endpoints

### Rates Module (`/rates`)

#### `GET /rates/sources`

Obtiene todas las fuentes de datos disponibles.

**Respuesta:**

```json
[
  {
    "id": 1,
    "name": "BCV",
    "isActive": true
  },
  {
    "id": 2,
    "name": "BINANCE",
    "isActive": true
  }
]
```

#### `GET /rates/last-bcv-price`

Obtiene la tasa de cambio más reciente del BCV.

**Respuesta:**

```json
{
  "id": 123,
  "price": "52.4500",
  "sourceId": 1,
  "trend": "UP",
  "variation": 0.25,
  "createdAt": "2026-02-24T22:00:00.000Z",
  "updatedAt": "2026-02-24T22:00:00.000Z"
}
```

#### `GET /rates/last-binance-price`

Obtiene la tasa de cambio más reciente de Binance P2P.

#### `GET /rates/latest-prices`

Obtiene las tasas más recientes de todas las fuentes en una sola petición.

**Respuesta:**

```json
{
  "bcv": {
    /* ExchangeRate */
  },
  "binance": {
    /* ExchangeRate */
  }
}
```

### Analytics (`/analytics`)

#### `GET /analytics/gap`

Calcula la brecha cambiaria entre Binance y BCV.

**Respuesta:**

```json
{
  "gap": "15.32%",
  "latestBCVPrice": {
    /* ExchangeRate */
  },
  "latestBinancePrice": {
    /* ExchangeRate */
  }
}
```

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/dollar_api"
REDIS_URL="redis://localhost:6379"
WEBSITE_URL="website-url"
API_URL="api-url"
PORT=3000
```

### Instalación

```bash
# Instalar dependencias
pnpm install

# Generar cliente de Prisma
pnpm prisma:generate

# Ejecutar migraciones
pnpm prisma migrate deploy

# Ejecutar seeds (opcional)
pnpm prisma db seed
```

## 🚀 Ejecución

```bash
# Desarrollo
pnpm run start:dev

# Producción
pnpm run build
pnpm run start:prod
```

La API estará disponible en `http://localhost:3000`

## 📚 Documentación Interactiva

Accede a la documentación Swagger/Scalar en:

```
http://localhost:3000/api
```

## 🔒 Seguridad y Rendimiento

### Rate Limiting

- **Límite**: 60 peticiones por minuto por IP
- **Storage**: Redis para sincronización entre instancias
- **Aplicado globalmente** mediante `ThrottlerGuard`

### Caché

- **TTL**: 1 hora (3600000 ms)
- **Storage**: Redis con Keyv
- **Estrategia**: Cache-aside pattern
- **Invalidación**: Automática al actualizar datos


## 🛠️ Tecnologías de Web Scraping

### BCV Scraper

- **Librería**: Cheerio (jQuery-like para Node.js)
- **Método**: HTTP GET con User-Agent personalizado
- **Parsing**: Selección de elementos DOM
- **Timeout**: 10 segundos

### Binance P2P API

- **Método**: HTTP POST a API pública
- **Payload**: Filtros por moneda (USDT/VES) y método de pago
- **Procesamiento**: Cálculo de estadísticas sobre ofertas P2P
- **Datos extraídos**: 10 mejores ofertas

## 📊 Próximas Funcionalidades

- [ ] Dólar promedio ponderado
- [ ] Más fuentes de datos (DolarToday, Monitor Dólar, etc.)

## 📝 Licencia

AGPL-3.0

## 👨‍💻 Autor

Desarrollado por [radriann21](https://github.com/radriann21) & [Raynier95](https://github.com/Raynier95)
