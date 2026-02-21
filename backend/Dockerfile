FROM node:22-alpine

WORKDIR /opt/app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 1337

CMD ["npm", "run", "develop"]
