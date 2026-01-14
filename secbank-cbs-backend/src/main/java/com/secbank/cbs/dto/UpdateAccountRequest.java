package com.secbank.cbs.dto;

import lombok.*;

/**
 * Update Account Request / 更新账户请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAccountRequest {
    private String accountName;
    private String accountNameCn;
    private Boolean atmEnabled;
    private Boolean onlineBankingEnabled;
    private Boolean smsNotificationEnabled;
    private Boolean emailNotificationEnabled;
    private String remarks;
}
