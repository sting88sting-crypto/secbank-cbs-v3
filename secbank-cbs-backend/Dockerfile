# SecBank CBS V2 Backend Dockerfile
# SecBank CBS V2 后端 Dockerfile

# Build stage / 构建阶段
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies / 复制pom.xml并下载依赖
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build / 复制源代码并构建
COPY src ./src
RUN mvn clean package -DskipTests -B

# Runtime stage / 运行阶段
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install curl for health checks / 安装curl用于健康检查
RUN apk add --no-cache curl

# Create non-root user / 创建非root用户
RUN addgroup -S spring && adduser -S spring -G spring

# Copy jar from build stage / 从构建阶段复制jar
COPY --from=build /app/target/*.jar app.jar

# Set ownership / 设置所有权
RUN chown -R spring:spring /app
USER spring

# Expose port / 暴露端口
EXPOSE 8080

# Health check with longer start period for Spring Boot / Spring Boot需要更长的启动时间
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run application with optimized JVM settings / 使用优化的JVM设置运行应用
ENTRYPOINT ["java", "-Xms256m", "-Xmx512m", "-jar", "app.jar"]
