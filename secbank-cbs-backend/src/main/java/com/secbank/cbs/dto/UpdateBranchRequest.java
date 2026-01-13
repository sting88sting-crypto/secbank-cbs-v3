package com.secbank.cbs.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Update Branch Request / 更新分行请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBranchRequest {
    
    @Size(max = 100, message = "Branch name must not exceed 100 characters / 分行名称不能超过100个字符")
    private String branchName;
    
    @Size(max = 100, message = "Branch name (CN) must not exceed 100 characters / 分行中文名称不能超过100个字符")
    private String branchNameCn;
    
    @Size(max = 500, message = "Address must not exceed 500 characters / 地址不能超过500个字符")
    private String address;
    
    @Size(max = 100, message = "City must not exceed 100 characters / 城市不能超过100个字符")
    private String city;
    
    @Size(max = 100, message = "Province must not exceed 100 characters / 省份不能超过100个字符")
    private String province;
    
    @Size(max = 20, message = "Postal code must not exceed 20 characters / 邮编不能超过20个字符")
    private String postalCode;
    
    @Size(max = 50, message = "Phone must not exceed 50 characters / 电话不能超过50个字符")
    private String phone;
    
    @Size(max = 100, message = "Email must not exceed 100 characters / 邮箱不能超过100个字符")
    private String email;
    
    @Size(max = 100, message = "Manager name must not exceed 100 characters / 经理姓名不能超过100个字符")
    private String managerName;
    
    @Pattern(regexp = "^(ACTIVE|INACTIVE|CLOSED)$", message = "Status must be ACTIVE, INACTIVE or CLOSED / 状态必须为ACTIVE、INACTIVE或CLOSED")
    private String status;
}
