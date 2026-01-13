package com.secbank.cbs.controller;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.security.CurrentUser;
import com.secbank.cbs.security.UserPrincipal;
import com.secbank.cbs.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Role Controller / 角色控制器
 * REST API endpoints for role management.
 */
@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Role Management / 角色管理", description = "APIs for managing roles / 角色管理相关API")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @Operation(summary = "Get all roles / 获取所有角色", description = "Get paginated list of all roles / 分页获取所有角色列表")
    public ResponseEntity<ApiResponse<Page<RoleDTO>>> getAllRoles(
            @PageableDefault(size = 20, sort = "roleCode", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<RoleDTO> roles = roleService.getAllRoles(pageable);
        return ResponseEntity.ok(ApiResponse.success(roles));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @Operation(summary = "Get active roles / 获取活跃角色", description = "Get list of all active roles / 获取所有活跃角色列表")
    public ResponseEntity<ApiResponse<List<RoleDTO>>> getActiveRoles() {
        List<RoleDTO> roles = roleService.getActiveRoles();
        return ResponseEntity.ok(ApiResponse.success(roles));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @Operation(summary = "Get role by ID / 根据ID获取角色", description = "Get role details by ID / 根据ID获取角色详情")
    public ResponseEntity<ApiResponse<RoleDTO>> getRoleById(@PathVariable Long id) {
        RoleDTO role = roleService.getRoleById(id);
        return ResponseEntity.ok(ApiResponse.success(role));
    }

    @GetMapping("/code/{roleCode}")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @Operation(summary = "Get role by code / 根据代码获取角色", description = "Get role details by role code / 根据角色代码获取角色详情")
    public ResponseEntity<ApiResponse<RoleDTO>> getRoleByCode(@PathVariable String roleCode) {
        RoleDTO role = roleService.getRoleByCode(roleCode);
        return ResponseEntity.ok(ApiResponse.success(role));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CREATE')")
    @Operation(summary = "Create role / 创建角色", description = "Create a new role / 创建新角色")
    public ResponseEntity<ApiResponse<RoleDTO>> createRole(
            @Valid @RequestBody CreateRoleRequest request,
            @CurrentUser UserPrincipal currentUser) {
        RoleDTO role = roleService.createRole(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Role created successfully / 角色创建成功", role));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE')")
    @Operation(summary = "Update role / 更新角色", description = "Update an existing role / 更新现有角色")
    public ResponseEntity<ApiResponse<RoleDTO>> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request,
            @CurrentUser UserPrincipal currentUser) {
        RoleDTO role = roleService.updateRole(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully / 角色更新成功", role));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DELETE')")
    @Operation(summary = "Delete role / 删除角色", description = "Delete a role / 删除角色")
    public ResponseEntity<ApiResponse<Void>> deleteRole(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        roleService.deleteRole(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Role deleted successfully / 角色删除成功", null));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('ROLE_VIEW')")
    @Operation(summary = "Search roles / 搜索角色", description = "Search roles by keyword / 按关键字搜索角色")
    public ResponseEntity<ApiResponse<Page<RoleDTO>>> searchRoles(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "roleCode", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<RoleDTO> roles = roleService.searchRoles(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(roles));
    }
}
