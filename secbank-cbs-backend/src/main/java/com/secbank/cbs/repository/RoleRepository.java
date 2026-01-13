package com.secbank.cbs.repository;

import com.secbank.cbs.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Role Repository / 角色数据仓库
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Find role by code.
     * 根据角色代码查找角色
     */
    Optional<Role> findByRoleCode(String roleCode);

    /**
     * Check if role code exists.
     * 检查角色代码是否存在
     */
    boolean existsByRoleCode(String roleCode);

    /**
     * Find all active roles.
     * 查找所有活跃角色
     */
    List<Role> findByStatus(String status);

    /**
     * Find roles by status with pagination.
     * 分页查找指定状态的角色
     */
    Page<Role> findByStatus(String status, Pageable pageable);

    /**
     * Find roles by IDs.
     * 根据ID列表查找角色
     */
    Set<Role> findByIdIn(Set<Long> ids);

    /**
     * Search roles by name or code.
     * 按名称或代码搜索角色
     */
    @Query("SELECT r FROM Role r WHERE " +
           "LOWER(r.roleCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.roleName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.roleNameCn) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Role> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Find non-system roles.
     * 查找非系统角色
     */
    List<Role> findByIsSystemRoleFalse();

    /**
     * Count roles by status.
     * 按状态统计角色数量
     */
    long countByStatus(String status);
}
