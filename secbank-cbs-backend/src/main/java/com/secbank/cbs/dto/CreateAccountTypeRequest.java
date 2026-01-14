package com.secbank.cbs.dto;

import com.secbank.cbs.entity.AccountType.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Create Account Type Request / 创建账户类型请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAccountTypeRequest {
    
    @NotBlank(message = "Type code is required / 类型代码必填")
    @Size(max = 20, message = "Type code must be 20 characters or less / 类型代码不能超过20个字符")
    private String typeCode;
    
    @NotBlank(message = "Type name is required / 类型名称必填")
    @Size(max = 100, message = "Type name must be 100 characters or less / 类型名称不能超过100个字符")
    private String typeName;
    
    private String typeNameCn;
    
    @NotNull(message = "Category is required / 类别必填")
    private AccountCategory category;
    
    private String description;
    private String descriptionCn;
    
    // Interest
    @DecimalMin(value = "0.0", message = "Interest rate must be non-negative / 利率不能为负")
    private BigDecimal interestRate;
    
    private InterestCalculation interestCalculation;
    private PostingFrequency interestPostingFrequency;
    
    // Balance
    @DecimalMin(value = "0.0", message = "Minimum balance must be non-negative / 最低余额不能为负")
    private BigDecimal minimumBalance;
    
    @DecimalMin(value = "0.0", message = "Minimum opening balance must be non-negative / 最低开户余额不能为负")
    private BigDecimal minimumOpeningBalance;
    
    private BigDecimal maximumBalance;
    
    // Fees
    @DecimalMin(value = "0.0", message = "Monthly fee must be non-negative / 月费不能为负")
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
}
