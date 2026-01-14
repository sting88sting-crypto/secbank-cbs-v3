package com.secbank.cbs.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * Account Statistics DTO / 账户统计数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountStatsDTO {
    private long totalActive;
    private long totalDormant;
    private long totalFrozen;
    private long totalClosed;
    private BigDecimal totalActiveBalance;
}
