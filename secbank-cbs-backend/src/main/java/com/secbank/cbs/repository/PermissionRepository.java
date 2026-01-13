package com.secbank.cbs.repository;

import com.secbank.cbs.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Permission Repository / 权限数据仓库
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    /**
     * Find permission by code.
     * 根据权限代码查找权限
     */
    Optional<Permission> findByPermissionCode(String permissionCode);

    /**
     * Check if permission code exists.
     * 检查权限代码是否存在
     */
    boolean existsByPermissionCode(String permissionCode);

    /**
     * Find permissions by module.
     * 根据模块查找权限
     */
    List<Permission> findByModule(String module);

    /**
     * Find permissions by IDs.
     * 根据ID列表查找权限
     */
    Set<Permission> findByIdIn(Set<Long> ids);

    /**
     * Find all distinct modules.
     * 查找所有不同的模块
     */
    @Query("SELECT DISTINCT p.module FROM Permission p ORDER BY p.module")
    List<String> findAllModules();

    /**
     * Find permissions by codes.
     * 根据权限代码列表查找权限
     */
    List<Permission> findByPermissionCodeIn(List<String> permissionCodes);
}
