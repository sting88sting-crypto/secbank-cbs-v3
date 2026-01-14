package com.secbank.cbs.repository;

import com.secbank.cbs.entity.Customer;
import com.secbank.cbs.entity.Customer.CustomerStatus;
import com.secbank.cbs.entity.Customer.CustomerType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByCustomerNumber(String customerNumber);
    
    boolean existsByCustomerNumber(String customerNumber);
    
    boolean existsByEmail(String email);
    
    boolean existsByIdNumber(String idNumber);
    
    List<Customer> findByStatus(CustomerStatus status);
    
    List<Customer> findByCustomerType(CustomerType customerType);
    
    List<Customer> findByBranchId(Long branchId);
    
    @Query("SELECT c FROM Customer c WHERE c.status = :status AND c.customerType = :type")
    List<Customer> findByStatusAndType(@Param("status") CustomerStatus status, @Param("type") CustomerType type);
    
    @Query("SELECT c FROM Customer c WHERE " +
           "(LOWER(c.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.customerNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.mobilePhone) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Customer> searchCustomers(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT c FROM Customer c WHERE " +
           "(:keyword IS NULL OR " +
           "LOWER(COALESCE(c.firstName, '')) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%')) OR " +
           "LOWER(COALESCE(c.lastName, '')) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%')) OR " +
           "LOWER(COALESCE(c.companyName, '')) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%')) OR " +
           "LOWER(COALESCE(c.customerNumber, '')) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%')) OR " +
           "LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', COALESCE(:keyword, ''), '%'))) AND " +
           "(:type IS NULL OR c.customerType = :type) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:branchId IS NULL OR c.branch.id = :branchId)")
    Page<Customer> findByFilters(
            @Param("keyword") String keyword,
            @Param("type") CustomerType type,
            @Param("status") CustomerStatus status,
            @Param("branchId") Long branchId,
            Pageable pageable);
    
    // Simple findAll with pagination by type
    Page<Customer> findByCustomerType(CustomerType customerType, Pageable pageable);
    
    // Simple findAll with pagination by type and status
    Page<Customer> findByCustomerTypeAndStatus(CustomerType customerType, CustomerStatus status, Pageable pageable);
    
    long countByStatus(CustomerStatus status);
    
    long countByCustomerType(CustomerType customerType);
    
    @Query("SELECT MAX(c.customerNumber) FROM Customer c WHERE c.customerNumber LIKE :prefix%")
    String findMaxCustomerNumberByPrefix(@Param("prefix") String prefix);
}
