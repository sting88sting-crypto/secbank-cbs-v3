package com.secbank.cbs.controller;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AuditLog Controller / 审计日志控制器
 * REST API endpoints for viewing audit logs.
 */
@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Log Management / 审计日志管理", description = "APIs for viewing audit logs / 审计日志查看相关API")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    @Operation(summary = "Get all audit logs / 获取所有审计日志", 
               description = "Get paginated list of all audit logs / 分页获取所有审计日志列表")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAllAuditLogs(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AuditLogDTO> auditLogs = auditLogService.getAllAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    @Operation(summary = "Search audit logs / 搜索审计日志", 
               description = "Search audit logs with filters / 按条件搜索审计日志")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> searchAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        AuditLogSearchRequest request = AuditLogSearchRequest.builder()
            .userId(userId)
            .module(module)
            .action(action)
            .startDate(startDate)
            .endDate(endDate)
            .build();
        
        Page<AuditLogDTO> auditLogs = auditLogService.searchAuditLogs(request, pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    @Operation(summary = "Get audit logs by user / 根据用户获取审计日志", 
               description = "Get audit logs for a specific user / 获取特定用户的审计日志")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AuditLogDTO> auditLogs = auditLogService.getAuditLogsByUser(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs));
    }

    @GetMapping("/module/{module}")
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    @Operation(summary = "Get audit logs by module / 根据模块获取审计日志", 
               description = "Get audit logs for a specific module / 获取特定模块的审计日志")
    public ResponseEntity<ApiResponse<Page<AuditLogDTO>>> getAuditLogsByModule(
            @PathVariable String module,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<AuditLogDTO> auditLogs = auditLogService.getAuditLogsByModule(module, pageable);
        return ResponseEntity.ok(ApiResponse.success(auditLogs));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    @Operation(summary = "Get audit logs for entity / 获取实体的审计日志", 
               description = "Get audit logs for a specific entity / 获取特定实体的审计日志")
    public ResponseEntity<ApiResponse<List<AuditLogDTO>>> getAuditLogsForEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        List<AuditLogDTO> auditLogs = auditLogService.getAuditLogsForEntity(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success(auditLogs));
    }

    @GetMapping("/actions")
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    @Operation(summary = "Get all actions / 获取所有操作类型", 
               description = "Get list of all distinct action types / 获取所有不同操作类型列表")
    public ResponseEntity<ApiResponse<List<String>>> getAllActions() {
        List<String> actions = auditLogService.getAllActions();
        return ResponseEntity.ok(ApiResponse.success(actions));
    }

    @GetMapping("/modules")
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
    @Operation(summary = "Get all modules / 获取所有模块", 
               description = "Get list of all distinct modules / 获取所有不同模块列表")
    public ResponseEntity<ApiResponse<List<String>>> getAllModules() {
        List<String> modules = auditLogService.getAllModules();
        return ResponseEntity.ok(ApiResponse.success(modules));
    }
}
