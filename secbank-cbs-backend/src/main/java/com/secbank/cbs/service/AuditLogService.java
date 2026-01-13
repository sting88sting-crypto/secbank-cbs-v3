package com.secbank.cbs.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.secbank.cbs.dto.AuditLogDTO;
import com.secbank.cbs.dto.AuditLogSearchRequest;
import com.secbank.cbs.entity.AuditLog;
import com.secbank.cbs.entity.User;
import com.secbank.cbs.repository.AuditLogRepository;
import com.secbank.cbs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * AuditLog Service / 审计日志服务
 * Handles all audit logging operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * Log an action asynchronously.
     * 异步记录操作
     */
    @Async
    @Transactional
    public void logAction(Long userId, String action, String module, 
                          String entityType, Long entityId, 
                          Object oldValue, Object newValue, String description) {
        try {
            String username = null;
            if (userId != null) {
                username = userRepository.findById(userId)
                    .map(User::getUsername)
                    .orElse(null);
            }

            String ipAddress = null;
            String userAgent = null;
            try {
                ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attrs != null) {
                    HttpServletRequest request = attrs.getRequest();
                    ipAddress = getClientIp(request);
                    userAgent = request.getHeader("User-Agent");
                }
            } catch (Exception e) {
                // Ignore - may not be in request context
            }

            AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .username(username)
                .action(action)
                .module(module)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(toJson(oldValue))
                .newValue(toJson(newValue))
                .ipAddress(ipAddress)
                .userAgent(userAgent != null && userAgent.length() > 500 ? userAgent.substring(0, 500) : userAgent)
                .description(description)
                .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log created: {} - {} - {}", action, module, entityType);
        } catch (Exception e) {
            log.error("Failed to create audit log", e);
        }
    }

    /**
     * Get all audit logs with pagination.
     * 分页获取所有审计日志
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAllAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable).map(this::toDTO);
    }

    /**
     * Search audit logs with filters.
     * 按条件搜索审计日志
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> searchAuditLogs(AuditLogSearchRequest request, Pageable pageable) {
        return auditLogRepository.searchAuditLogs(
            request.getUserId(),
            request.getModule(),
            request.getAction(),
            request.getStartDate(),
            request.getEndDate(),
            pageable
        ).map(this::toDTO);
    }

    /**
     * Get audit logs by user.
     * 根据用户获取审计日志
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAuditLogsByUser(Long userId, Pageable pageable) {
        return auditLogRepository.findByUserId(userId, pageable).map(this::toDTO);
    }

    /**
     * Get audit logs by module.
     * 根据模块获取审计日志
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> getAuditLogsByModule(String module, Pageable pageable) {
        return auditLogRepository.findByModule(module, pageable).map(this::toDTO);
    }

    /**
     * Get audit logs for a specific entity.
     * 获取特定实体的审计日志
     */
    @Transactional(readOnly = true)
    public List<AuditLogDTO> getAuditLogsForEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get all distinct actions.
     * 获取所有不同的操作类型
     */
    @Transactional(readOnly = true)
    public List<String> getAllActions() {
        return auditLogRepository.findAllActions();
    }

    /**
     * Get all distinct modules.
     * 获取所有不同的模块
     */
    @Transactional(readOnly = true)
    public List<String> getAllModules() {
        return auditLogRepository.findAllModules();
    }

    /**
     * Convert object to JSON string.
     * 将对象转换为JSON字符串
     */
    private String toJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize object to JSON", e);
            return obj.toString();
        }
    }

    /**
     * Get client IP address.
     * 获取客户端IP地址
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Handle multiple IPs (take the first one)
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    /**
     * Convert entity to DTO.
     * 将实体转换为DTO
     */
    private AuditLogDTO toDTO(AuditLog auditLog) {
        return AuditLogDTO.builder()
            .id(auditLog.getId())
            .userId(auditLog.getUserId())
            .username(auditLog.getUsername())
            .action(auditLog.getAction())
            .module(auditLog.getModule())
            .entityType(auditLog.getEntityType())
            .entityId(auditLog.getEntityId())
            .oldValue(auditLog.getOldValue())
            .newValue(auditLog.getNewValue())
            .ipAddress(auditLog.getIpAddress())
            .description(auditLog.getDescription())
            .createdAt(auditLog.getCreatedAt())
            .build();
    }
}
