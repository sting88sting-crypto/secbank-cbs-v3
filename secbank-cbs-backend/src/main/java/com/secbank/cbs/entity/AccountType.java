package com.secbank.cbs.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "type_code", unique = true, nullable = false, length = 20)
    private String typeCode;
    
    @Column(name = "type_name", nullable = false, length = 100)
    private String typeName;
    
    @Column(name = "type_name_cn", length = 100)
    private String typeNameCn;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private AccountCategory category;  // SAVINGS, CURRENT, TIME_DEPOSIT
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "description_cn", columnDefinition = "TEXT")
    private String descriptionCn;
    
    // Interest Configuration
    @Column(name = "interest_rate", precision = 8, scale = 4)
    private BigDecimal interestRate;  // Annual interest rate (e.g., 0.0250 = 2.50%)
    
    @Enumerated(EnumType.STRING)
    @Column(name = "interest_calculation", length = 20)
    private InterestCalculation interestCalculation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "interest_posting_frequency", length = 20)
    private PostingFrequency interestPostingFrequency;
    
    // Balance Requirements
    @Column(name = "minimum_balance", precision = 18, scale = 2)
    private BigDecimal minimumBalance;
    
    @Column(name = "minimum_opening_balance", precision = 18, scale = 2)
    private BigDecimal minimumOpeningBalance;
    
    @Column(name = "maximum_balance", precision = 18, scale = 2)
    private BigDecimal maximumBalance;
    
    // Fees
    @Column(name = "monthly_fee", precision = 18, scale = 2)
    private BigDecimal monthlyFee;
    
    @Column(name = "below_minimum_fee", precision = 18, scale = 2)
    private BigDecimal belowMinimumFee;  // Fee when balance falls below minimum
    
    @Column(name = "dormancy_fee", precision = 18, scale = 2)
    private BigDecimal dormancyFee;
    
    // Transaction Limits
    @Column(name = "daily_withdrawal_limit", precision = 18, scale = 2)
    private BigDecimal dailyWithdrawalLimit;
    
    @Column(name = "daily_transfer_limit", precision = 18, scale = 2)
    private BigDecimal dailyTransferLimit;
    
    @Column(name = "max_transactions_per_day")
    private Integer maxTransactionsPerDay;
    
    // Time Deposit Specific
    @Column(name = "term_days")
    private Integer termDays;  // For time deposits
    
    @Column(name = "early_withdrawal_penalty_rate", precision = 8, scale = 4)
    private BigDecimal earlyWithdrawalPenaltyRate;
    
    // Eligibility
    @Column(name = "allow_individual")
    private Boolean allowIndividual = true;
    
    @Column(name = "allow_corporate")
    private Boolean allowCorporate = true;
    
    @Column(name = "minimum_age")
    private Integer minimumAge;
    
    @Column(name = "maximum_age")
    private Integer maximumAge;
    
    // Currency
    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "PHP";
    
    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status = Status.ACTIVE;
    
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
    
    // Enums
    public enum AccountCategory {
        SAVINGS,        // 储蓄账户
        CURRENT,        // 活期账户/支票账户
        TIME_DEPOSIT    // 定期存款
    }
    
    public enum InterestCalculation {
        DAILY_BALANCE,      // 日均余额
        MINIMUM_BALANCE,    // 最低余额
        AVERAGE_BALANCE     // 平均余额
    }
    
    public enum PostingFrequency {
        DAILY,
        MONTHLY,
        QUARTERLY,
        SEMI_ANNUALLY,
        ANNUALLY,
        AT_MATURITY
    }
    
    public enum Status {
        ACTIVE, INACTIVE
    }
}
