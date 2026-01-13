package com.secbank.cbs.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT Token Provider / JWT令牌提供者
 * Handles JWT token generation and validation.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret:SecBankCBSV2SecretKeyForJWTTokenGenerationMustBeAtLeast256Bits}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration-ms:604800000}")
    private long jwtRefreshExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate access token from authentication.
     * 从认证信息生成访问令牌
     */
    public String generateAccessToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return generateAccessToken(userPrincipal);
    }

    /**
     * Generate access token from user principal.
     * 从用户主体生成访问令牌
     */
    public String generateAccessToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
            .subject(Long.toString(userPrincipal.getId()))
            .claim("username", userPrincipal.getUsername())
            .claim("email", userPrincipal.getEmail())
            .claim("branchId", userPrincipal.getBranchId())
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey())
            .compact();
    }

    /**
     * Generate refresh token from user principal.
     * 从用户主体生成刷新令牌
     */
    public String generateRefreshToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtRefreshExpirationMs);

        return Jwts.builder()
            .subject(Long.toString(userPrincipal.getId()))
            .claim("type", "refresh")
            .issuedAt(now)
            .expiration(expiryDate)
            .signWith(getSigningKey())
            .compact();
    }

    /**
     * Get user ID from token.
     * 从令牌获取用户ID
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
            .verifyWith(getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();

        return Long.parseLong(claims.getSubject());
    }

    /**
     * Validate JWT token.
     * 验证JWT令牌
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token / 无效的JWT令牌");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token / JWT令牌已过期");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token / 不支持的JWT令牌");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty / JWT声明字符串为空");
        }
        return false;
    }

    /**
     * Check if token is a refresh token.
     * 检查令牌是否为刷新令牌
     */
    public boolean isRefreshToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return "refresh".equals(claims.get("type"));
        } catch (Exception e) {
            return false;
        }
    }
}
