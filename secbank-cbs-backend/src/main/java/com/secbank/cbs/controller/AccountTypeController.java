package com.secbank.cbs.controller;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.entity.AccountType;
import com.secbank.cbs.entity.AccountType.AccountCategory;
import com.secbank.cbs.entity.AccountType.Status;
import com.secbank.cbs.security.CurrentUser;
import com.secbank.cbs.security.UserPrincipal;
import com.secbank.cbs.service.AccountTypeService;
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

import java.util.List;
import java.util.stream.Collectors;

/**
 * Account Type Controller / 账户类型控制器
 * REST API endpoints for account type management (CASA module).
 */
@RestController
@RequestMapping("/api/v1/account-types")
@RequiredArgsConstructor
@Tag(name = "Account Type Management / 账户类型管理", description = "APIs for managing account types / 账户类型管理相关API")
public class AccountTypeController {

    private final AccountTypeService accountTypeService;

    @GetMapping
    @PreAuthorize("hasAuthority('CASA_TYPE_VIEW')")
    @Operation(summary = "Get all account types / 获取所有账户类型", description = "Get paginated list of all account types / 分页获取所有账户类型列表")
    public ResponseEntity<ApiResponse<Page<AccountTypeDTO>>> getAllAccountTypes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AccountCategory category,
            @RequestParam(required = false) Status status,
            @PageableDefault(size = 20, sort = "typeCode", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<AccountType> types = accountTypeService.findByFilters(keyword, category, status, pageable);
        Page<AccountTypeDTO> dtos = types.map(AccountTypeDTO::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('CASA_TYPE_VIEW')")
    @Operation(summary = "Get active account types / 获取活跃账户类型", description = "Get list of all active account types / 获取所有活跃账户类型列表")
    public ResponseEntity<ApiResponse<List<AccountTypeDTO>>> getActiveAccountTypes() {
        List<AccountType> types = accountTypeService.findAllActive();
        List<AccountTypeDTO> dtos = types.stream()
                .map(AccountTypeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAuthority('CASA_TYPE_VIEW')")
    @Operation(summary = "Get account types by category / 根据类别获取账户类型", description = "Get account types by category / 根据类别获取账户类型")
    public ResponseEntity<ApiResponse<List<AccountTypeDTO>>> getAccountTypesByCategory(
            @PathVariable AccountCategory category) {
        List<AccountType> types = accountTypeService.findByCategoryAndStatus(category, Status.ACTIVE);
        List<AccountTypeDTO> dtos = types.stream()
                .map(AccountTypeDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CASA_TYPE_VIEW')")
    @Operation(summary = "Get account type by ID / 根据ID获取账户类型", description = "Get account type details by ID / 根据ID获取账户类型详情")
    public ResponseEntity<ApiResponse<AccountTypeDTO>> getAccountTypeById(@PathVariable Long id) {
        AccountType type = accountTypeService.findById(id)
                .orElseThrow(() -> new RuntimeException("Account type not found / 账户类型不存在"));
        return ResponseEntity.ok(ApiResponse.success(AccountTypeDTO.fromEntity(type)));
    }

    @GetMapping("/code/{typeCode}")
    @PreAuthorize("hasAuthority('CASA_TYPE_VIEW')")
    @Operation(summary = "Get account type by code / 根据代码获取账户类型", description = "Get account type details by type code / 根据类型代码获取账户类型详情")
    public ResponseEntity<ApiResponse<AccountTypeDTO>> getAccountTypeByCode(@PathVariable String typeCode) {
        AccountType type = accountTypeService.findByTypeCode(typeCode)
                .orElseThrow(() -> new RuntimeException("Account type not found / 账户类型不存在"));
        return ResponseEntity.ok(ApiResponse.success(AccountTypeDTO.fromEntity(type)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CASA_TYPE_CREATE')")
    @Operation(summary = "Create account type / 创建账户类型", description = "Create a new account type / 创建新账户类型")
    public ResponseEntity<ApiResponse<AccountTypeDTO>> createAccountType(
            @Valid @RequestBody CreateAccountTypeRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        AccountType accountType = new AccountType();
        accountType.setTypeCode(request.getTypeCode());
        accountType.setTypeName(request.getTypeName());
        accountType.setTypeNameCn(request.getTypeNameCn());
        accountType.setCategory(request.getCategory());
        accountType.setDescription(request.getDescription());
        accountType.setDescriptionCn(request.getDescriptionCn());
        
        // Interest
        accountType.setInterestRate(request.getInterestRate());
        accountType.setInterestCalculation(request.getInterestCalculation());
        accountType.setInterestPostingFrequency(request.getInterestPostingFrequency());
        
        // Balance
        accountType.setMinimumBalance(request.getMinimumBalance());
        accountType.setMinimumOpeningBalance(request.getMinimumOpeningBalance());
        accountType.setMaximumBalance(request.getMaximumBalance());
        
        // Fees
        accountType.setMonthlyFee(request.getMonthlyFee());
        accountType.setBelowMinimumFee(request.getBelowMinimumFee());
        accountType.setDormancyFee(request.getDormancyFee());
        
        // Limits
        accountType.setDailyWithdrawalLimit(request.getDailyWithdrawalLimit());
        accountType.setDailyTransferLimit(request.getDailyTransferLimit());
        accountType.setMaxTransactionsPerDay(request.getMaxTransactionsPerDay());
        
        // Time deposit
        accountType.setTermDays(request.getTermDays());
        accountType.setEarlyWithdrawalPenaltyRate(request.getEarlyWithdrawalPenaltyRate());
        
        // Eligibility
        accountType.setAllowIndividual(request.getAllowIndividual() != null ? request.getAllowIndividual() : true);
        accountType.setAllowCorporate(request.getAllowCorporate() != null ? request.getAllowCorporate() : true);
        accountType.setMinimumAge(request.getMinimumAge());
        accountType.setMaximumAge(request.getMaximumAge());
        
        accountType.setCurrency(request.getCurrency() != null ? request.getCurrency() : "PHP");
        
        AccountType created = accountTypeService.create(accountType, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Account type created successfully / 账户类型创建成功", AccountTypeDTO.fromEntity(created)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CASA_TYPE_UPDATE')")
    @Operation(summary = "Update account type / 更新账户类型", description = "Update an existing account type / 更新现有账户类型")
    public ResponseEntity<ApiResponse<AccountTypeDTO>> updateAccountType(
            @PathVariable Long id,
            @Valid @RequestBody CreateAccountTypeRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        AccountType accountType = new AccountType();
        accountType.setTypeName(request.getTypeName());
        accountType.setTypeNameCn(request.getTypeNameCn());
        accountType.setCategory(request.getCategory());
        accountType.setDescription(request.getDescription());
        accountType.setDescriptionCn(request.getDescriptionCn());
        
        // Interest
        accountType.setInterestRate(request.getInterestRate());
        accountType.setInterestCalculation(request.getInterestCalculation());
        accountType.setInterestPostingFrequency(request.getInterestPostingFrequency());
        
        // Balance
        accountType.setMinimumBalance(request.getMinimumBalance());
        accountType.setMinimumOpeningBalance(request.getMinimumOpeningBalance());
        accountType.setMaximumBalance(request.getMaximumBalance());
        
        // Fees
        accountType.setMonthlyFee(request.getMonthlyFee());
        accountType.setBelowMinimumFee(request.getBelowMinimumFee());
        accountType.setDormancyFee(request.getDormancyFee());
        
        // Limits
        accountType.setDailyWithdrawalLimit(request.getDailyWithdrawalLimit());
        accountType.setDailyTransferLimit(request.getDailyTransferLimit());
        accountType.setMaxTransactionsPerDay(request.getMaxTransactionsPerDay());
        
        // Time deposit
        accountType.setTermDays(request.getTermDays());
        accountType.setEarlyWithdrawalPenaltyRate(request.getEarlyWithdrawalPenaltyRate());
        
        // Eligibility
        accountType.setAllowIndividual(request.getAllowIndividual());
        accountType.setAllowCorporate(request.getAllowCorporate());
        accountType.setMinimumAge(request.getMinimumAge());
        accountType.setMaximumAge(request.getMaximumAge());
        
        accountType.setCurrency(request.getCurrency());
        
        AccountType updated = accountTypeService.update(id, accountType, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Account type updated successfully / 账户类型更新成功", AccountTypeDTO.fromEntity(updated)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('CASA_TYPE_UPDATE')")
    @Operation(summary = "Update account type status / 更新账户类型状态", description = "Update account type status / 更新账户类型状态")
    public ResponseEntity<ApiResponse<AccountTypeDTO>> updateAccountTypeStatus(
            @PathVariable Long id,
            @RequestParam Status status,
            @CurrentUser UserPrincipal currentUser) {
        AccountType updated = accountTypeService.updateStatus(id, status, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Account type status updated / 账户类型状态已更新", AccountTypeDTO.fromEntity(updated)));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('CASA_TYPE_VIEW')")
    @Operation(summary = "Get account type statistics / 获取账户类型统计", description = "Get account type count statistics / 获取账户类型数量统计")
    public ResponseEntity<ApiResponse<AccountTypeStatsDTO>> getAccountTypeStats() {
        AccountTypeStatsDTO stats = AccountTypeStatsDTO.builder()
                .totalActive(accountTypeService.countByStatus(Status.ACTIVE))
                .totalInactive(accountTypeService.countByStatus(Status.INACTIVE))
                .totalSavings(accountTypeService.countByCategory(AccountCategory.SAVINGS))
                .totalCurrent(accountTypeService.countByCategory(AccountCategory.CURRENT))
                .totalTimeDeposit(accountTypeService.countByCategory(AccountCategory.TIME_DEPOSIT))
                .build();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
