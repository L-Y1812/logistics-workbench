FROM node:18-alpine

WORKDIR /app

# 先拷贝依赖清单，利用 Docker 缓存层
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev --no-audit --no-fund

# 拷贝应用代码
COPY . .

# Render 会自动注入 PORT，此处仅为本地运行提供默认值
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/server.js"]
