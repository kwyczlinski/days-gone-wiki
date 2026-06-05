FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build


FROM node:20-alpine AS tester

WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package*.json /app/

COPY . .

RUN npm run lint
# RUN npm run test

CMD ["npm", "run", "lint"]


FROM nginxinc/nginx-unprivileged:alpine-slim AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=tester /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]