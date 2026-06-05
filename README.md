# Days Gone Wiki Project

## By Krzysztof Wyczlinski

## final project for class Web Technologies

### Frontend

- **Framework:** React 19 (Vite)
- **Compiler:** @vitejs/plugin-react (Babel-based)
- **Routing:** React Router DOM v6
- **Styling:** CSS Modules

### Backend

- **Server:** Flask
- **Database:** PostgreSQL
- **Containerization:** Docker & Docker Compose

### Auth

- **Provider:** Authentik

### Personal projects were used and publicly accessible templates

- **Base frontend & backend:** taken from Web Protocols class
- **PLpgSQL:** taken from Database class
- **OAuth2.0:** integrated as a part of Web Applications Security class

### how to run

#### Adding tls for localhost

- Install mkcert.
- mkdir certs && mkcert -install && mkcert -cert-file certs/cert.pem -key-file certs/key.pem localhost 127.0.0.1 <MACHINE_IP>.

#### Fill in .env templates

#### Start with docker compose