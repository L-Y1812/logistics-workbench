FROM node:18-alpine

WORKDIR /app

# 复制 package.json 并安装依赖
COPY server/package.json ./
RUN npm install --production

# 复制服务代码
COPY server/server.js ./

# 复制前端静态文件（server.js 中 express.static 指向上一级目录）
COPY . /app

WORKDIR /app/server

ENV PORT=3000
EXPOSE 3000

# 支持代理环境变量
ENV HTTP_PROXY=""
ENV HTTPS_PROXY=""

CMD ["node", "server.js"]
