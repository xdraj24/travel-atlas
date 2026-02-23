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
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production \
  DB_CLIENT=pg \
  STORAGE_LOCAL_ROOT=/tmp/uploads \
  EXTENSIONS_PATH=/tmp/extensions \
  CACHE_PATH=/tmp
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN mkdir -p /tmp/uploads
RUN mkdir -p /tmp/extensions
RUN if [ -d /opt/app/extensions ]; then cp -R /opt/app/extensions/. /tmp/extensions/; fi
RUN printf '{\n  "type": "module"\n}\n' > /tmp/extensions/package.json
RUN chown -R node:node /tmp
RUN chown -R node:node /opt/app
USER node
EXPOSE 8055
CMD ["npm", "run", "start"]
