package com.secbank.cbs.service;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.entity.Branch;
import com.secbank.cbs.entity.Role;
import com.secbank.cbs.entity.User;
import com.secbank.cbs.exception.BusinessException;
import com.secbank.cbs.exception.ResourceNotFoundException;
import com.secbank.cbs.repository.BranchRepository;
import com.secbank.cbs.repository.RoleRepository;
import com.secbank.cbs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * User Service / 用户服务
 * Handles all user-related business logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    /**
     * Get all users with pagination.
     * 分页获取所有用户
     */
    @Transactional(readOnly = true)
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toDTO);
    }

    /**
     * Get user by ID.
     * 根据ID获取用户
     */
    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return toDTO(user);
    }

    /**
     * Get user by username.
     * 根据用户名获取用户
     */
    @Transactional(readOnly = true)
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return toDTO(user);
    }

    /**
     * Create a new user.
     * 创建新用户
     */
    public UserDTO createUser(CreateUserRequest request, Long currentUserId) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("Username already exists / 用户名已存在: " + request.getUsername());
        }

        // Check if email already exists
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already exists / 邮箱已存在: " + request.getEmail());
        }

        // Get branch
        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", request.getBranchId()));
        }

        // Get roles
        Set<Role> roles = roleRepository.findByIdIn(request.getRoleIds());
        if (roles.isEmpty()) {
            throw new BusinessException("At least one valid role is required / 至少需要一个有效角色");
        }

        User user = User.builder()
            .username(request.getUsername())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .email(request.getEmail())
            .fullName(request.getFullName())
            .fullNameCn(request.getFullNameCn())
            .phone(request.getPhone())
            .employeeId(request.getEmployeeId())
            .branch(branch)
            .roles(roles)
            .status("ACTIVE")
            .mustChangePassword(true)
            .createdBy(currentUserId)
            .build();

        user = userRepository.save(user);

        // Log audit
        auditLogService.logAction(currentUserId, "CREATE", "ADMINISTRATION",
            "User", user.getId(), null, user, "Created user: " + user.getUsername());

        log.info("User created: {} by user {}", user.getUsername(), currentUserId);
        return toDTO(user);
    }

    /**
     * Update an existing user.
     * 更新现有用户
     */
    public UserDTO updateUser(Long id, UpdateUserRequest request, Long currentUserId) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Check email uniqueness if changed
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BusinessException("Email already exists / 邮箱已存在: " + request.getEmail());
            }
        }

        // Update fields
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getFullNameCn() != null) {
            user.setFullNameCn(request.getFullNameCn());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getEmployeeId() != null) {
            user.setEmployeeId(request.getEmployeeId());
        }
        if (request.getBranchId() != null) {
            Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", request.getBranchId()));
            user.setBranch(branch);
        }
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            Set<Role> roles = roleRepository.findByIdIn(request.getRoleIds());
            user.setRoles(roles);
        }
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        user.setUpdatedBy(currentUserId);
        user = userRepository.save(user);

        // Log audit
        auditLogService.logAction(currentUserId, "UPDATE", "ADMINISTRATION",
            "User", user.getId(), null, user, "Updated user: " + user.getUsername());

        log.info("User updated: {} by user {}", user.getUsername(), currentUserId);
        return toDTO(user);
    }

    /**
     * Delete a user.
     * 删除用户
     */
    public void deleteUser(Long id, Long currentUserId) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Cannot delete yourself
        if (user.getId().equals(currentUserId)) {
            throw new BusinessException("Cannot delete yourself / 无法删除自己");
        }

        // Log audit before deletion
        auditLogService.logAction(currentUserId, "DELETE", "ADMINISTRATION",
            "User", user.getId(), user, null, "Deleted user: " + user.getUsername());

        userRepository.delete(user);
        log.info("User deleted: {} by user {}", user.getUsername(), currentUserId);
    }

    /**
     * Reset user password.
     * 重置用户密码
     */
    public void resetPassword(Long id, ResetPasswordRequest request, Long currentUserId) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(true);
        user.setUpdatedBy(currentUserId);
        userRepository.save(user);

        // Log audit
        auditLogService.logAction(currentUserId, "RESET_PASSWORD", "ADMINISTRATION",
            "User", user.getId(), null, null, "Reset password for user: " + user.getUsername());

        log.info("Password reset for user: {} by user {}", user.getUsername(), currentUserId);
    }

    /**
     * Change own password.
     * 修改自己的密码
     */
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BusinessException("Current password is incorrect / 当前密码不正确");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        // Log audit
        auditLogService.logAction(userId, "CHANGE_PASSWORD", "ADMINISTRATION",
            "User", user.getId(), null, null, "Changed own password");

        log.info("Password changed for user: {}", user.getUsername());
    }

    /**
     * Search users by keyword.
     * 按关键字搜索用户
     */
    @Transactional(readOnly = true)
    public Page<UserDTO> searchUsers(String keyword, Pageable pageable) {
        return userRepository.searchByKeyword(keyword, pageable).map(this::toDTO);
    }

    /**
     * Get users by branch.
     * 根据分行获取用户
     */
    @Transactional(readOnly = true)
    public Page<UserDTO> getUsersByBranch(Long branchId, Pageable pageable) {
        return userRepository.findByBranchId(branchId, pageable).map(this::toDTO);
    }

    /**
     * Convert entity to DTO.
     * 将实体转换为DTO
     */
    private UserDTO toDTO(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .fullNameCn(user.getFullNameCn())
            .phone(user.getPhone())
            .employeeId(user.getEmployeeId())
            .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
            .branchName(user.getBranch() != null ? user.getBranch().getBranchName() : null)
            .status(user.getStatus())
            .lastLoginAt(user.getLastLoginAt())
            .mustChangePassword(user.getMustChangePassword())
            .roles(user.getRoles().stream()
                .map(role -> RoleDTO.builder()
                    .id(role.getId())
                    .roleCode(role.getRoleCode())
                    .roleName(role.getRoleName())
                    .roleNameCn(role.getRoleNameCn())
                    .build())
                .collect(Collectors.toSet()))
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
