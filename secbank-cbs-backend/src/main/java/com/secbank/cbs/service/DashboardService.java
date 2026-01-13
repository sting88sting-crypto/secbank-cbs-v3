package com.secbank.cbs.service;

import com.secbank.cbs.dto.DashboardStatsDTO;
import com.secbank.cbs.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Dashboard Service / 仪表板服务
 * Provides dashboard statistics and metrics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final PermissionRepository permissionRepository;
    private final AuditLogRepository auditLogRepository;

    /**
     * Get dashboard statistics / 获取仪表板统计
     */
    public DashboardStatsDTO getStats() {
        log.debug("Fetching dashboard statistics... / 获取仪表板统计...");
        
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus("ACTIVE");
        long totalRoles = roleRepository.count();
        long totalBranches = branchRepository.count();
        long activeBranches = branchRepository.countByStatus("ACTIVE");
        long totalPermissions = permissionRepository.count();
        
        // Get today's audit logs
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        long todayAuditLogs = auditLogRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        long totalAuditLogs = auditLogRepository.count();
        
        return DashboardStatsDTO.builder()
            .totalUsers(totalUsers)
            .activeUsers(activeUsers)
            .totalRoles(totalRoles)
            .totalBranches(totalBranches)
            .activeBranches(activeBranches)
            .totalPermissions(totalPermissions)
            .todayAuditLogs(todayAuditLogs)
            .totalAuditLogs(totalAuditLogs)
            .build();
    }
}
