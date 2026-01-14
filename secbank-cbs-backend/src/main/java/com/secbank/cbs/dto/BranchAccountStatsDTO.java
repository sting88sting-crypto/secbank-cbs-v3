package com.secbank.cbs.dto;

import lombok.*;
import java.math.BigDecimal;

/**
 * Branch Account Statistics DTO / 分行账户统计数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchAccountStatsDTO {
    private Long branchId;
    private long totalAccounts;
    private BigDecimal totalBalance;
}
