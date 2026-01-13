package com.secbank.cbs.repository;

import com.secbank.cbs.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * User Repository / 用户数据仓库
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by username.
     * 根据用户名查找用户
     */
    Optional<User> findByUsername(String username);

    /**
     * Find user by email.
     * 根据邮箱查找用户
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if username exists.
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);

    /**
     * Check if email exists.
     * 检查邮箱是否存在
     */
    boolean existsByEmail(String email);

    /**
     * Find users by status.
     * 根据状态查找用户
     */
    List<User> findByStatus(String status);

    /**
     * Find users by status with pagination.
     * 分页查找指定状态的用户
     */
    Page<User> findByStatus(String status, Pageable pageable);

    /**
     * Find users by branch.
     * 根据分行查找用户
     */
    List<User> findByBranchId(Long branchId);

    /**
     * Find users by branch with pagination.
     * 分页查找指定分行的用户
     */
    Page<User> findByBranchId(Long branchId, Pageable pageable);

    /**
     * Search users by name, username, or email.
     * 按姓名、用户名或邮箱搜索用户
     */
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.fullNameCn) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Update failed login attempts.
     * 更新登录失败次数
     */
    @Modifying
    @Query("UPDATE User u SET u.failedLoginAttempts = :attempts WHERE u.id = :userId")
    void updateFailedLoginAttempts(@Param("userId") Long userId, @Param("attempts") Integer attempts);

    /**
     * Update last login info.
     * 更新最后登录信息
     */
    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :loginTime, u.lastLoginIp = :ip, u.failedLoginAttempts = 0 WHERE u.id = :userId")
    void updateLastLogin(@Param("userId") Long userId, @Param("loginTime") LocalDateTime loginTime, @Param("ip") String ip);

    /**
     * Lock user account.
     * 锁定用户账户
     */
    @Modifying
    @Query("UPDATE User u SET u.status = 'LOCKED' WHERE u.id = :userId")
    void lockUser(@Param("userId") Long userId);

    /**
     * Count users by status.
     * 按状态统计用户数量
     */
    long countByStatus(String status);

    /**
     * Count users by branch.
     * 按分行统计用户数量
     */
    long countByBranchId(Long branchId);

    /**
     * Find user with roles eagerly loaded.
     * 查找用户并预加载角色
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.username = :username")
    Optional<User> findByUsernameWithRoles(@Param("username") String username);

    /**
     * Find user with roles and permissions eagerly loaded.
     * 查找用户并预加载角色和权限
     */
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.roles r " +
           "LEFT JOIN FETCH r.permissions " +
           "WHERE u.username = :username")
    Optional<User> findByUsernameWithRolesAndPermissions(@Param("username") String username);
}
