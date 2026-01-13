package com.secbank.cbs.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * Audit Log Search Request / 审计日志搜索请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogSearchRequest {
    private Long userId;
    private String module;
    private String action;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
