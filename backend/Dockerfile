FROM node:22-alpine AS base

WORKDIR /opt/app
RUN apk add --no-cache libc6-compat
COPY package*.json ./

FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
EXPOSE 1337
CMD ["npm", "run", "develop"]

FROM base AS build
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS production
WORKDIR /opt/app
RUN apk add --no-cache libc6-compat \
  && addgroup -S strapi \
  && adduser -S strapi -G strapi
ENV NODE_ENV=production
COPY --from=build --chown=strapi:strapi /opt/app ./
USER strapi
EXPOSE 1337
CMD ["npm", "run", "start"]
