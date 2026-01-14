package com.secbank.cbs.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Open Account Request / 开户请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpenAccountRequest {
    
    @NotNull(message = "Customer ID is required / 客户ID必填")
    private Long customerId;
    
    @NotNull(message = "Account type ID is required / 账户类型ID必填")
    private Long accountTypeId;
    
    @NotNull(message = "Branch ID is required / 分行ID必填")
    private Long branchId;
    
    @NotNull(message = "Initial deposit is required / 初始存款必填")
    @DecimalMin(value = "0.0", inclusive = false, message = "Initial deposit must be positive / 初始存款必须为正数")
    private BigDecimal initialDeposit;
    
    private String accountName;
    private String accountNameCn;
    
    // Optional flags
    private Boolean isJointAccount;
    private Boolean atmEnabled;
    private Boolean onlineBankingEnabled;
    private Boolean smsNotificationEnabled;
    private Boolean emailNotificationEnabled;
    
    private String signatureType;
    private String remarks;
}
