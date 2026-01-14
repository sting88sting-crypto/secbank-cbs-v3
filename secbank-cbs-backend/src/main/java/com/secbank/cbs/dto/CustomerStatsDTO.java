package com.secbank.cbs.dto;

import lombok.*;

/**
 * Customer Statistics DTO / 客户统计数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerStatsDTO {
    private long totalActive;
    private long totalInactive;
    private long totalBlocked;
    private long totalIndividual;
    private long totalCorporate;
}
