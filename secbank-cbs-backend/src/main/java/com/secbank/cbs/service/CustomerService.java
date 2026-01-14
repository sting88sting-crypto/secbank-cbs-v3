package com.secbank.cbs.service;

import com.secbank.cbs.entity.Branch;
import com.secbank.cbs.entity.Customer;
import com.secbank.cbs.entity.Customer.CustomerStatus;
import com.secbank.cbs.entity.Customer.CustomerType;
import com.secbank.cbs.repository.BranchRepository;
import com.secbank.cbs.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {
    
    private final CustomerRepository customerRepository;
    private final BranchRepository branchRepository;
    
    public Page<Customer> findAll(Pageable pageable) {
        return customerRepository.findAll(pageable);
    }
    
    public Page<Customer> findByType(CustomerType type, Pageable pageable) {
        if (type == null) {
            return customerRepository.findAll(pageable);
        }
        return customerRepository.findByCustomerType(type, pageable);
    }
    
    public Page<Customer> findByFilters(String keyword, CustomerType type, CustomerStatus status, Long branchId, Pageable pageable) {
        // If no filters, just return by type or all
        if ((keyword == null || keyword.isEmpty()) && status == null && branchId == null) {
            if (type == null) {
                return customerRepository.findAll(pageable);
            }
            return customerRepository.findByCustomerType(type, pageable);
        }
        
        // Use the complex query only when needed
        return customerRepository.findByFilters(keyword, type, status, branchId, pageable);
    }
    
    public Page<Customer> search(String keyword, Pageable pageable) {
        return customerRepository.searchCustomers(keyword, pageable);
    }
    
    public Optional<Customer> findById(Long id) {
        return customerRepository.findById(id);
    }
    
    public Optional<Customer> findByCustomerNumber(String customerNumber) {
        return customerRepository.findByCustomerNumber(customerNumber);
    }
    
    public List<Customer> findByStatus(CustomerStatus status) {
        return customerRepository.findByStatus(status);
    }
    
    public List<Customer> findByBranchId(Long branchId) {
        return customerRepository.findByBranchId(branchId);
    }
    
    @Transactional
    public Customer create(Customer customer, Long branchId, Long createdBy) {
        // Generate customer number
        String customerNumber = generateCustomerNumber(customer.getCustomerType());
        customer.setCustomerNumber(customerNumber);
        
        // Set branch
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId)
                    .orElseThrow(() -> new RuntimeException("Branch not found"));
            customer.setBranch(branch);
        }
        
        // Set defaults
        customer.setStatus(CustomerStatus.ACTIVE);
        customer.setKycVerified(false);
        customer.setCreatedBy(createdBy);
        
        return customerRepository.save(customer);
    }
    
    @Transactional
    public Customer update(Long id, Customer updatedCustomer, Long updatedBy) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        // Update individual fields
        if (customer.getCustomerType() == CustomerType.INDIVIDUAL) {
            customer.setFirstName(updatedCustomer.getFirstName());
            customer.setMiddleName(updatedCustomer.getMiddleName());
            customer.setLastName(updatedCustomer.getLastName());
            customer.setFirstNameCn(updatedCustomer.getFirstNameCn());
            customer.setLastNameCn(updatedCustomer.getLastNameCn());
            customer.setDateOfBirth(updatedCustomer.getDateOfBirth());
            customer.setGender(updatedCustomer.getGender());
            customer.setNationality(updatedCustomer.getNationality());
        } else {
            // Update corporate fields
            customer.setCompanyName(updatedCustomer.getCompanyName());
            customer.setCompanyNameCn(updatedCustomer.getCompanyNameCn());
            customer.setRegistrationNumber(updatedCustomer.getRegistrationNumber());
            customer.setDateOfIncorporation(updatedCustomer.getDateOfIncorporation());
            customer.setIndustry(updatedCustomer.getIndustry());
        }
        
        // Update contact info
        customer.setEmail(updatedCustomer.getEmail());
        customer.setMobilePhone(updatedCustomer.getMobilePhone());
        customer.setHomePhone(updatedCustomer.getHomePhone());
        customer.setWorkPhone(updatedCustomer.getWorkPhone());
        
        // Update address
        customer.setAddressLine1(updatedCustomer.getAddressLine1());
        customer.setAddressLine2(updatedCustomer.getAddressLine2());
        customer.setCity(updatedCustomer.getCity());
        customer.setProvince(updatedCustomer.getProvince());
        customer.setPostalCode(updatedCustomer.getPostalCode());
        customer.setCountry(updatedCustomer.getCountry());
        
        // Update ID info
        customer.setIdType(updatedCustomer.getIdType());
        customer.setIdNumber(updatedCustomer.getIdNumber());
        customer.setIdExpiryDate(updatedCustomer.getIdExpiryDate());
        customer.setTaxId(updatedCustomer.getTaxId());
        
        // Update risk rating
        customer.setRiskRating(updatedCustomer.getRiskRating());
        customer.setRemarks(updatedCustomer.getRemarks());
        
        customer.setUpdatedBy(updatedBy);
        
        return customerRepository.save(customer);
    }
    
    @Transactional
    public Customer updateStatus(Long id, CustomerStatus status, Long updatedBy) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        customer.setStatus(status);
        customer.setUpdatedBy(updatedBy);
        
        return customerRepository.save(customer);
    }
    
    @Transactional
    public Customer verifyKyc(Long id, Long verifiedBy) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        customer.setKycVerified(true);
        customer.setKycVerifiedDate(java.time.LocalDateTime.now());
        customer.setKycVerifiedBy(verifiedBy);
        customer.setUpdatedBy(verifiedBy);
        
        return customerRepository.save(customer);
    }
    
    public boolean existsByCustomerNumber(String customerNumber) {
        return customerRepository.existsByCustomerNumber(customerNumber);
    }
    
    public boolean existsByEmail(String email) {
        return customerRepository.existsByEmail(email);
    }
    
    public boolean existsByIdNumber(String idNumber) {
        return customerRepository.existsByIdNumber(idNumber);
    }
    
    public long countByStatus(CustomerStatus status) {
        return customerRepository.countByStatus(status);
    }
    
    public long countByType(CustomerType type) {
        return customerRepository.countByCustomerType(type);
    }
    
    private String generateCustomerNumber(CustomerType type) {
        // Format: CIF + Year(2) + Type(1) + Sequence(6)
        // Example: CIF24I000001 (Individual), CIF24C000001 (Corporate)
        String year = String.valueOf(LocalDate.now().getYear()).substring(2);
        String typeCode = type == CustomerType.INDIVIDUAL ? "I" : "C";
        String prefix = "CIF" + year + typeCode;
        
        String maxNumber = customerRepository.findMaxCustomerNumberByPrefix(prefix);
        int sequence = 1;
        if (maxNumber != null && maxNumber.length() > prefix.length()) {
            try {
                sequence = Integer.parseInt(maxNumber.substring(prefix.length())) + 1;
            } catch (NumberFormatException e) {
                sequence = 1;
            }
        }
        
        return prefix + String.format("%06d", sequence);
    }
}
