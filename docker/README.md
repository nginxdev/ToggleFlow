# ToggleFlow Docker Setup

This directory contains all Docker configurations for the ToggleFlow project.

## Directory Structure

```
docker/
├── docker-compose.yml   # Main orchestration file
├── backend/
│   ├── Dockerfile       # Backend container configuration
│   └── .env.docker      # Docker environment variables
├── frontend/
│   ├── Dockerfile       # Frontend container configuration
│   └── nginx.conf       # Production nginx config
├── postgres/
│   └── init.sql         # PostgreSQL initialization script
└── README.md            # This file
```

## Quick Start

### Development

Start all services (from the docker directory):

```bash
cd docker
docker-compose up
```

Start in detached mode:

```bash
docker-compose up -d
```

### Database Migrations

Run Prisma migrations in the backend container:

```bash
docker-compose exec backend npx prisma migrate dev
```

Seed the database:

```bash
docker-compose exec backend npx prisma db seed
```

### Viewing Logs

View all logs:

```bash
docker-compose logs -f
```

View specific service logs:

```bash
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f frontend
```

## Services

### PostgreSQL (`postgres`)

- **Port**: 5432
- **User**: toggleflow
- **Password**: toggleflow_dev_password
- **Database**: toggleflow

### Backend API (`backend`)

- **Port**: 3000
- **Hot reload**: Enabled via volume mounts
- **Database**: Connects to postgres service

### Frontend (`frontend`)

- **Port**: 5173
- **Hot reload**: Enabled via volume mounts
- **API**: Connects to backend at localhost:3000

## Stopping Services

Stop all services:

```bash
docker-compose down
```

Stop and remove volumes (⚠️ deletes database data):

```bash
docker-compose down -v
```

## Production Build

Build and run production containers:

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## Troubleshooting

### Reset Everything

```bash
docker-compose down -v
docker-compose up --build
```

### Access PostgreSQL CLI

```bash
docker-compose exec postgres psql -U toggleflow -d toggleflow
```

### Rebuild a specific service

```bash
docker-compose up --build backend
```
