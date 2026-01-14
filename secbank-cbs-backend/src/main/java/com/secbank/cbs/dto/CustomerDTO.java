package com.secbank.cbs.dto;

import com.secbank.cbs.entity.Customer;
import com.secbank.cbs.entity.Customer.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Customer DTO / 客户数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDTO {
    
    private Long id;
    private String customerNumber;
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
    
    // Risk & Compliance
    private RiskRating riskRating;
    private Boolean kycVerified;
    private LocalDateTime kycVerifiedDate;
    private Long kycVerifiedBy;
    
    // Branch
    private Long branchId;
    private String branchName;
    private Long relationshipManager;
    
    // Status
    private CustomerStatus status;
    private String remarks;
    
    // Audit
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long createdBy;
    private Long updatedBy;
    
    // Computed fields
    private String displayName;
    private String displayNameCn;
    
    public static CustomerDTO fromEntity(Customer customer) {
        if (customer == null) return null;
        
        CustomerDTOBuilder builder = CustomerDTO.builder()
                .id(customer.getId())
                .customerNumber(customer.getCustomerNumber())
                .customerType(customer.getCustomerType())
                .firstName(customer.getFirstName())
                .middleName(customer.getMiddleName())
                .lastName(customer.getLastName())
                .firstNameCn(customer.getFirstNameCn())
                .lastNameCn(customer.getLastNameCn())
                .dateOfBirth(customer.getDateOfBirth())
                .gender(customer.getGender())
                .nationality(customer.getNationality())
                .companyName(customer.getCompanyName())
                .companyNameCn(customer.getCompanyNameCn())
                .registrationNumber(customer.getRegistrationNumber())
                .dateOfIncorporation(customer.getDateOfIncorporation())
                .industry(customer.getIndustry())
                .email(customer.getEmail())
                .mobilePhone(customer.getMobilePhone())
                .homePhone(customer.getHomePhone())
                .workPhone(customer.getWorkPhone())
                .addressLine1(customer.getAddressLine1())
                .addressLine2(customer.getAddressLine2())
                .city(customer.getCity())
                .province(customer.getProvince())
                .postalCode(customer.getPostalCode())
                .country(customer.getCountry())
                .idType(customer.getIdType())
                .idNumber(customer.getIdNumber())
                .idExpiryDate(customer.getIdExpiryDate())
                .taxId(customer.getTaxId())
                .riskRating(customer.getRiskRating())
                .kycVerified(customer.getKycVerified())
                .kycVerifiedDate(customer.getKycVerifiedDate())
                .kycVerifiedBy(customer.getKycVerifiedBy())
                .relationshipManager(customer.getRelationshipManager())
                .status(customer.getStatus())
                .remarks(customer.getRemarks())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .createdBy(customer.getCreatedBy())
                .updatedBy(customer.getUpdatedBy())
                .displayName(customer.getDisplayName())
                .displayNameCn(customer.getDisplayNameCn());
        
        if (customer.getBranch() != null) {
            builder.branchId(customer.getBranch().getId())
                   .branchName(customer.getBranch().getBranchName());
        }
        
        return builder.build();
    }
}
