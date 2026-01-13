package com.secbank.cbs.security;

import com.secbank.cbs.entity.User;
import com.secbank.cbs.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Custom User Details Service / 自定义用户详情服务
 * Loads user details for Spring Security authentication.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameWithRolesAndPermissions(username)
            .orElseThrow(() -> new UsernameNotFoundException(
                "User not found with username: " + username + " / 未找到用户: " + username));
        
        return UserPrincipal.create(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UsernameNotFoundException(
                "User not found with id: " + id + " / 未找到用户ID: " + id));
        
        return UserPrincipal.create(user);
    }
}
