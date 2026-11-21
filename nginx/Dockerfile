# ---------------------------------------------------------------------------
# Stage 1: build the React SPA. The build context is the repo root (see
# docker-compose.yml) so this stage can reach client/.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS client-build

WORKDIR /client

# Origin the SPA calls for the API and for relative media URLs. On a
# same-origin deployment this is the site's own origin (http://<ip> now,
# https://<domain> once one is attached); changing it requires a rebuild.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Nginx — serves the SPA and proxies /api/, /ai/ and /media/.
# ---------------------------------------------------------------------------
FROM nginx:1.25-alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=client-build /client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
