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

# Create non-root user / 创建非root用户
RUN addgroup -S spring && adduser -S spring -G spring

# Copy jar from build stage / 从构建阶段复制jar
COPY --from=build /app/target/*.jar app.jar

# Set ownership / 设置所有权
RUN chown -R spring:spring /app
USER spring

# Expose port / 暴露端口
EXPOSE 8080

# Health check / 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run application / 运行应用
ENTRYPOINT ["java", "-jar", "app.jar"]
