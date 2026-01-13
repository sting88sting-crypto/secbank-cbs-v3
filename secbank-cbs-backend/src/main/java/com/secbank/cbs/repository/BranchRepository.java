package com.secbank.cbs.repository;

import com.secbank.cbs.entity.Branch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Branch Repository / 分行数据仓库
 */
@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {

    /**
     * Find branch by branch code.
     * 根据分行代码查找分行
     */
    Optional<Branch> findByBranchCode(String branchCode);

    /**
     * Check if branch code exists.
     * 检查分行代码是否存在
     */
    boolean existsByBranchCode(String branchCode);

    /**
     * Find all active branches.
     * 查找所有活跃分行
     */
    List<Branch> findByStatus(String status);

    /**
     * Find head office.
     * 查找总行
     */
    Optional<Branch> findByIsHeadOfficeTrue();

    /**
     * Search branches by name or code.
     * 按名称或代码搜索分行
     */
    @Query("SELECT b FROM Branch b WHERE " +
           "LOWER(b.branchCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.branchName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.branchNameCn) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Branch> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Find branches by status with pagination.
     * 分页查找指定状态的分行
     */
    Page<Branch> findByStatus(String status, Pageable pageable);

    /**
     * Count branches by status.
     * 按状态统计分行数量
     */
    long countByStatus(String status);
}
