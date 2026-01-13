package com.secbank.cbs.controller;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.security.CurrentUser;
import com.secbank.cbs.security.UserPrincipal;
import com.secbank.cbs.service.UserService;
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

/**
 * User Controller / 用户控制器
 * REST API endpoints for user management.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management / 用户管理", description = "APIs for managing users / 用户管理相关API")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Operation(summary = "Get all users / 获取所有用户", description = "Get paginated list of all users / 分页获取所有用户列表")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getAllUsers(
            @PageableDefault(size = 20, sort = "username", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<UserDTO> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Operation(summary = "Get user by ID / 根据ID获取用户", description = "Get user details by ID / 根据ID获取用户详情")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/username/{username}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Operation(summary = "Get user by username / 根据用户名获取用户", description = "Get user details by username / 根据用户名获取用户详情")
    public ResponseEntity<ApiResponse<UserDTO>> getUserByUsername(@PathVariable String username) {
        UserDTO user = userService.getUserByUsername(username);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user / 获取当前用户", description = "Get current logged-in user details / 获取当前登录用户详情")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(@CurrentUser UserPrincipal currentUser) {
        UserDTO user = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE')")
    @Operation(summary = "Create user / 创建用户", description = "Create a new user / 创建新用户")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @Valid @RequestBody CreateUserRequest request,
            @CurrentUser UserPrincipal currentUser) {
        UserDTO user = userService.createUser(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("User created successfully / 用户创建成功", user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Operation(summary = "Update user / 更新用户", description = "Update an existing user / 更新现有用户")
    public ResponseEntity<ApiResponse<UserDTO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request,
            @CurrentUser UserPrincipal currentUser) {
        UserDTO user = userService.updateUser(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User updated successfully / 用户更新成功", user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_DELETE')")
    @Operation(summary = "Delete user / 删除用户", description = "Delete a user / 删除用户")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        userService.deleteUser(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully / 用户删除成功", null));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('USER_RESET_PASSWORD')")
    @Operation(summary = "Reset user password / 重置用户密码", description = "Reset password for a user / 重置用户密码")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request,
            @CurrentUser UserPrincipal currentUser) {
        userService.resetPassword(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully / 密码重置成功", null));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change own password / 修改自己的密码", description = "Change password for current user / 修改当前用户密码")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @CurrentUser UserPrincipal currentUser) {
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully / 密码修改成功", null));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Operation(summary = "Search users / 搜索用户", description = "Search users by keyword / 按关键字搜索用户")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> searchUsers(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "username", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<UserDTO> users = userService.searchUsers(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAuthority('USER_VIEW')")
    @Operation(summary = "Get users by branch / 根据分行获取用户", description = "Get users belonging to a specific branch / 获取特定分行的用户")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getUsersByBranch(
            @PathVariable Long branchId,
            @PageableDefault(size = 20, sort = "username", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<UserDTO> users = userService.getUsersByBranch(branchId, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
