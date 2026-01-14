package com.secbank.cbs.dto;

import com.secbank.cbs.entity.Customer.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Update Customer Request / 更新客户请求
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCustomerRequest {
    
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
    private IdType idType;
    private String idNumber;
    private LocalDate idExpiryDate;
    private String taxId;
    
    // Risk
    private RiskRating riskRating;
    
    private Long relationshipManager;
    
    private String remarks;
}
