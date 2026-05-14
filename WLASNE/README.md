# Photo Sharing Application

## Overview

This repository contains a Svelte frontend and a Node.js backend for a photo-sharing application, with MariaDB as the database. Docker Compose is configured to build and run all services together.

## Fixes applied

- Added missing backend `server/package.json` so the API image can install dependencies and start.
- Replaced the MariaDB healthcheck command in `docker-compose.yml` with a valid `mysqladmin ping` check.
- Documented Docker startup and environment setup in this file.

## Requirements

- Docker Desktop / Docker Engine
- Docker Compose

## Startup

From the repository root, run:

```bash
docker compose up --build
```

This will build and start three services:

- `db` on port `3306`
- `api` on port `3000`
- `client` on port `5173`

## Environment

Docker Compose uses the root `.env` file for variable substitution. The repository also includes `.env.docker` as an alternative example environment file.

If you want to use `.env.docker` instead of `.env`, run:

```bash
docker compose --env-file .env.docker up --build
```

## Service access

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`

## Troubleshooting

If containers do not start cleanly, try:

```bash
docker compose down --volumes
docker compose up --build
```

If the database schema must be reinitialized, remove the volume with:

```bash
docker compose down --volumes
```

## Notes

- The client app uses relative `/api` calls, and the Nginx frontend proxy forwards them to the backend.
- The backend Docker image starts with `npm start` using `server/package.json`.
