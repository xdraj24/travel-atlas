FROM node:22-alpine AS base

WORKDIR /opt/app
RUN apk add --no-cache libc6-compat

FROM base AS development
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 8055
CMD ["npm", "run", "dev"]

FROM node:22-alpine AS production
WORKDIR /opt/app
RUN apk add --no-cache libc6-compat \
  && addgroup -S directus \
  && adduser -S directus -G directus
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --chown=directus:directus . .
USER directus
EXPOSE 8055
CMD ["npm", "run", "start"]
