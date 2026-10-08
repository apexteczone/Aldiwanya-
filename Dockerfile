FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY FrontEnd/aldiwanya-platform/package*.json FrontEnd/aldiwanya-platform/
RUN npm ci --prefix FrontEnd/aldiwanya-platform
COPY FrontEnd/aldiwanya-platform FrontEnd/aldiwanya-platform
RUN npm run build --prefix FrontEnd/aldiwanya-platform

FROM node:24-bookworm-slim
ENV NODE_ENV=production SERVE_FRONTEND=true PORT=5000 UPLOAD_DIR=/app/BackEnd/uploads
WORKDIR /app
COPY BackEnd/package*.json BackEnd/
RUN npm ci --omit=dev --prefix BackEnd
COPY BackEnd BackEnd
COPY --from=build /app/FrontEnd/aldiwanya-platform/dist FrontEnd/aldiwanya-platform/dist
RUN mkdir -p /app/BackEnd/uploads && chown -R node:node /app/BackEnd/uploads
USER node
WORKDIR /app/BackEnd
EXPOSE 5000
CMD ["node", "server.js"]
