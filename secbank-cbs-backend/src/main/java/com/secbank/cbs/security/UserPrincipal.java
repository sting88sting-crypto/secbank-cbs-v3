package com.secbank.cbs.security;

import com.secbank.cbs.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * User Principal / 用户主体
 * Implements Spring Security UserDetails for authentication.
 */
@Data
@AllArgsConstructor
@Builder
public class UserPrincipal implements UserDetails {

    private Long id;
    private String username;
    private String password;
    private String email;
    private String fullName;
    private Long branchId;
    private String status;
    private Boolean mustChangePassword;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        // Collect all permissions from all roles
        Set<GrantedAuthority> authorities = user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .map(permission -> new SimpleGrantedAuthority(permission.getPermissionCode()))
            .collect(Collectors.toSet());

        // Also add role codes as authorities
        user.getRoles().forEach(role -> 
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRoleCode())));

        return UserPrincipal.builder()
            .id(user.getId())
            .username(user.getUsername())
            .password(user.getPasswordHash())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
            .status(user.getStatus())
            .mustChangePassword(user.getMustChangePassword())
            .authorities(authorities)
            .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !"LOCKED".equals(status);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return "ACTIVE".equals(status);
    }
}
