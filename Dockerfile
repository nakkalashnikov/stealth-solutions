# Stage 1 — build the React app
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2 — Express backend, serving the built frontend + the API on one port
FROM node:22-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ .
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
RUN mkdir -p /app/data

ENV PORT=3001
ENV DB_PATH=/app/data/sequence.sqlite
VOLUME ["/app/data"]
EXPOSE 3001

CMD ["node", "src/server.js"]
