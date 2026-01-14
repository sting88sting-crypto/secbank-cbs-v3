package com.secbank.cbs.controller;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.entity.Account;
import com.secbank.cbs.entity.Account.AccountStatus;
import com.secbank.cbs.security.CurrentUser;
import com.secbank.cbs.security.UserPrincipal;
import com.secbank.cbs.service.AccountService;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Account Controller / 账户控制器
 * REST API endpoints for account management (CASA module).
 */
@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Account Management / 账户管理", description = "APIs for managing accounts / 账户管理相关API")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_VIEW')")
    @Operation(summary = "Get all accounts / 获取所有账户", description = "Get paginated list of all accounts / 分页获取所有账户列表")
    public ResponseEntity<ApiResponse<Page<AccountDTO>>> getAllAccounts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Long accountTypeId,
            @RequestParam(required = false) Long customerId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Account> accounts = accountService.findByFilters(keyword, status, branchId, accountTypeId, customerId, pageable);
        Page<AccountDTO> dtos = accounts.map(AccountDTO::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_VIEW')")
    @Operation(summary = "Get account by ID / 根据ID获取账户", description = "Get account details by ID / 根据ID获取账户详情")
    public ResponseEntity<ApiResponse<AccountDTO>> getAccountById(@PathVariable Long id) {
        Account account = accountService.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found / 账户不存在"));
        return ResponseEntity.ok(ApiResponse.success(AccountDTO.fromEntity(account)));
    }

    @GetMapping("/number/{accountNumber}")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_VIEW')")
    @Operation(summary = "Get account by number / 根据账号获取账户", description = "Get account details by account number / 根据账号获取账户详情")
    public ResponseEntity<ApiResponse<AccountDTO>> getAccountByNumber(@PathVariable String accountNumber) {
        Account account = accountService.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found / 账户不存在"));
        return ResponseEntity.ok(ApiResponse.success(AccountDTO.fromEntity(account)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_VIEW')")
    @Operation(summary = "Search accounts / 搜索账户", description = "Search accounts by keyword / 按关键字搜索账户")
    public ResponseEntity<ApiResponse<Page<AccountDTO>>> searchAccounts(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Account> accounts = accountService.search(keyword, pageable);
        Page<AccountDTO> dtos = accounts.map(AccountDTO::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_VIEW')")
    @Operation(summary = "Get accounts by customer / 根据客户获取账户", description = "Get accounts belonging to a specific customer / 获取特定客户的账户")
    public ResponseEntity<ApiResponse<List<AccountDTO>>> getAccountsByCustomer(@PathVariable Long customerId) {
        List<Account> accounts = accountService.findByCustomerId(customerId);
        List<AccountDTO> dtos = accounts.stream()
                .map(AccountDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_VIEW')")
    @Operation(summary = "Get accounts by branch / 根据分行获取账户", description = "Get accounts belonging to a specific branch / 获取特定分行的账户")
    public ResponseEntity<ApiResponse<Page<AccountDTO>>> getAccountsByBranch(
            @PathVariable Long branchId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Account> accounts = accountService.findByFilters(null, null, branchId, null, null, pageable);
        Page<AccountDTO> dtos = accounts.map(AccountDTO::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping("/open")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_CREATE')")
    @Operation(summary = "Open account / 开户", description = "Open a new account for a customer / 为客户开立新账户")
    public ResponseEntity<ApiResponse<AccountDTO>> openAccount(
            @Valid @RequestBody OpenAccountRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        Account account = accountService.openAccount(
                request.getCustomerId(),
                request.getAccountTypeId(),
                request.getBranchId(),
                request.getInitialDeposit(),
                request.getAccountName(),
                currentUser.getId()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Account opened successfully / 账户开立成功", AccountDTO.fromEntity(account)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_UPDATE')")
    @Operation(summary = "Update account / 更新账户", description = "Update account details / 更新账户详情")
    public ResponseEntity<ApiResponse<AccountDTO>> updateAccount(
            @PathVariable Long id,
            @RequestBody UpdateAccountRequest request,
            @CurrentUser UserPrincipal currentUser) {
        
        Account account = new Account();
        account.setAccountName(request.getAccountName());
        account.setRemarks(request.getRemarks());
        
        Account updated = accountService.updateAccount(id, account, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Account updated successfully / 账户更新成功", AccountDTO.fromEntity(updated)));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_UPDATE')")
    @Operation(summary = "Update account status / 更新账户状态", description = "Update account status / 更新账户状态")
    public ResponseEntity<ApiResponse<AccountDTO>> updateAccountStatus(
            @PathVariable Long id,
            @RequestParam AccountStatus status,
            @RequestParam(required = false) String reason,
            @CurrentUser UserPrincipal currentUser) {
        Account updated = accountService.updateStatus(id, status, reason, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Account status updated / 账户状态已更新", AccountDTO.fromEntity(updated)));
    }

    @PostMapping("/{id}/freeze")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_UPDATE')")
    @Operation(summary = "Freeze account / 冻结账户", description = "Freeze an account / 冻结账户")
    public ResponseEntity<ApiResponse<AccountDTO>> freezeAccount(
            @PathVariable Long id,
            @RequestParam String reason,
            @CurrentUser UserPrincipal currentUser) {
        Account updated = accountService.freezeAccount(id, reason, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Account frozen / 账户已冻结", AccountDTO.fromEntity(updated)));
    }

    @PostMapping("/{id}/unfreeze")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_UPDATE')")
    @Operation(summary = "Unfreeze account / 解冻账户", description = "Unfreeze an account / 解冻账户")
    public ResponseEntity<ApiResponse<AccountDTO>> unfreezeAccount(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        Account updated = accountService.unfreezeAccount(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Account unfrozen / 账户已解冻", AccountDTO.fromEntity(updated)));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_CLOSE')")
    @Operation(summary = "Close account / 销户", description = "Close an account / 销户")
    public ResponseEntity<ApiResponse<AccountDTO>> closeAccount(
            @PathVariable Long id,
            @RequestParam String reason,
            @CurrentUser UserPrincipal currentUser) {
        Account updated = accountService.closeAccount(id, reason, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Account closed / 账户已关闭", AccountDTO.fromEntity(updated)));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_VIEW')")
    @Operation(summary = "Get account statistics / 获取账户统计", description = "Get account count and balance statistics / 获取账户数量和余额统计")
    public ResponseEntity<ApiResponse<AccountStatsDTO>> getAccountStats() {
        AccountStatsDTO stats = AccountStatsDTO.builder()
                .totalActive(accountService.countByStatus(AccountStatus.ACTIVE))
                .totalDormant(accountService.countByStatus(AccountStatus.DORMANT))
                .totalFrozen(accountService.countByStatus(AccountStatus.FROZEN))
                .totalClosed(accountService.countByStatus(AccountStatus.CLOSED))
                .totalActiveBalance(accountService.sumActiveBalances())
                .build();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/stats/branch/{branchId}")
    @PreAuthorize("hasAuthority('CASA_ACCOUNT_VIEW')")
    @Operation(summary = "Get branch account statistics / 获取分行账户统计", description = "Get account statistics for a specific branch / 获取特定分行的账户统计")
    public ResponseEntity<ApiResponse<BranchAccountStatsDTO>> getBranchAccountStats(@PathVariable Long branchId) {
        BranchAccountStatsDTO stats = BranchAccountStatsDTO.builder()
                .branchId(branchId)
                .totalAccounts(accountService.countByBranchId(branchId))
                .totalBalance(accountService.sumActiveBalancesByBranch(branchId))
                .build();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
