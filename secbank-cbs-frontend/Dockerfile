# SecBank CBS V2 Frontend Dockerfile
# SecBank CBS V2 前端 Dockerfile

# Build stage / 构建阶段
FROM node:22-alpine AS build
WORKDIR /app

# Install pnpm / 安装pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files / 复制包文件
COPY package.json pnpm-lock.yaml* ./

# Install dependencies / 安装依赖
RUN pnpm install --frozen-lockfile

# Copy source code / 复制源代码
COPY . .

# Build for production / 生产构建
RUN pnpm run build

# Runtime stage with Nginx / 使用Nginx的运行阶段
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets / 删除默认nginx静态资源
RUN rm -rf ./*

# Copy built assets from build stage / 从构建阶段复制构建产物
COPY --from=build /app/dist .

# Copy nginx configuration / 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port / 暴露端口
EXPOSE 80

# Health check / 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Run nginx / 运行nginx
CMD ["nginx", "-g", "daemon off;"]
