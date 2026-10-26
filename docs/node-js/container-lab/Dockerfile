ARG NODE_IMAGE=node:24-bookworm-slim
FROM ${NODE_IMAGE} AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
FROM ${NODE_IMAGE} AS runtime
RUN groupadd --gid 10001 app && useradd --uid 10001 --gid app --no-create-home app
WORKDIR /app
COPY --from=dependencies --chown=10001:10001 /app/node_modules ./node_modules
COPY --chown=10001:10001 package.json server.mjs ./
USER 10001:10001
EXPOSE 3000
CMD ["node","server.mjs"]
