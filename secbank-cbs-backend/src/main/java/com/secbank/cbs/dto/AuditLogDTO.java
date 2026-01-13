package com.secbank.cbs.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * AuditLog DTO / 审计日志数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogDTO {
    private Long id;
    private Long userId;
    private String username;
    private String action;
    private String module;
    private String entityType;
    private Long entityId;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String description;
    private LocalDateTime createdAt;
}
