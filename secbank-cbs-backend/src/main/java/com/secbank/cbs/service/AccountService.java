package com.secbank.cbs.service;

import com.secbank.cbs.entity.Account;
import com.secbank.cbs.entity.Account.AccountStatus;
import com.secbank.cbs.entity.AccountType;
import com.secbank.cbs.entity.Branch;
import com.secbank.cbs.entity.Customer;
import com.secbank.cbs.repository.AccountRepository;
import com.secbank.cbs.repository.AccountTypeRepository;
import com.secbank.cbs.repository.BranchRepository;
import com.secbank.cbs.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountService {
    
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final AccountTypeRepository accountTypeRepository;
    private final BranchRepository branchRepository;
    
    public Page<Account> findAll(Pageable pageable) {
        return accountRepository.findAll(pageable);
    }
    
    public Page<Account> findByFilters(String keyword, AccountStatus status, Long branchId, 
                                        Long accountTypeId, Long customerId, Pageable pageable) {
        return accountRepository.findByFilters(keyword, status, branchId, accountTypeId, customerId, pageable);
    }
    
    public Page<Account> search(String keyword, Pageable pageable) {
        return accountRepository.searchAccounts(keyword, pageable);
    }
    
    public Optional<Account> findById(Long id) {
        return accountRepository.findById(id);
    }
    
    public Optional<Account> findByAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber);
    }
    
    public List<Account> findByCustomerId(Long customerId) {
        return accountRepository.findByCustomerId(customerId);
    }
    
    public List<Account> findByCustomerIdAndStatus(Long customerId, AccountStatus status) {
        return accountRepository.findByCustomerIdAndStatus(customerId, status);
    }
    
    public List<Account> findByBranchId(Long branchId) {
        return accountRepository.findByBranchId(branchId);
    }
    
    public List<Account> findByStatus(AccountStatus status) {
        return accountRepository.findByStatus(status);
    }
    
    @Transactional
    public Account openAccount(Long customerId, Long accountTypeId, Long branchId, 
                               BigDecimal initialDeposit, String accountName, Long createdBy) {
        // Validate customer
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        if (customer.getStatus() != Customer.CustomerStatus.ACTIVE) {
            throw new RuntimeException("Customer is not active");
        }
        
        // Validate account type
        AccountType accountType = accountTypeRepository.findById(accountTypeId)
                .orElseThrow(() -> new RuntimeException("Account type not found"));
        
        if (accountType.getStatus() != AccountType.Status.ACTIVE) {
            throw new RuntimeException("Account type is not active");
        }
        
        // Validate minimum opening balance
        if (accountType.getMinimumOpeningBalance() != null && 
            initialDeposit.compareTo(accountType.getMinimumOpeningBalance()) < 0) {
            throw new RuntimeException("Initial deposit is below minimum opening balance requirement of " + 
                                       accountType.getMinimumOpeningBalance());
        }
        
        // Validate customer type eligibility
        if (customer.getCustomerType() == Customer.CustomerType.INDIVIDUAL && 
            !Boolean.TRUE.equals(accountType.getAllowIndividual())) {
            throw new RuntimeException("This account type is not available for individual customers");
        }
        if (customer.getCustomerType() == Customer.CustomerType.CORPORATE && 
            !Boolean.TRUE.equals(accountType.getAllowCorporate())) {
            throw new RuntimeException("This account type is not available for corporate customers");
        }
        
        // Get branch
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        
        // Generate account number
        String accountNumber = generateAccountNumber(accountType, branch);
        
        // Create account
        Account account = new Account();
        account.setAccountNumber(accountNumber);
        account.setAccountName(accountName != null ? accountName : generateAccountName(customer));
        account.setCustomer(customer);
        account.setAccountType(accountType);
        account.setBranch(branch);
        account.setCurrentBalance(initialDeposit);
        account.setAvailableBalance(initialDeposit);
        account.setHoldBalance(BigDecimal.ZERO);
        account.setStatus(AccountStatus.ACTIVE);
        account.setOpenDate(LocalDate.now());
        account.setCurrency(accountType.getCurrency() != null ? accountType.getCurrency() : "PHP");
        account.setInterestRate(accountType.getInterestRate());
        account.setAccruedInterest(BigDecimal.ZERO);
        account.setLastInterestDate(LocalDate.now());
        account.setCreatedBy(createdBy);
        
        return accountRepository.save(account);
    }
    
    @Transactional
    public Account updateAccount(Long id, Account updatedAccount, Long updatedBy) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        account.setAccountName(updatedAccount.getAccountName());
        account.setRemarks(updatedAccount.getRemarks());
        account.setUpdatedBy(updatedBy);
        
        return accountRepository.save(account);
    }
    
    @Transactional
    public Account updateStatus(Long id, AccountStatus status, String reason, Long updatedBy) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        AccountStatus oldStatus = account.getStatus();
        
        // Validate status transitions
        validateStatusTransition(oldStatus, status);
        
        account.setStatus(status);
        account.setStatusReason(reason);
        account.setUpdatedBy(updatedBy);
        
        if (status == AccountStatus.CLOSED) {
            account.setCloseDate(LocalDate.now());
            account.setClosedBy(updatedBy);
        }
        
        return accountRepository.save(account);
    }
    
    @Transactional
    public Account freezeAccount(Long id, String reason, Long frozenBy) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        if (account.getStatus() != AccountStatus.ACTIVE && account.getStatus() != AccountStatus.DORMANT) {
            throw new RuntimeException("Only active or dormant accounts can be frozen");
        }
        
        account.setStatus(AccountStatus.FROZEN);
        account.setStatusReason(reason);
        account.setUpdatedBy(frozenBy);
        
        return accountRepository.save(account);
    }
    
    @Transactional
    public Account unfreezeAccount(Long id, Long unfrozenBy) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        if (account.getStatus() != AccountStatus.FROZEN) {
            throw new RuntimeException("Only frozen accounts can be unfrozen");
        }
        
        account.setStatus(AccountStatus.ACTIVE);
        account.setStatusReason(null);
        account.setUpdatedBy(unfrozenBy);
        
        return accountRepository.save(account);
    }
    
    @Transactional
    public Account closeAccount(Long id, String reason, Long closedBy) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        if (account.getStatus() == AccountStatus.CLOSED) {
            throw new RuntimeException("Account is already closed");
        }
        
        if (account.getCurrentBalance().compareTo(BigDecimal.ZERO) != 0) {
            throw new RuntimeException("Account balance must be zero before closing");
        }
        
        account.setStatus(AccountStatus.CLOSED);
        account.setStatusReason(reason);
        account.setCloseDate(LocalDate.now());
        account.setClosedBy(closedBy);
        account.setUpdatedBy(closedBy);
        
        return accountRepository.save(account);
    }
    
    @Transactional
    public Account updateBalance(Long id, BigDecimal newBalance, BigDecimal holdAmount, Long updatedBy) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        
        account.setCurrentBalance(newBalance);
        account.setHoldBalance(holdAmount != null ? holdAmount : account.getHoldBalance());
        account.setAvailableBalance(newBalance.subtract(account.getHoldBalance()));
        account.setLastTransactionDate(LocalDateTime.now());
        account.setUpdatedBy(updatedBy);
        
        return accountRepository.save(account);
    }
    
    public boolean existsByAccountNumber(String accountNumber) {
        return accountRepository.existsByAccountNumber(accountNumber);
    }
    
    public long countByStatus(AccountStatus status) {
        return accountRepository.countByStatus(status);
    }
    
    public long countByBranchId(Long branchId) {
        return accountRepository.countByBranchId(branchId);
    }
    
    public BigDecimal sumActiveBalances() {
        BigDecimal sum = accountRepository.sumActiveBalances();
        return sum != null ? sum : BigDecimal.ZERO;
    }
    
    public BigDecimal sumActiveBalancesByBranch(Long branchId) {
        BigDecimal sum = accountRepository.sumActiveBalancesByBranch(branchId);
        return sum != null ? sum : BigDecimal.ZERO;
    }
    
    private String generateAccountNumber(AccountType accountType, Branch branch) {
        // Format: BranchCode(3) + TypeCode(2) + Year(2) + Sequence(7)
        // Example: 001SA26-0000001
        String branchCode = branch.getBranchCode();
        if (branchCode.length() > 3) {
            branchCode = branchCode.substring(0, 3);
        }
        
        String typeCode = accountType.getTypeCode();
        if (typeCode.length() > 2) {
            typeCode = typeCode.substring(0, 2);
        }
        
        String year = String.valueOf(LocalDate.now().getYear()).substring(2);
        String prefix = branchCode + typeCode + year;
        
        String maxNumber = accountRepository.findMaxAccountNumberByPrefix(prefix);
        int sequence = 1;
        if (maxNumber != null && maxNumber.length() > prefix.length()) {
            try {
                String seqStr = maxNumber.substring(prefix.length()).replace("-", "");
                sequence = Integer.parseInt(seqStr) + 1;
            } catch (NumberFormatException e) {
                sequence = 1;
            }
        }
        
        return prefix + "-" + String.format("%07d", sequence);
    }
    
    private String generateAccountName(Customer customer) {
        if (customer.getCustomerType() == Customer.CustomerType.INDIVIDUAL) {
            return customer.getLastName() + ", " + customer.getFirstName();
        } else {
            return customer.getCompanyName();
        }
    }
    
    private void validateStatusTransition(AccountStatus from, AccountStatus to) {
        // Define valid transitions
        if (from == AccountStatus.CLOSED) {
            throw new RuntimeException("Cannot change status of a closed account");
        }
        
        if (from == AccountStatus.PENDING && to != AccountStatus.ACTIVE && to != AccountStatus.CLOSED) {
            throw new RuntimeException("Pending accounts can only be activated or closed");
        }
    }
}
