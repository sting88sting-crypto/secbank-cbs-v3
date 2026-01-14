package com.secbank.cbs.repository;

import com.secbank.cbs.entity.AccountType;
import com.secbank.cbs.entity.AccountType.AccountCategory;
import com.secbank.cbs.entity.AccountType.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountTypeRepository extends JpaRepository<AccountType, Long> {
    
    Optional<AccountType> findByTypeCode(String typeCode);
    
    boolean existsByTypeCode(String typeCode);
    
    List<AccountType> findByStatus(Status status);
    
    List<AccountType> findByCategory(AccountCategory category);
    
    List<AccountType> findByCategoryAndStatus(AccountCategory category, Status status);
    
    @Query("SELECT at FROM AccountType at WHERE at.status = 'ACTIVE'")
    List<AccountType> findAllActive();
    
    @Query("SELECT at FROM AccountType at WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(at.typeCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(at.typeName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:category IS NULL OR at.category = :category) AND " +
           "(:status IS NULL OR at.status = :status)")
    Page<AccountType> findByFilters(
            @Param("keyword") String keyword,
            @Param("category") AccountCategory category,
            @Param("status") Status status,
            Pageable pageable);
    
    long countByStatus(Status status);
    
    long countByCategory(AccountCategory category);
}
