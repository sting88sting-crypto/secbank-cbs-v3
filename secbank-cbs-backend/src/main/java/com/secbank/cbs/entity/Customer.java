package com.secbank.cbs.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "customer_number", unique = true, nullable = false, length = 20)
    private String customerNumber;  // CIF Number (Customer Information File)
    
    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type", nullable = false, length = 20)
    private CustomerType customerType;  // INDIVIDUAL or CORPORATE
    
    // Individual Customer Fields
    @Column(name = "first_name", length = 100)
    private String firstName;
    
    @Column(name = "middle_name", length = 100)
    private String middleName;
    
    @Column(name = "last_name", length = 100)
    private String lastName;
    
    @Column(name = "first_name_cn", length = 100)
    private String firstNameCn;  // Chinese name
    
    @Column(name = "last_name_cn", length = 100)
    private String lastNameCn;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 10)
    private Gender gender;
    
    @Column(name = "nationality", length = 50)
    private String nationality;
    
    // Corporate Customer Fields
    @Column(name = "company_name", length = 200)
    private String companyName;
    
    @Column(name = "company_name_cn", length = 200)
    private String companyNameCn;
    
    @Column(name = "registration_number", length = 50)
    private String registrationNumber;  // Business registration number
    
    @Column(name = "date_of_incorporation")
    private LocalDate dateOfIncorporation;
    
    @Column(name = "industry", length = 100)
    private String industry;
    
    // Contact Information
    @Column(name = "email", length = 100)
    private String email;
    
    @Column(name = "mobile_phone", length = 20)
    private String mobilePhone;
    
    @Column(name = "home_phone", length = 20)
    private String homePhone;
    
    @Column(name = "work_phone", length = 20)
    private String workPhone;
    
    // Address
    @Column(name = "address_line1", length = 200)
    private String addressLine1;
    
    @Column(name = "address_line2", length = 200)
    private String addressLine2;
    
    @Column(name = "city", length = 100)
    private String city;
    
    @Column(name = "province", length = 100)
    private String province;
    
    @Column(name = "postal_code", length = 20)
    private String postalCode;
    
    @Column(name = "country", length = 50)
    private String country;
    
    // Identification
    @Enumerated(EnumType.STRING)
    @Column(name = "id_type", length = 30)
    private IdType idType;
    
    @Column(name = "id_number", length = 50)
    private String idNumber;
    
    @Column(name = "id_expiry_date")
    private LocalDate idExpiryDate;
    
    @Column(name = "tax_id", length = 50)
    private String taxId;  // TIN (Tax Identification Number)
    
    // Risk & Compliance
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_rating", length = 20)
    private RiskRating riskRating;
    
    @Column(name = "kyc_verified")
    private Boolean kycVerified = false;
    
    @Column(name = "kyc_verified_date")
    private LocalDateTime kycVerifiedDate;
    
    @Column(name = "kyc_verified_by")
    private Long kycVerifiedBy;
    
    // Branch & Relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;
    
    @Column(name = "relationship_manager")
    private Long relationshipManager;  // User ID of RM
    
    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private CustomerStatus status = CustomerStatus.ACTIVE;
    
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
    
    // Audit fields
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "updated_by")
    private Long updatedBy;
    
    // Enums
    public enum CustomerType {
        INDIVIDUAL, CORPORATE
    }
    
    public enum Gender {
        MALE, FEMALE, OTHER
    }
    
    public enum IdType {
        PASSPORT, NATIONAL_ID, DRIVERS_LICENSE, SSS, GSIS, TIN, COMPANY_ID, OTHER
    }
    
    public enum RiskRating {
        LOW, MEDIUM, HIGH
    }
    
    public enum CustomerStatus {
        ACTIVE, INACTIVE, BLOCKED, DECEASED
    }
    
    // Helper method to get display name
    public String getDisplayName() {
        if (customerType == CustomerType.CORPORATE) {
            return companyName;
        } else {
            StringBuilder name = new StringBuilder();
            if (firstName != null) name.append(firstName);
            if (middleName != null) name.append(" ").append(middleName);
            if (lastName != null) name.append(" ").append(lastName);
            return name.toString().trim();
        }
    }
    
    public String getDisplayNameCn() {
        if (customerType == CustomerType.CORPORATE) {
            return companyNameCn;
        } else {
            StringBuilder name = new StringBuilder();
            if (lastNameCn != null) name.append(lastNameCn);
            if (firstNameCn != null) name.append(firstNameCn);
            return name.toString().trim();
        }
    }
}
