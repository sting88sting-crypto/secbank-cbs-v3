package com.secbank.cbs.controller;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Permission Controller / 权限控制器
 * REST API endpoints for permission management.
 */
@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
@Tag(name = "Permission Management / 权限管理", description = "APIs for viewing permissions / 权限查看相关API")
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    @Operation(summary = "Get all permissions / 获取所有权限", description = "Get list of all permissions / 获取所有权限列表")
    public ResponseEntity<ApiResponse<List<PermissionDTO>>> getAllPermissions() {
        List<PermissionDTO> permissions = permissionService.getAllPermissions();
        return ResponseEntity.ok(ApiResponse.success(permissions));
    }

    @GetMapping("/grouped")
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    @Operation(summary = "Get permissions grouped by module / 按模块分组获取权限", 
               description = "Get permissions organized by module / 按模块组织的权限列表")
    public ResponseEntity<ApiResponse<Map<String, List<PermissionDTO>>>> getPermissionsByModule() {
        Map<String, List<PermissionDTO>> permissions = permissionService.getPermissionsByModule();
        return ResponseEntity.ok(ApiResponse.success(permissions));
    }

    @GetMapping("/module/{module}")
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    @Operation(summary = "Get permissions by module / 根据模块获取权限", 
               description = "Get permissions for a specific module / 获取特定模块的权限")
    public ResponseEntity<ApiResponse<List<PermissionDTO>>> getPermissionsByModule(@PathVariable String module) {
        List<PermissionDTO> permissions = permissionService.getPermissionsByModule(module);
        return ResponseEntity.ok(ApiResponse.success(permissions));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    @Operation(summary = "Get permission by ID / 根据ID获取权限", 
               description = "Get permission details by ID / 根据ID获取权限详情")
    public ResponseEntity<ApiResponse<PermissionDTO>> getPermissionById(@PathVariable Long id) {
        PermissionDTO permission = permissionService.getPermissionById(id);
        return ResponseEntity.ok(ApiResponse.success(permission));
    }

    @GetMapping("/modules")
    @PreAuthorize("hasAuthority('PERMISSION_VIEW')")
    @Operation(summary = "Get all modules / 获取所有模块", 
               description = "Get list of all distinct modules / 获取所有不同模块列表")
    public ResponseEntity<ApiResponse<List<String>>> getAllModules() {
        List<String> modules = permissionService.getAllModules();
        return ResponseEntity.ok(ApiResponse.success(modules));
    }
}
