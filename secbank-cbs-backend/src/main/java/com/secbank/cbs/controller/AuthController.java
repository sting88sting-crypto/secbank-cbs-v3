package com.secbank.cbs.controller;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.entity.User;
import com.secbank.cbs.repository.UserRepository;
import com.secbank.cbs.security.CustomUserDetailsService;
import com.secbank.cbs.security.JwtTokenProvider;
import com.secbank.cbs.security.UserPrincipal;
import com.secbank.cbs.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * Authentication Controller / 认证控制器
 * REST API endpoints for user authentication.
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication / 认证", description = "APIs for user authentication / 用户认证相关API")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @PostMapping("/login")
    @Operation(summary = "User login / 用户登录", description = "Authenticate user and return JWT tokens / 认证用户并返回JWT令牌")
    @Transactional
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String accessToken = tokenProvider.generateAccessToken(userPrincipal);
        String refreshToken = tokenProvider.generateRefreshToken(userPrincipal);

        // Update last login info
        String clientIp = getClientIp(httpRequest);
        userRepository.updateLastLogin(userPrincipal.getId(), LocalDateTime.now(), clientIp);

        // Log audit
        auditLogService.logAction(userPrincipal.getId(), "LOGIN", "AUTHENTICATION",
            "User", userPrincipal.getId(), null, null, "User logged in");

        LoginResponse response = LoginResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(86400L)
            .userId(userPrincipal.getId())
            .username(userPrincipal.getUsername())
            .fullName(userPrincipal.getFullName())
            .email(userPrincipal.getEmail())
            .branchId(userPrincipal.getBranchId())
            .mustChangePassword(userPrincipal.getMustChangePassword())
            .build();

        log.info("User logged in: {}", userPrincipal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Login successful / 登录成功", response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh token / 刷新令牌", description = "Refresh access token using refresh token / 使用刷新令牌获取新的访问令牌")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(
            @Valid @RequestBody TokenRefreshRequest request) {
        
        String refreshToken = request.getRefreshToken();
        
        if (!tokenProvider.validateToken(refreshToken) || !tokenProvider.isRefreshToken(refreshToken)) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid refresh token / 无效的刷新令牌"));
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        UserPrincipal userPrincipal = (UserPrincipal) userDetailsService.loadUserById(userId);

        String newAccessToken = tokenProvider.generateAccessToken(userPrincipal);

        TokenRefreshResponse response = TokenRefreshResponse.builder()
            .accessToken(newAccessToken)
            .tokenType("Bearer")
            .expiresIn(86400L)
            .build();

        return ResponseEntity.ok(ApiResponse.success("Token refreshed / 令牌已刷新", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout / 用户登出", description = "Logout user and invalidate session / 登出用户并使会话失效")
    public ResponseEntity<ApiResponse<Void>> logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            auditLogService.logAction(userPrincipal.getId(), "LOGOUT", "AUTHENTICATION",
                "User", userPrincipal.getId(), null, null, "User logged out");
            log.info("User logged out: {}", userPrincipal.getUsername());
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Logout successful / 登出成功", null));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
