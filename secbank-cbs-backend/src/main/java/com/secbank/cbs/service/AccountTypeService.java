package com.secbank.cbs.service;

import com.secbank.cbs.entity.AccountType;
import com.secbank.cbs.entity.AccountType.AccountCategory;
import com.secbank.cbs.entity.AccountType.Status;
import com.secbank.cbs.repository.AccountTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountTypeService {
    
    private final AccountTypeRepository accountTypeRepository;
    
    public Page<AccountType> findAll(Pageable pageable) {
        return accountTypeRepository.findAll(pageable);
    }
    
    public Page<AccountType> findByFilters(String keyword, AccountCategory category, Status status, Pageable pageable) {
        return accountTypeRepository.findByFilters(keyword, category, status, pageable);
    }
    
    public List<AccountType> findAllActive() {
        return accountTypeRepository.findAllActive();
    }
    
    public List<AccountType> findByCategory(AccountCategory category) {
        return accountTypeRepository.findByCategory(category);
    }
    
    public List<AccountType> findByCategoryAndStatus(AccountCategory category, Status status) {
        return accountTypeRepository.findByCategoryAndStatus(category, status);
    }
    
    public Optional<AccountType> findById(Long id) {
        return accountTypeRepository.findById(id);
    }
    
    public Optional<AccountType> findByTypeCode(String typeCode) {
        return accountTypeRepository.findByTypeCode(typeCode);
    }
    
    @Transactional
    public AccountType create(AccountType accountType, Long createdBy) {
        if (accountTypeRepository.existsByTypeCode(accountType.getTypeCode())) {
            throw new RuntimeException("Account type code already exists");
        }
        
        accountType.setStatus(Status.ACTIVE);
        accountType.setCreatedBy(createdBy);
        
        return accountTypeRepository.save(accountType);
    }
    
    @Transactional
    public AccountType update(Long id, AccountType updatedType, Long updatedBy) {
        AccountType accountType = accountTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account type not found"));
        
        // Don't allow changing type code
        accountType.setTypeName(updatedType.getTypeName());
        accountType.setTypeNameCn(updatedType.getTypeNameCn());
        accountType.setCategory(updatedType.getCategory());
        accountType.setDescription(updatedType.getDescription());
        accountType.setDescriptionCn(updatedType.getDescriptionCn());
        
        // Interest configuration
        accountType.setInterestRate(updatedType.getInterestRate());
        accountType.setInterestCalculation(updatedType.getInterestCalculation());
        accountType.setInterestPostingFrequency(updatedType.getInterestPostingFrequency());
        
        // Balance requirements
        accountType.setMinimumBalance(updatedType.getMinimumBalance());
        accountType.setMinimumOpeningBalance(updatedType.getMinimumOpeningBalance());
        accountType.setMaximumBalance(updatedType.getMaximumBalance());
        
        // Fees
        accountType.setMonthlyFee(updatedType.getMonthlyFee());
        accountType.setBelowMinimumFee(updatedType.getBelowMinimumFee());
        accountType.setDormancyFee(updatedType.getDormancyFee());
        
        // Transaction limits
        accountType.setDailyWithdrawalLimit(updatedType.getDailyWithdrawalLimit());
        accountType.setDailyTransferLimit(updatedType.getDailyTransferLimit());
        accountType.setMaxTransactionsPerDay(updatedType.getMaxTransactionsPerDay());
        
        // Time deposit
        accountType.setTermDays(updatedType.getTermDays());
        accountType.setEarlyWithdrawalPenaltyRate(updatedType.getEarlyWithdrawalPenaltyRate());
        
        // Eligibility
        accountType.setAllowIndividual(updatedType.getAllowIndividual());
        accountType.setAllowCorporate(updatedType.getAllowCorporate());
        accountType.setMinimumAge(updatedType.getMinimumAge());
        accountType.setMaximumAge(updatedType.getMaximumAge());
        
        accountType.setCurrency(updatedType.getCurrency());
        accountType.setUpdatedBy(updatedBy);
        
        return accountTypeRepository.save(accountType);
    }
    
    @Transactional
    public AccountType updateStatus(Long id, Status status, Long updatedBy) {
        AccountType accountType = accountTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account type not found"));
        
        accountType.setStatus(status);
        accountType.setUpdatedBy(updatedBy);
        
        return accountTypeRepository.save(accountType);
    }
    
    public boolean existsByTypeCode(String typeCode) {
        return accountTypeRepository.existsByTypeCode(typeCode);
    }
    
    public long countByStatus(Status status) {
        return accountTypeRepository.countByStatus(status);
    }
    
    public long countByCategory(AccountCategory category) {
        return accountTypeRepository.countByCategory(category);
    }
}
