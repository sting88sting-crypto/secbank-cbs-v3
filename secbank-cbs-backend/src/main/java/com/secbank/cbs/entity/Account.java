package com.secbank.cbs.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Account {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "account_number", unique = true, nullable = false, length = 20)
    private String accountNumber;
    
    @Column(name = "account_name", nullable = false, length = 200)
    private String accountName;
    
    @Column(name = "account_name_cn", length = 200)
    private String accountNameCn;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_type_id", nullable = false)
    private AccountType accountType;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;
    
    // Balance Information
    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "PHP";
    
    @Column(name = "current_balance", precision = 18, scale = 2, nullable = false)
    private BigDecimal currentBalance = BigDecimal.ZERO;
    
    @Column(name = "available_balance", precision = 18, scale = 2, nullable = false)
    private BigDecimal availableBalance = BigDecimal.ZERO;
    
    @Column(name = "hold_balance", precision = 18, scale = 2)
    private BigDecimal holdBalance = BigDecimal.ZERO;
    
    @Column(name = "overdraft_limit", precision = 18, scale = 2)
    private BigDecimal overdraftLimit = BigDecimal.ZERO;
    
    // Interest
    @Column(name = "accrued_interest", precision = 18, scale = 2)
    private BigDecimal accruedInterest = BigDecimal.ZERO;
    
    @Column(name = "last_interest_date")
    private LocalDate lastInterestDate;
    
    @Column(name = "interest_rate", precision = 8, scale = 4)
    private BigDecimal interestRate;  // Current interest rate (may differ from account type)
    
    @Column(name = "interest_rate_override", precision = 8, scale = 4)
    private BigDecimal interestRateOverride;  // Override account type rate if needed
    
    // Time Deposit Specific
    @Column(name = "maturity_date")
    private LocalDate maturityDate;
    
    @Column(name = "principal_amount", precision = 18, scale = 2)
    private BigDecimal principalAmount;
    
    @Column(name = "maturity_instruction", length = 20)
    private String maturityInstruction;  // AUTO_RENEW, CREDIT_TO_ACCOUNT, etc.
    
    // Account Dates
    @Column(name = "open_date", nullable = false)
    private LocalDate openDate;
    
    @Column(name = "close_date")
    private LocalDate closeDate;
    
    @Column(name = "last_transaction_date")
    private LocalDateTime lastTransactionDate;
    
    @Column(name = "dormant_date")
    private LocalDate dormantDate;
    
    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AccountStatus status = AccountStatus.ACTIVE;
    
    @Column(name = "status_reason", length = 200)
    private String statusReason;
    
    // Flags
    @Column(name = "is_joint_account")
    private Boolean isJointAccount = false;
    
    @Column(name = "allow_debit")
    private Boolean allowDebit = true;
    
    @Column(name = "allow_credit")
    private Boolean allowCredit = true;
    
    @Column(name = "atm_enabled")
    private Boolean atmEnabled = true;
    
    @Column(name = "online_banking_enabled")
    private Boolean onlineBankingEnabled = true;
    
    @Column(name = "sms_notification_enabled")
    private Boolean smsNotificationEnabled = false;
    
    @Column(name = "email_notification_enabled")
    private Boolean emailNotificationEnabled = false;
    
    // Signature
    @Column(name = "signature_type", length = 20)
    private String signatureType;  // SINGLE, JOINT_AND, JOINT_OR
    
    // Passbook/Checkbook
    @Column(name = "passbook_number", length = 50)
    private String passbookNumber;
    
    @Column(name = "checkbook_number", length = 50)
    private String checkbookNumber;
    
    // Remarks
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
    
    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    @Column(name = "approved_by")
    private Long approvedBy;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "closed_by")
    private Long closedBy;
    
    // Enums
    public enum AccountStatus {
        PENDING,        // 待审批
        ACTIVE,         // 正常
        DORMANT,        // 休眠
        FROZEN,         // 冻结
        BLOCKED,        // 锁定
        CLOSED          // 已关闭
    }
}
