package com.secbank.cbs.dto;

import com.secbank.cbs.entity.Account;
import com.secbank.cbs.entity.Account.AccountStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Account DTO / 账户数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountDTO {
    
    private Long id;
    private String accountNumber;
    private String accountName;
    private String accountNameCn;
    
    // Customer
    private Long customerId;
    private String customerNumber;
    private String customerName;
    
    // Account Type
    private Long accountTypeId;
    private String accountTypeCode;
    private String accountTypeName;
    
    // Branch
    private Long branchId;
    private String branchCode;
    private String branchName;
    
    // Balance
    private String currency;
    private BigDecimal currentBalance;
    private BigDecimal availableBalance;
    private BigDecimal holdBalance;
    private BigDecimal overdraftLimit;
    
    // Interest
    private BigDecimal accruedInterest;
    private LocalDate lastInterestDate;
    private BigDecimal interestRate;
    
    // Time Deposit
    private LocalDate maturityDate;
    private BigDecimal principalAmount;
    private String maturityInstruction;
    
    // Dates
    private LocalDate openDate;
    private LocalDate closeDate;
    private LocalDateTime lastTransactionDate;
    private LocalDate dormantDate;
    
    // Status
    private AccountStatus status;
    private String statusReason;
    
    // Flags
    private Boolean isJointAccount;
    private Boolean allowDebit;
    private Boolean allowCredit;
    private Boolean atmEnabled;
    private Boolean onlineBankingEnabled;
    private Boolean smsNotificationEnabled;
    private Boolean emailNotificationEnabled;
    
    private String signatureType;
    private String passbookNumber;
    private String checkbookNumber;
    private String remarks;
    
    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
    private Long approvedBy;
    private LocalDateTime approvedAt;
    private Long closedBy;
    
    public static AccountDTO fromEntity(Account account) {
        if (account == null) return null;
        
        AccountDTOBuilder builder = AccountDTO.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountName(account.getAccountName())
                .accountNameCn(account.getAccountNameCn())
                .currency(account.getCurrency())
                .currentBalance(account.getCurrentBalance())
                .availableBalance(account.getAvailableBalance())
                .holdBalance(account.getHoldBalance())
                .overdraftLimit(account.getOverdraftLimit())
                .accruedInterest(account.getAccruedInterest())
                .lastInterestDate(account.getLastInterestDate())
                .interestRate(account.getInterestRate())
                .maturityDate(account.getMaturityDate())
                .principalAmount(account.getPrincipalAmount())
                .maturityInstruction(account.getMaturityInstruction())
                .openDate(account.getOpenDate())
                .closeDate(account.getCloseDate())
                .lastTransactionDate(account.getLastTransactionDate())
                .dormantDate(account.getDormantDate())
                .status(account.getStatus())
                .statusReason(account.getStatusReason())
                .isJointAccount(account.getIsJointAccount())
                .allowDebit(account.getAllowDebit())
                .allowCredit(account.getAllowCredit())
                .atmEnabled(account.getAtmEnabled())
                .onlineBankingEnabled(account.getOnlineBankingEnabled())
                .smsNotificationEnabled(account.getSmsNotificationEnabled())
                .emailNotificationEnabled(account.getEmailNotificationEnabled())
                .signatureType(account.getSignatureType())
                .passbookNumber(account.getPassbookNumber())
                .checkbookNumber(account.getCheckbookNumber())
                .remarks(account.getRemarks())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .createdBy(account.getCreatedBy())
                .updatedBy(account.getUpdatedBy())
                .approvedBy(account.getApprovedBy())
                .approvedAt(account.getApprovedAt())
                .closedBy(account.getClosedBy());
        
        if (account.getCustomer() != null) {
            builder.customerId(account.getCustomer().getId())
                   .customerNumber(account.getCustomer().getCustomerNumber())
                   .customerName(account.getCustomer().getDisplayName());
        }
        
        if (account.getAccountType() != null) {
            builder.accountTypeId(account.getAccountType().getId())
                   .accountTypeCode(account.getAccountType().getTypeCode())
                   .accountTypeName(account.getAccountType().getTypeName());
        }
        
        if (account.getBranch() != null) {
            builder.branchId(account.getBranch().getId())
                   .branchCode(account.getBranch().getBranchCode())
                   .branchName(account.getBranch().getBranchName());
        }
        
        return builder.build();
    }
}
