package com.secbank.cbs.service;

import com.secbank.cbs.dto.PermissionDTO;
import com.secbank.cbs.entity.Permission;
import com.secbank.cbs.exception.ResourceNotFoundException;
import com.secbank.cbs.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Permission Service / 权限服务
 * Handles all permission-related business logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PermissionService {

    private final PermissionRepository permissionRepository;

    /**
     * Get all permissions.
     * 获取所有权限
     */
    public List<PermissionDTO> getAllPermissions() {
        return permissionRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get permissions grouped by module.
     * 按模块分组获取权限
     */
    public Map<String, List<PermissionDTO>> getPermissionsByModule() {
        return permissionRepository.findAll().stream()
            .map(this::toDTO)
            .collect(Collectors.groupingBy(PermissionDTO::getModule));
    }

    /**
     * Get permissions by module.
     * 根据模块获取权限
     */
    public List<PermissionDTO> getPermissionsByModule(String module) {
        return permissionRepository.findByModule(module).stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get permission by ID.
     * 根据ID获取权限
     */
    public PermissionDTO getPermissionById(Long id) {
        Permission permission = permissionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", id));
        return toDTO(permission);
    }

    /**
     * Get all distinct modules.
     * 获取所有不同的模块
     */
    public List<String> getAllModules() {
        return permissionRepository.findAllModules();
    }

    /**
     * Convert entity to DTO.
     * 将实体转换为DTO
     */
    private PermissionDTO toDTO(Permission permission) {
        return PermissionDTO.builder()
            .id(permission.getId())
            .permissionCode(permission.getPermissionCode())
            .permissionName(permission.getPermissionName())
            .permissionNameCn(permission.getPermissionNameCn())
            .module(permission.getModule())
            .description(permission.getDescription())
            .descriptionCn(permission.getDescriptionCn())
            .build();
    }
}
