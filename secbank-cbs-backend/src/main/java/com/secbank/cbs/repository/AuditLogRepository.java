package com.secbank.cbs.repository;

import com.secbank.cbs.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * AuditLog Repository / 审计日志数据仓库
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find audit logs by user ID.
     * 根据用户ID查找审计日志
     */
    Page<AuditLog> findByUserId(Long userId, Pageable pageable);

    /**
     * Find audit logs by module.
     * 根据模块查找审计日志
     */
    Page<AuditLog> findByModule(String module, Pageable pageable);

    /**
     * Find audit logs by action.
     * 根据操作类型查找审计日志
     */
    Page<AuditLog> findByAction(String action, Pageable pageable);

    /**
     * Find audit logs by entity type and ID.
     * 根据实体类型和ID查找审计日志
     */
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);

    /**
     * Find audit logs within date range.
     * 查找指定日期范围内的审计日志
     */
    @Query("SELECT a FROM AuditLog a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    Page<AuditLog> findByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * Search audit logs with multiple filters.
     * 多条件搜索审计日志
     */
    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:userId IS NULL OR a.userId = :userId) AND " +
           "(:module IS NULL OR a.module = :module) AND " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:startDate IS NULL OR a.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR a.createdAt <= :endDate) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> searchAuditLogs(
        @Param("userId") Long userId,
        @Param("module") String module,
        @Param("action") String action,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * Find all distinct actions.
     * 查找所有不同的操作类型
     */
    @Query("SELECT DISTINCT a.action FROM AuditLog a ORDER BY a.action")
    List<String> findAllActions();

    /**
     * Find all distinct modules.
     * 查找所有不同的模块
     */
    @Query("SELECT DISTINCT a.module FROM AuditLog a ORDER BY a.module")
    List<String> findAllModules();
}
