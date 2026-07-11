FROM node:20-slim AS base

WORKDIR /app

FROM base AS deps

COPY package*.json ./
RUN npm ci --ignore-scripts

FROM deps AS build

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM base AS prod-deps

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM base AS runtime

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/src/schema.gql ./src/schema.gql
COPY --chown=node:node package*.json ./

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "const net = require('net'); const socket = net.connect(process.env.PORT || 5000, '127.0.0.1', () => { socket.end(); process.exit(0); }); socket.setTimeout(3000); socket.on('timeout', () => { socket.destroy(); process.exit(1); }); socket.on('error', () => process.exit(1));"

CMD ["node", "dist/main.js"]
