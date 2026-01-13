package com.secbank.cbs.dto;

import lombok.*;

/**
 * Dashboard Statistics DTO / 仪表板统计DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    
    private long totalUsers;
    private long activeUsers;
    private long totalRoles;
    private long totalBranches;
    private long activeBranches;
    private long totalPermissions;
    private long todayAuditLogs;
    private long totalAuditLogs;
}
