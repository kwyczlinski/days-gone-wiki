FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

ARG VITE_API_URL
ARG VITE_AUTHENTIK_PUBLIC_URL
ARG VITE_AUTHENTIK_CLIENT_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTHENTIK_PUBLIC_URL=$VITE_AUTHENTIK_PUBLIC_URL
ENV VITE_AUTHENTIK_CLIENT_ID=$VITE_AUTHENTIK_CLIENT_ID

COPY . .

RUN npm run build


FROM node:20-alpine AS tester

WORKDIR /app

COPY . .

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/

RUN npm run lint
# RUN npm run test

CMD ["npm", "run", "lint"]


FROM nginxinc/nginx-unprivileged:alpine-slim AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]