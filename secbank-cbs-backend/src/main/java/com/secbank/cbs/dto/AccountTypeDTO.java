package com.secbank.cbs.dto;

import com.secbank.cbs.entity.AccountType;
import com.secbank.cbs.entity.AccountType.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Account Type DTO / 账户类型数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountTypeDTO {
    
    private Long id;
    private String typeCode;
    private String typeName;
    private String typeNameCn;
    private AccountCategory category;
    private String description;
    private String descriptionCn;
    
    // Interest
    private BigDecimal interestRate;
    private InterestCalculation interestCalculation;
    private PostingFrequency interestPostingFrequency;
    
    // Balance
    private BigDecimal minimumBalance;
    private BigDecimal minimumOpeningBalance;
    private BigDecimal maximumBalance;
    
    // Fees
    private BigDecimal monthlyFee;
    private BigDecimal belowMinimumFee;
    private BigDecimal dormancyFee;
    
    // Limits
    private BigDecimal dailyWithdrawalLimit;
    private BigDecimal dailyTransferLimit;
    private Integer maxTransactionsPerDay;
    
    // Time deposit
    private Integer termDays;
    private BigDecimal earlyWithdrawalPenaltyRate;
    
    // Eligibility
    private Boolean allowIndividual;
    private Boolean allowCorporate;
    private Integer minimumAge;
    private Integer maximumAge;
    
    private String currency;
    private Status status;
    
    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
    
    public static AccountTypeDTO fromEntity(AccountType accountType) {
        if (accountType == null) return null;
        
        return AccountTypeDTO.builder()
                .id(accountType.getId())
                .typeCode(accountType.getTypeCode())
                .typeName(accountType.getTypeName())
                .typeNameCn(accountType.getTypeNameCn())
                .category(accountType.getCategory())
                .description(accountType.getDescription())
                .descriptionCn(accountType.getDescriptionCn())
                .interestRate(accountType.getInterestRate())
                .interestCalculation(accountType.getInterestCalculation())
                .interestPostingFrequency(accountType.getInterestPostingFrequency())
                .minimumBalance(accountType.getMinimumBalance())
                .minimumOpeningBalance(accountType.getMinimumOpeningBalance())
                .maximumBalance(accountType.getMaximumBalance())
                .monthlyFee(accountType.getMonthlyFee())
                .belowMinimumFee(accountType.getBelowMinimumFee())
                .dormancyFee(accountType.getDormancyFee())
                .dailyWithdrawalLimit(accountType.getDailyWithdrawalLimit())
                .dailyTransferLimit(accountType.getDailyTransferLimit())
                .maxTransactionsPerDay(accountType.getMaxTransactionsPerDay())
                .termDays(accountType.getTermDays())
                .earlyWithdrawalPenaltyRate(accountType.getEarlyWithdrawalPenaltyRate())
                .allowIndividual(accountType.getAllowIndividual())
                .allowCorporate(accountType.getAllowCorporate())
                .minimumAge(accountType.getMinimumAge())
                .maximumAge(accountType.getMaximumAge())
                .currency(accountType.getCurrency())
                .status(accountType.getStatus())
                .createdAt(accountType.getCreatedAt())
                .updatedAt(accountType.getUpdatedAt())
                .createdBy(accountType.getCreatedBy())
                .updatedBy(accountType.getUpdatedBy())
                .build();
    }
}
