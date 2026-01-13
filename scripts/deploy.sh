#!/bin/bash
# SecBank CBS V2 Deployment Script
# SecBank CBS V2 部署脚本

set -e

# Colors for output / 输出颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print with color / 彩色打印
print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root / 检查是否以root运行
if [ "$EUID" -eq 0 ]; then
    print_warn "Running as root is not recommended / 不建议以root运行"
fi

# Check Docker / 检查Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed / Docker未安装"
    print_info "Install Docker: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# Check Docker Compose / 检查Docker Compose
if ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed / Docker Compose未安装"
    exit 1
fi

# Get script directory / 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Check .env file / 检查.env文件
if [ ! -f .env ]; then
    print_warn ".env file not found, creating from template / .env文件不存在，从模板创建"
    cp .env.example .env
    print_warn "Please edit .env file with your configuration / 请编辑.env文件配置"
    print_warn "Especially change POSTGRES_PASSWORD and JWT_SECRET / 特别是修改POSTGRES_PASSWORD和JWT_SECRET"
    exit 1
fi

# Parse command / 解析命令
COMMAND=${1:-"up"}

case $COMMAND in
    up|start)
        print_info "Starting SecBank CBS V2... / 启动SecBank CBS V2..."
        docker compose up -d --build
        print_info "Waiting for services to be healthy... / 等待服务健康..."
        sleep 10
        docker compose ps
        print_info "SecBank CBS V2 is running! / SecBank CBS V2已运行！"
        print_info "Access at: http://localhost / 访问地址: http://localhost"
        ;;
    
    down|stop)
        print_info "Stopping SecBank CBS V2... / 停止SecBank CBS V2..."
        docker compose down
        print_info "SecBank CBS V2 stopped / SecBank CBS V2已停止"
        ;;
    
    restart)
        print_info "Restarting SecBank CBS V2... / 重启SecBank CBS V2..."
        docker compose restart
        print_info "SecBank CBS V2 restarted / SecBank CBS V2已重启"
        ;;
    
    logs)
        SERVICE=${2:-""}
        if [ -n "$SERVICE" ]; then
            docker compose logs -f "$SERVICE"
        else
            docker compose logs -f
        fi
        ;;
    
    status)
        docker compose ps
        ;;
    
    backup)
        BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
        print_info "Creating database backup: $BACKUP_FILE / 创建数据库备份: $BACKUP_FILE"
        docker compose exec -T postgres pg_dump -U secbank secbank_cbs > "$BACKUP_FILE"
        print_info "Backup created: $BACKUP_FILE / 备份已创建: $BACKUP_FILE"
        ;;
    
    restore)
        BACKUP_FILE=$2
        if [ -z "$BACKUP_FILE" ]; then
            print_error "Please specify backup file / 请指定备份文件"
            print_info "Usage: ./deploy.sh restore backup_file.sql"
            exit 1
        fi
        if [ ! -f "$BACKUP_FILE" ]; then
            print_error "Backup file not found: $BACKUP_FILE / 备份文件不存在: $BACKUP_FILE"
            exit 1
        fi
        print_warn "This will overwrite current database! / 这将覆盖当前数据库！"
        read -p "Continue? (y/N) / 继续？(y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Restoring database from: $BACKUP_FILE / 从备份恢复数据库: $BACKUP_FILE"
            cat "$BACKUP_FILE" | docker compose exec -T postgres psql -U secbank -d secbank_cbs
            print_info "Database restored / 数据库已恢复"
        fi
        ;;
    
    update)
        print_info "Updating SecBank CBS V2... / 更新SecBank CBS V2..."
        git pull origin main
        docker compose down
        docker compose up -d --build
        print_info "SecBank CBS V2 updated / SecBank CBS V2已更新"
        ;;
    
    clean)
        print_warn "This will remove all containers and volumes! / 这将删除所有容器和卷！"
        read -p "Continue? (y/N) / 继续？(y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker compose down -v
            docker system prune -f
            print_info "Cleanup complete / 清理完成"
        fi
        ;;
    
    *)
        echo "SecBank CBS V2 Deployment Script / SecBank CBS V2 部署脚本"
        echo ""
        echo "Usage / 使用方法: ./deploy.sh [command]"
        echo ""
        echo "Commands / 命令:"
        echo "  up, start     Start all services / 启动所有服务"
        echo "  down, stop    Stop all services / 停止所有服务"
        echo "  restart       Restart all services / 重启所有服务"
        echo "  logs [svc]    View logs / 查看日志"
        echo "  status        Show service status / 显示服务状态"
        echo "  backup        Backup database / 备份数据库"
        echo "  restore FILE  Restore database / 恢复数据库"
        echo "  update        Pull latest and rebuild / 拉取最新并重建"
        echo "  clean         Remove all data / 删除所有数据"
        ;;
esac
