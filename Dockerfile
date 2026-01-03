# Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Production
FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/src ./src

# Copy built frontend to public folder
COPY --from=frontend-builder /app/frontend/dist ./public

# Create data directory
RUN mkdir -p data uploads

# Environment
ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["node", "src/index.js"]
