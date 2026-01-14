package com.secbank.cbs.controller;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.entity.Customer;
import com.secbank.cbs.entity.Customer.CustomerStatus;
import com.secbank.cbs.entity.Customer.CustomerType;
import com.secbank.cbs.security.CurrentUser;
import com.secbank.cbs.security.UserPrincipal;
import com.secbank.cbs.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Customer Controller / 客户控制器
 * REST API endpoints for customer management (CASA module).
 */
@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@Tag(name = "Customer Management / 客户管理", description = "APIs for managing customers / 客户管理相关API")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasAuthority('CASA_CUSTOMER_VIEW')")
    @Operation(summary = "Get all customers / 获取所有客户", description = "Get paginated list of all customers / 分页获取所有客户列表")
    public ResponseEntity<ApiResponse<Page<CustomerDTO>>> getAllCustomers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) CustomerType type,
            @RequestParam(required = false) CustomerStatus status,
            @RequestParam(required = false) Long branchId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Customer> customers = customerService.findByFilters(keyword, type, status, branchId, pageable);
        Page<CustomerDTO> dtos = customers.map(CustomerDTO::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CASA_CUSTOMER_VIEW')")
    @Operation(summary = "Get customer by ID / 根据ID获取客户", description = "Get customer details by ID / 根据ID获取客户详情")
    public ResponseEntity<ApiResponse<CustomerDTO>> getCustomerById(@PathVariable Long id) {
        Customer customer = customerService.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found / 客户不存在"));
        return ResponseEntity.ok(ApiResponse.success(CustomerDTO.fromEntity(customer)));
    }

    @GetMapping("/number/{customerNumber}")
    @PreAuthorize("hasAuthority('CASA_CUSTOMER_VIEW')")
    @Operation(summary = "Get customer by number / 根据客户号获取客户", description = "Get customer details by customer number / 根据客户号获取客户详情")
    public ResponseEntity<ApiResponse<CustomerDTO>> getCustomerByNumber(@PathVariable String customerNumber) {
        Customer customer = customerService.findByCustomerNumber(customerNumber)
                .orElseThrow(() -> new RuntimeException("Customer not found / 客户不存在"));
        return ResponseEntity.ok(ApiResponse.success(CustomerDTO.fromEntity(customer)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('CASA_CUSTOMER_VIEW')")
    @Operation(summary = "Search customers / 搜索客户", description = "Search customers by keyword / 按关键字搜索客户")
    public ResponseEntity<ApiResponse<Page<CustomerDTO>>> searchCustomers(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Customer> customers = customerService.search(keyword, pageable);
        Page<CustomerDTO> dtos = customers.map(CustomerDTO::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CASA_CUSTOMER_CREATE')")
    @Operation(summary = "Create customer / 创建客户", description = "Create a new customer / 创建新客户")
    public ResponseEntity<ApiResponse<CustomerDTO>> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        Customer customer = new Customer();
        customer.setCustomerType(request.getCustomerType());
        
        // Individual fields
        customer.setFirstName(request.getFirstName());
        customer.setMiddleName(request.getMiddleName());
        customer.setLastName(request.getLastName());
        customer.setFirstNameCn(request.getFirstNameCn());
        customer.setLastNameCn(request.getLastNameCn());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.getGender());
        customer.setNationality(request.getNationality());
        
        // Corporate fields
        customer.setCompanyName(request.getCompanyName());
        customer.setCompanyNameCn(request.getCompanyNameCn());
        customer.setRegistrationNumber(request.getRegistrationNumber());
        customer.setDateOfIncorporation(request.getDateOfIncorporation());
        customer.setIndustry(request.getIndustry());
        
        // Contact
        customer.setEmail(request.getEmail());
        customer.setMobilePhone(request.getMobilePhone());
        customer.setHomePhone(request.getHomePhone());
        customer.setWorkPhone(request.getWorkPhone());
        
        // Address
        customer.setAddressLine1(request.getAddressLine1());
        customer.setAddressLine2(request.getAddressLine2());
        customer.setCity(request.getCity());
        customer.setProvince(request.getProvince());
        customer.setPostalCode(request.getPostalCode());
        customer.setCountry(request.getCountry());
        
        // ID
        customer.setIdType(request.getIdType());
        customer.setIdNumber(request.getIdNumber());
        customer.setIdExpiryDate(request.getIdExpiryDate());
        customer.setTaxId(request.getTaxId());
        
        // Risk
        customer.setRiskRating(request.getRiskRating());
        customer.setRelationshipManager(request.getRelationshipManager());
        customer.setRemarks(request.getRemarks());
        
        Customer created = customerService.create(customer, request.getBranchId(), currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Customer created successfully / 客户创建成功", CustomerDTO.fromEntity(created)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CASA_CUSTOMER_UPDATE')")
    @Operation(summary = "Update customer / 更新客户", description = "Update an existing customer / 更新现有客户")
    public ResponseEntity<ApiResponse<CustomerDTO>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCustomerRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        Customer customer = new Customer();
        
        // Individual fields
        customer.setFirstName(request.getFirstName());
        customer.setMiddleName(request.getMiddleName());
        customer.setLastName(request.getLastName());
        customer.setFirstNameCn(request.getFirstNameCn());
        customer.setLastNameCn(request.getLastNameCn());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.getGender());
        customer.setNationality(request.getNationality());
        
        // Corporate fields
        customer.setCompanyName(request.getCompanyName());
        customer.setCompanyNameCn(request.getCompanyNameCn());
        customer.setRegistrationNumber(request.getRegistrationNumber());
        customer.setDateOfIncorporation(request.getDateOfIncorporation());
        customer.setIndustry(request.getIndustry());
        
        // Contact
        customer.setEmail(request.getEmail());
        customer.setMobilePhone(request.getMobilePhone());
        customer.setHomePhone(request.getHomePhone());
        customer.setWorkPhone(request.getWorkPhone());
        
        // Address
        customer.setAddressLine1(request.getAddressLine1());
        customer.setAddressLine2(request.getAddressLine2());
        customer.setCity(request.getCity());
        customer.setProvince(request.getProvince());
        customer.setPostalCode(request.getPostalCode());
        customer.setCountry(request.getCountry());
        
        // ID
        customer.setIdType(request.getIdType());
        customer.setIdNumber(request.getIdNumber());
        customer.setIdExpiryDate(request.getIdExpiryDate());
        customer.setTaxId(request.getTaxId());
        
        // Risk
        customer.setRiskRating(request.getRiskRating());
        customer.setRelationshipManager(request.getRelationshipManager());
        customer.setRemarks(request.getRemarks());
        
        Customer updated = customerService.update(id, customer, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Customer updated successfully / 客户更新成功", CustomerDTO.fromEntity(updated)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('CASA_CUSTOMER_UPDATE')")
    @Operation(summary = "Update customer status / 更新客户状态", description = "Update customer status / 更新客户状态")
    public ResponseEntity<ApiResponse<CustomerDTO>> updateCustomerStatus(
            @PathVariable Long id,
            @RequestParam CustomerStatus status,
            @CurrentUser UserPrincipal currentUser) {
        Customer updated = customerService.updateStatus(id, status, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Customer status updated / 客户状态已更新", CustomerDTO.fromEntity(updated)));
    }

    @PostMapping("/{id}/verify-kyc")
    @PreAuthorize("hasAuthority('CASA_CUSTOMER_UPDATE')")
    @Operation(summary = "Verify customer KYC / 验证客户KYC", description = "Mark customer KYC as verified / 标记客户KYC已验证")
    public ResponseEntity<ApiResponse<CustomerDTO>> verifyKyc(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        Customer updated = customerService.verifyKyc(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Customer KYC verified / 客户KYC已验证", CustomerDTO.fromEntity(updated)));
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAuthority('CASA_CUSTOMER_VIEW')")
    @Operation(summary = "Get customers by branch / 根据分行获取客户", description = "Get customers belonging to a specific branch / 获取特定分行的客户")
    public ResponseEntity<ApiResponse<Page<CustomerDTO>>> getCustomersByBranch(
            @PathVariable Long branchId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Customer> customers = customerService.findByFilters(null, null, null, branchId, pageable);
        Page<CustomerDTO> dtos = customers.map(CustomerDTO::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('CASA_CUSTOMER_VIEW')")
    @Operation(summary = "Get customer statistics / 获取客户统计", description = "Get customer count statistics / 获取客户数量统计")
    public ResponseEntity<ApiResponse<CustomerStatsDTO>> getCustomerStats() {
        CustomerStatsDTO stats = CustomerStatsDTO.builder()
                .totalActive(customerService.countByStatus(CustomerStatus.ACTIVE))
                .totalInactive(customerService.countByStatus(CustomerStatus.INACTIVE))
                .totalBlocked(customerService.countByStatus(CustomerStatus.BLOCKED))
                .totalIndividual(customerService.countByType(CustomerType.INDIVIDUAL))
                .totalCorporate(customerService.countByType(CustomerType.CORPORATE))
                .build();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
