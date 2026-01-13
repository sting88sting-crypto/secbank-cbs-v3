# SecBank CBS V2 Deployment Guide
# SecBank CBS V2 部署指南

This guide covers deploying SecBank CBS V2 to your own server with Docker.

本指南介绍如何使用Docker将SecBank CBS V2部署到您自己的服务器。

---

## Table of Contents / 目录

1. [Prerequisites / 前提条件](#prerequisites--前提条件)
2. [Quick Start / 快速开始](#quick-start--快速开始)
3. [Manual Deployment / 手动部署](#manual-deployment--手动部署)
4. [Configuration / 配置](#configuration--配置)
5. [Database Setup / 数据库设置](#database-setup--数据库设置)
6. [SSL/HTTPS Setup / SSL/HTTPS设置](#sslhttps-setup--sslhttps设置)
7. [Maintenance / 维护](#maintenance--维护)
8. [Troubleshooting / 故障排除](#troubleshooting--故障排除)

---

## Prerequisites / 前提条件

### Server Requirements / 服务器要求

| Requirement / 要求 | Minimum / 最低 | Recommended / 推荐 |
|-------------------|----------------|-------------------|
| CPU | 2 cores / 2核 | 4 cores / 4核 |
| RAM | 4 GB | 8 GB |
| Disk | 20 GB | 50 GB SSD |
| OS | Ubuntu 20.04+ / CentOS 8+ | Ubuntu 22.04 LTS |

### Software Requirements / 软件要求

- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+

### Install Docker (Ubuntu) / 安装Docker (Ubuntu)

```bash
# Update system / 更新系统
sudo apt update && sudo apt upgrade -y

# Install Docker / 安装Docker
curl -fsSL https://get.docker.com | sh

# Add user to docker group / 将用户添加到docker组
sudo usermod -aG docker $USER

# Install Docker Compose / 安装Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation / 验证安装
docker --version
docker compose version
```

---

## Quick Start / 快速开始

### 1. Clone Repository / 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/secbank-cbs-v2.git
cd secbank-cbs-v2
```

### 2. Configure Environment / 配置环境

```bash
# Copy environment template / 复制环境模板
cp .env.example .env

# Edit configuration / 编辑配置
nano .env
```

**Important: Change these values! / 重要：修改这些值！**

```bash
# Generate secure JWT secret / 生成安全的JWT密钥
openssl rand -base64 32

# Update .env with secure values / 使用安全值更新.env
POSTGRES_PASSWORD=your_secure_db_password
JWT_SECRET=your_generated_jwt_secret
```

### 3. Deploy / 部署

```bash
# Build and start all services / 构建并启动所有服务
docker compose up -d --build

# Check status / 检查状态
docker compose ps

# View logs / 查看日志
docker compose logs -f
```

### 4. Access Application / 访问应用

- **Frontend / 前端**: http://your-server-ip
- **Backend API / 后端API**: http://your-server-ip/api/v1

**Default Login / 默认登录:**
- Username / 用户名: `admin`
- Password / 密码: `admin123`

⚠️ **Change the default password immediately after first login!**
⚠️ **首次登录后请立即修改默认密码！**

---

## Manual Deployment / 手动部署

### Backend Only / 仅后端

```bash
cd secbank-cbs-backend

# Build JAR / 构建JAR
./mvnw clean package -DskipTests

# Run with Java / 使用Java运行
java -jar target/secbank-cbs-backend-2.0.0.jar \
  --spring.datasource.url=jdbc:postgresql://localhost:5432/secbank_cbs \
  --spring.datasource.username=secbank \
  --spring.datasource.password=your_password
```

### Frontend Only / 仅前端

```bash
cd secbank-cbs-frontend

# Install dependencies / 安装依赖
pnpm install

# Build for production / 生产构建
pnpm run build

# Serve with any static server / 使用任何静态服务器提供服务
# Example with nginx / 示例使用nginx
sudo cp -r dist/* /var/www/html/
```

---

## Configuration / 配置

### Environment Variables / 环境变量

| Variable / 变量 | Description / 描述 | Default / 默认值 |
|----------------|-------------------|-----------------|
| `POSTGRES_DB` | Database name / 数据库名 | `secbank_cbs` |
| `POSTGRES_USER` | Database user / 数据库用户 | `secbank` |
| `POSTGRES_PASSWORD` | Database password / 数据库密码 | - |
| `JWT_SECRET` | JWT signing key / JWT签名密钥 | - |
| `JWT_EXPIRATION` | Token expiry (ms) / 令牌过期时间(毫秒) | `86400000` |
| `BACKEND_PORT` | Backend port / 后端端口 | `8080` |
| `FRONTEND_PORT` | Frontend port / 前端端口 | `80` |

### Backend Configuration / 后端配置

Edit `secbank-cbs-backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:secbank_cbs}
    username: ${DB_USER:secbank}
    password: ${DB_PASSWORD:secbank123}
  
  jpa:
    hibernate:
      ddl-auto: update  # Change to 'validate' in production / 生产环境改为'validate'

jwt:
  secret: ${JWT_SECRET:your-secret-key}
  expiration: ${JWT_EXPIRATION:86400000}
```

---

## Database Setup / 数据库设置

### Initialize Database / 初始化数据库

The database schema is automatically created on first run. To manually initialize:

数据库架构在首次运行时自动创建。手动初始化：

```bash
# Connect to PostgreSQL container / 连接到PostgreSQL容器
docker compose exec postgres psql -U secbank -d secbank_cbs

# Or run SQL script directly / 或直接运行SQL脚本
docker compose exec -T postgres psql -U secbank -d secbank_cbs < database/schema_administration.sql
```

### Backup Database / 备份数据库

```bash
# Create backup / 创建备份
docker compose exec postgres pg_dump -U secbank secbank_cbs > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backup script / 自动每日备份脚本
cat > /etc/cron.daily/secbank-backup << 'EOF'
#!/bin/bash
BACKUP_DIR=/var/backups/secbank
mkdir -p $BACKUP_DIR
docker compose -f /path/to/secbank-cbs-v2/docker-compose.yml exec -T postgres \
  pg_dump -U secbank secbank_cbs | gzip > $BACKUP_DIR/backup_$(date +%Y%m%d).sql.gz
# Keep only last 7 days / 仅保留最近7天
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF
chmod +x /etc/cron.daily/secbank-backup
```

### Restore Database / 恢复数据库

```bash
# Restore from backup / 从备份恢复
cat backup_20240115.sql | docker compose exec -T postgres psql -U secbank -d secbank_cbs

# Or from gzipped backup / 或从压缩备份
gunzip -c backup_20240115.sql.gz | docker compose exec -T postgres psql -U secbank -d secbank_cbs
```

---

## SSL/HTTPS Setup / SSL/HTTPS设置

### Option 1: Using Nginx Reverse Proxy / 选项1：使用Nginx反向代理

```bash
# Install Nginx and Certbot / 安装Nginx和Certbot
sudo apt install nginx certbot python3-certbot-nginx -y

# Create Nginx config / 创建Nginx配置
sudo nano /etc/nginx/sites-available/secbank
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site / 启用站点
sudo ln -s /etc/nginx/sites-available/secbank /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Get SSL certificate / 获取SSL证书
sudo certbot --nginx -d your-domain.com
```

### Option 2: Using Traefik / 选项2：使用Traefik

Add to `docker-compose.yml`:

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=your@email.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

---

## Maintenance / 维护

### Update Application / 更新应用

```bash
cd secbank-cbs-v2

# Pull latest code / 拉取最新代码
git pull origin main

# Rebuild and restart / 重新构建并重启
docker compose down
docker compose up -d --build
```

### View Logs / 查看日志

```bash
# All services / 所有服务
docker compose logs -f

# Specific service / 特定服务
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Monitor Resources / 监控资源

```bash
# Container stats / 容器统计
docker stats

# Disk usage / 磁盘使用
docker system df
```

### Clean Up / 清理

```bash
# Remove unused images / 删除未使用的镜像
docker image prune -a

# Remove all unused data / 删除所有未使用的数据
docker system prune -a
```

---

## Troubleshooting / 故障排除

### Common Issues / 常见问题

#### 1. Database Connection Failed / 数据库连接失败

```bash
# Check if postgres is running / 检查postgres是否运行
docker compose ps postgres

# Check postgres logs / 检查postgres日志
docker compose logs postgres

# Test connection / 测试连接
docker compose exec postgres pg_isready -U secbank
```

#### 2. Backend Won't Start / 后端无法启动

```bash
# Check backend logs / 检查后端日志
docker compose logs backend

# Common causes / 常见原因:
# - Database not ready / 数据库未就绪
# - Invalid JWT_SECRET / 无效的JWT_SECRET
# - Port already in use / 端口已被占用
```

#### 3. Frontend Shows Blank Page / 前端显示空白页

```bash
# Check frontend logs / 检查前端日志
docker compose logs frontend

# Check if backend is accessible / 检查后端是否可访问
curl http://localhost:8080/actuator/health
```

#### 4. Permission Denied / 权限被拒绝

```bash
# Fix Docker socket permissions / 修复Docker socket权限
sudo chmod 666 /var/run/docker.sock

# Or add user to docker group / 或将用户添加到docker组
sudo usermod -aG docker $USER
# Then logout and login again / 然后重新登录
```

### Health Checks / 健康检查

```bash
# Backend health / 后端健康
curl http://localhost:8080/actuator/health

# Frontend health / 前端健康
curl http://localhost/health

# Database health / 数据库健康
docker compose exec postgres pg_isready -U secbank
```

---

## Support / 支持

For issues and questions, please:
如有问题，请：

1. Check the logs / 检查日志
2. Review this documentation / 查阅本文档
3. Open a GitHub issue / 在GitHub上提交issue

---

**SecBank CBS V2** - Built with ❤️ for Philippine Rural Banks
**SecBank CBS V2** - 为菲律宾农村银行精心打造
