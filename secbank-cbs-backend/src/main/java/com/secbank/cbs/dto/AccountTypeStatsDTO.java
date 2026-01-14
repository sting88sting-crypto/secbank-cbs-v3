package com.secbank.cbs.dto;

import lombok.*;

/**
 * Account Type Statistics DTO / 账户类型统计数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountTypeStatsDTO {
    private long totalActive;
    private long totalInactive;
    private long totalSavings;
    private long totalCurrent;
    private long totalTimeDeposit;
}
