package com.secbank.cbs.controller;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Dashboard Controller / 仪表板控制器
 * REST API endpoints for dashboard statistics.
 */
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard / 仪表板", description = "APIs for dashboard statistics / 仪表板统计相关API")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('DASHBOARD_VIEW') or hasAuthority('USER_VIEW')")
    @Operation(summary = "Get dashboard statistics / 获取仪表板统计", 
               description = "Get system statistics for dashboard / 获取仪表板的系统统计数据")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getStats() {
        DashboardStatsDTO stats = dashboardService.getStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
