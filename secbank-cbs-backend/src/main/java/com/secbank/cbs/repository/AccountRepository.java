package com.secbank.cbs.repository;

import com.secbank.cbs.entity.Account;
import com.secbank.cbs.entity.Account.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    
    Optional<Account> findByAccountNumber(String accountNumber);
    
    boolean existsByAccountNumber(String accountNumber);
    
    List<Account> findByCustomerId(Long customerId);
    
    List<Account> findByCustomerIdAndStatus(Long customerId, AccountStatus status);
    
    List<Account> findByBranchId(Long branchId);
    
    List<Account> findByAccountTypeId(Long accountTypeId);
    
    List<Account> findByStatus(AccountStatus status);
    
    @Query("SELECT a FROM Account a WHERE " +
           "(:keyword IS NULL OR :keyword = '' OR " +
           "LOWER(a.accountNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.accountName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.customer.customerNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:branchId IS NULL OR a.branch.id = :branchId) AND " +
           "(:accountTypeId IS NULL OR a.accountType.id = :accountTypeId) AND " +
           "(:customerId IS NULL OR a.customer.id = :customerId)")
    Page<Account> findByFilters(
            @Param("keyword") String keyword,
            @Param("status") AccountStatus status,
            @Param("branchId") Long branchId,
            @Param("accountTypeId") Long accountTypeId,
            @Param("customerId") Long customerId,
            Pageable pageable);
    
    @Query("SELECT a FROM Account a WHERE " +
           "(LOWER(a.accountNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(a.accountName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Account> searchAccounts(@Param("keyword") String keyword, Pageable pageable);
    
    long countByStatus(AccountStatus status);
    
    long countByBranchId(Long branchId);
    
    long countByAccountTypeId(Long accountTypeId);
    
    @Query("SELECT SUM(a.currentBalance) FROM Account a WHERE a.status = 'ACTIVE'")
    BigDecimal sumActiveBalances();
    
    @Query("SELECT SUM(a.currentBalance) FROM Account a WHERE a.branch.id = :branchId AND a.status = 'ACTIVE'")
    BigDecimal sumActiveBalancesByBranch(@Param("branchId") Long branchId);
    
    @Query("SELECT MAX(a.accountNumber) FROM Account a WHERE a.accountNumber LIKE :prefix%")
    String findMaxAccountNumberByPrefix(@Param("prefix") String prefix);
    
    @Query("SELECT COUNT(a) FROM Account a WHERE a.customer.id = :customerId AND a.status IN ('ACTIVE', 'DORMANT', 'FROZEN')")
    long countActiveAccountsByCustomer(@Param("customerId") Long customerId);
}
