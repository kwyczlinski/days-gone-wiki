# Days Gone Wiki Project

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?logo=flask)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker)
![Kubernetes](https://img.shields.io/badge/Kubernetes-Orchestration-326CE5?logo=kubernetes)
![OAuth2](https://img.shields.io/badge/OAuth2.0%2FOpenID%20Connect-Auth-3C3C3C)

### By Krzysztof Wyczlinski

---

## Table of Contents

- [Frontend](#frontend)
- [Backend](#backend)
- [Authentication & Security](#authentication--security)
- [External Dependencies & Coursework Sources](#external-dependencies--coursework-sources)
- [Architecture Overview (Kubernetes & NGINX)](#architecture-overview-kubernetes--nginx)
- [How to Run](#how-to-run)
  - [Local HTTPS Setup & DNS](#1-local-https-setup--dns)
  - [Environment Variables](#2-environment-variables-kustomize-secrets)
  - [Deployment Options](#3-deployment-options)
    - [Docker Compose](#option-a-docker-compose)
    - [Kubernetes (Kustomize)](#option-b-kubernetes-kustomize)

---

## Frontend

- **Framework:** React 19 (Vite)
- **Runtime config injection:** `frontend/entrypoint.sh` generates `env-config.js` at container startup (`window._env_`)
- **Compiler:** @vitejs/plugin-react (Babel-based)
- **Routing:** React Router DOM v6
- **Styling:** CSS Modules
- **Containerization:** `nginxinc/nginx-unprivileged:alpine-slim` with custom `nginx.conf`
  - Runs strictly as non-root user (UID 101)

---

## Backend

- **Server:** Flask
- **Database:** PostgreSQL
- **Caching & sessions:** Redis
- **Containerization:** Docker & Docker Compose
  - Supports both standard and `.dev` orchestration modes

---

## Authentication & Security

- **Identity Provider:** Authentik
- **Protocol:** OAuth2.0 / OpenID Connect
- **Flow:** PKCE

---

## External Dependencies & Coursework Sources

- Base frontend & backend: Web Protocols class
- PL/pgSQL functions & triggers: Database class (mounted via `db/` init scripts)
- OAuth2 integration: Web Applications Security class
- Docker Compose & Kubernetes: Web Technologies class

---

## Architecture Overview (Kubernetes & NGINX)

The system uses **Ingress NGINX** (`k8s/base/ingress.yaml`) as a centralized reverse proxy inside the `wiki-app` namespace.

It provides:

- TLS termination for local HTTPS setup via mounted secret
- Path-based routing:
  - `/api`, `/search`, `/comments`, `/<category>/<id>`, `/me`
- Routes API traffic to Flask backend
- SPA routes served by frontend NGINX
- SPA fallback routing
- Eliminates CORS issues by handling routing at the ingress layer

---

## How to Run

### 1. Local HTTPS Setup & DNS

The app requires HTTPS due to Authentik redirect constraints.

Install `mkcert` and generate certificates:

```bash
mkdir certs && cd certs
mkcert -install
mkcert wiki.local auth.local
cd ..
```

Add hosts entry:

```text
127.0.0.1 wiki.local auth.local
```

---

### 2. Environment Variables (Kustomize Secrets)

Secrets are generated using Kustomize `secretGenerator` and are not tracked in Git.

Create `.env` files based on `.env.template`.

---

### 3. Deployment Options

## Option A: Docker Compose

```bash
docker compose up -d
```

Development mode:

```bash
docker compose -f docker-compose.dev.yml up -d
```

---

## Option B: Kubernetes (Kustomize)

### Step 1: Create namespace

```bash
kubectl apply -f k8s/base/namespace.yaml
```

### Step 2: TLS secret

```bash
kubectl create secret tls wiki-tls-secret \
  --cert=certs/wiki.local+1.pem \
  --key=certs/wiki.local+1-key.pem \
  -n wiki-app
```

### Step 3: GitHub Container Registry credentials (optional if not public)

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<YOUR_GITHUB_USERNAME> \
  --docker-password=<YOUR_GITHUB_PAT> \
  -n wiki-app
```

### Step 4: Deploy with Kustomize

Development:

```bash
kubectl apply -k k8s/overlays/dev/
```

Production:

```bash
kubectl apply -k k8s/overlays/prod/
```

---

### Step 5: Database migration / restore (if needed)

Reset Authentik DB:

```bash
kubectl exec -i deployment/wiki-db -n wiki-app -- \
psql -U postgres -d authentik \
-c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

Restore backup:

```bash
cat authentik_backup.sql | kubectl exec -i deployment/wiki-db -n wiki-app \
-- psql -U postgres -d authentik
```

Restart Authentik:

```bash
kubectl rollout restart deployment/authentik-server -n wiki-app
```