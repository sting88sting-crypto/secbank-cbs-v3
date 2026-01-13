package com.secbank.cbs.dto;

import lombok.*;
import java.time.LocalDateTime;

/**
 * Branch DTO / 分行数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchDTO {
    private Long id;
    private String branchCode;
    private String branchName;
    private String branchNameCn;
    private String address;
    private String city;
    private String province;
    private String postalCode;
    private String phone;
    private String email;
    private String managerName;
    private Boolean isHeadOffice;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
