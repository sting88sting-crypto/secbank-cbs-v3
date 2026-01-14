package com.secbank.cbs.dto;

import com.secbank.cbs.entity.Customer.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Create Customer Request / 创建客户请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCustomerRequest {
    
    @NotNull(message = "Customer type is required / 客户类型必填")
    private CustomerType customerType;
    
    // Individual fields
    private String firstName;
    private String middleName;
    private String lastName;
    private String firstNameCn;
    private String lastNameCn;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String nationality;
    
    // Corporate fields
    private String companyName;
    private String companyNameCn;
    private String registrationNumber;
    private LocalDate dateOfIncorporation;
    private String industry;
    
    // Contact
    @Email(message = "Invalid email format / 邮箱格式无效")
    private String email;
    
    private String mobilePhone;
    private String homePhone;
    private String workPhone;
    
    // Address
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String province;
    private String postalCode;
    private String country;
    
    // ID
    @NotNull(message = "ID type is required / 证件类型必填")
    private IdType idType;
    
    @NotBlank(message = "ID number is required / 证件号码必填")
    private String idNumber;
    
    private LocalDate idExpiryDate;
    private String taxId;
    
    // Risk
    private RiskRating riskRating;
    
    // Branch
    @NotNull(message = "Branch ID is required / 分行ID必填")
    private Long branchId;
    
    private Long relationshipManager;
    
    private String remarks;
}
