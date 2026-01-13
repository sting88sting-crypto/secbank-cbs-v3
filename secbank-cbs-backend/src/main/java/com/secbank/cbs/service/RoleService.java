package com.secbank.cbs.service;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.entity.Permission;
import com.secbank.cbs.entity.Role;
import com.secbank.cbs.exception.BusinessException;
import com.secbank.cbs.exception.ResourceNotFoundException;
import com.secbank.cbs.repository.PermissionRepository;
import com.secbank.cbs.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Role Service / 角色服务
 * Handles all role-related business logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AuditLogService auditLogService;

    /**
     * Get all roles with pagination.
     * 分页获取所有角色
     */
    @Transactional(readOnly = true)
    public Page<RoleDTO> getAllRoles(Pageable pageable) {
        return roleRepository.findAll(pageable).map(this::toDTO);
    }

    /**
     * Get all active roles.
     * 获取所有活跃角色
     */
    @Transactional(readOnly = true)
    public List<RoleDTO> getActiveRoles() {
        return roleRepository.findByStatus("ACTIVE").stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get role by ID.
     * 根据ID获取角色
     */
    @Transactional(readOnly = true)
    public RoleDTO getRoleById(Long id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        return toDTO(role);
    }

    /**
     * Get role by code.
     * 根据代码获取角色
     */
    @Transactional(readOnly = true)
    public RoleDTO getRoleByCode(String roleCode) {
        Role role = roleRepository.findByRoleCode(roleCode)
            .orElseThrow(() -> new ResourceNotFoundException("Role", "roleCode", roleCode));
        return toDTO(role);
    }

    /**
     * Create a new role.
     * 创建新角色
     */
    public RoleDTO createRole(CreateRoleRequest request, Long currentUserId) {
        // Check if role code already exists
        if (roleRepository.existsByRoleCode(request.getRoleCode())) {
            throw new BusinessException("Role code already exists / 角色代码已存在: " + request.getRoleCode());
        }

        // Get permissions
        Set<Permission> permissions = permissionRepository.findByIdIn(request.getPermissionIds());

        Role role = Role.builder()
            .roleCode(request.getRoleCode())
            .roleName(request.getRoleName())
            .roleNameCn(request.getRoleNameCn())
            .description(request.getDescription())
            .descriptionCn(request.getDescriptionCn())
            .isSystemRole(false)
            .status("ACTIVE")
            .permissions(permissions)
            .createdBy(currentUserId)
            .build();

        role = roleRepository.save(role);

        // Log audit
        auditLogService.logAction(currentUserId, "CREATE", "ADMINISTRATION",
            "Role", role.getId(), null, role, "Created role: " + role.getRoleCode());

        log.info("Role created: {} by user {}", role.getRoleCode(), currentUserId);
        return toDTO(role);
    }

    /**
     * Update an existing role.
     * 更新现有角色
     */
    public RoleDTO updateRole(Long id, UpdateRoleRequest request, Long currentUserId) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        // Cannot modify system roles' code
        if (role.getIsSystemRole() && request.getRoleCode() != null 
            && !request.getRoleCode().equals(role.getRoleCode())) {
            throw new BusinessException("Cannot change system role code / 无法修改系统角色代码");
        }

        // Update fields
        if (request.getRoleName() != null) {
            role.setRoleName(request.getRoleName());
        }
        if (request.getRoleNameCn() != null) {
            role.setRoleNameCn(request.getRoleNameCn());
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getDescriptionCn() != null) {
            role.setDescriptionCn(request.getDescriptionCn());
        }
        if (request.getStatus() != null) {
            role.setStatus(request.getStatus());
        }
        if (request.getPermissionIds() != null) {
            Set<Permission> permissions = permissionRepository.findByIdIn(request.getPermissionIds());
            role.setPermissions(permissions);
        }

        role.setUpdatedBy(currentUserId);
        role = roleRepository.save(role);

        // Log audit
        auditLogService.logAction(currentUserId, "UPDATE", "ADMINISTRATION",
            "Role", role.getId(), null, role, "Updated role: " + role.getRoleCode());

        log.info("Role updated: {} by user {}", role.getRoleCode(), currentUserId);
        return toDTO(role);
    }

    /**
     * Delete a role.
     * 删除角色
     */
    public void deleteRole(Long id, Long currentUserId) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        // Cannot delete system roles
        if (role.getIsSystemRole()) {
            throw new BusinessException("Cannot delete system role / 无法删除系统角色");
        }

        // Log audit before deletion
        auditLogService.logAction(currentUserId, "DELETE", "ADMINISTRATION",
            "Role", role.getId(), role, null, "Deleted role: " + role.getRoleCode());

        roleRepository.delete(role);
        log.info("Role deleted: {} by user {}", role.getRoleCode(), currentUserId);
    }

    /**
     * Search roles by keyword.
     * 按关键字搜索角色
     */
    @Transactional(readOnly = true)
    public Page<RoleDTO> searchRoles(String keyword, Pageable pageable) {
        return roleRepository.searchByKeyword(keyword, pageable).map(this::toDTO);
    }

    /**
     * Convert entity to DTO.
     * 将实体转换为DTO
     */
    private RoleDTO toDTO(Role role) {
        return RoleDTO.builder()
            .id(role.getId())
            .roleCode(role.getRoleCode())
            .roleName(role.getRoleName())
            .roleNameCn(role.getRoleNameCn())
            .description(role.getDescription())
            .descriptionCn(role.getDescriptionCn())
            .isSystemRole(role.getIsSystemRole())
            .status(role.getStatus())
            .permissions(role.getPermissions().stream()
                .map(p -> PermissionDTO.builder()
                    .id(p.getId())
                    .permissionCode(p.getPermissionCode())
                    .permissionName(p.getPermissionName())
                    .permissionNameCn(p.getPermissionNameCn())
                    .module(p.getModule())
                    .build())
                .collect(Collectors.toSet()))
            .createdAt(role.getCreatedAt())
            .updatedAt(role.getUpdatedAt())
            .build();
    }
}
