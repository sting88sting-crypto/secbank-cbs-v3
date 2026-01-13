package com.secbank.cbs.controller;

import com.secbank.cbs.dto.*;
import com.secbank.cbs.security.CurrentUser;
import com.secbank.cbs.security.UserPrincipal;
import com.secbank.cbs.service.BranchService;
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

/**
 * Branch Controller / 分行控制器
 * REST API endpoints for branch management.
 */
@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
@Tag(name = "Branch Management / 分行管理", description = "APIs for managing bank branches / 分行管理相关API")
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    @PreAuthorize("hasAuthority('BRANCH_VIEW')")
    @Operation(summary = "Get all branches / 获取所有分行", description = "Get paginated list of all branches / 分页获取所有分行列表")
    public ResponseEntity<ApiResponse<Page<BranchDTO>>> getAllBranches(
            @PageableDefault(size = 20, sort = "branchCode", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<BranchDTO> branches = branchService.getAllBranches(pageable);
        return ResponseEntity.ok(ApiResponse.success(branches));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAuthority('BRANCH_VIEW')")
    @Operation(summary = "Get active branches / 获取活跃分行", description = "Get list of all active branches / 获取所有活跃分行列表")
    public ResponseEntity<ApiResponse<List<BranchDTO>>> getActiveBranches() {
        List<BranchDTO> branches = branchService.getActiveBranches();
        return ResponseEntity.ok(ApiResponse.success(branches));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('BRANCH_VIEW')")
    @Operation(summary = "Get branch by ID / 根据ID获取分行", description = "Get branch details by ID / 根据ID获取分行详情")
    public ResponseEntity<ApiResponse<BranchDTO>> getBranchById(@PathVariable Long id) {
        BranchDTO branch = branchService.getBranchById(id);
        return ResponseEntity.ok(ApiResponse.success(branch));
    }

    @GetMapping("/code/{branchCode}")
    @PreAuthorize("hasAuthority('BRANCH_VIEW')")
    @Operation(summary = "Get branch by code / 根据代码获取分行", description = "Get branch details by branch code / 根据分行代码获取分行详情")
    public ResponseEntity<ApiResponse<BranchDTO>> getBranchByCode(@PathVariable String branchCode) {
        BranchDTO branch = branchService.getBranchByCode(branchCode);
        return ResponseEntity.ok(ApiResponse.success(branch));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('BRANCH_CREATE')")
    @Operation(summary = "Create branch / 创建分行", description = "Create a new branch / 创建新分行")
    public ResponseEntity<ApiResponse<BranchDTO>> createBranch(
            @Valid @RequestBody CreateBranchRequest request,
            @CurrentUser UserPrincipal currentUser) {
        BranchDTO branch = branchService.createBranch(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Branch created successfully / 分行创建成功", branch));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('BRANCH_UPDATE')")
    @Operation(summary = "Update branch / 更新分行", description = "Update an existing branch / 更新现有分行")
    public ResponseEntity<ApiResponse<BranchDTO>> updateBranch(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBranchRequest request,
            @CurrentUser UserPrincipal currentUser) {
        BranchDTO branch = branchService.updateBranch(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Branch updated successfully / 分行更新成功", branch));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('BRANCH_DELETE')")
    @Operation(summary = "Delete branch / 删除分行", description = "Delete a branch / 删除分行")
    public ResponseEntity<ApiResponse<Void>> deleteBranch(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        branchService.deleteBranch(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Branch deleted successfully / 分行删除成功", null));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('BRANCH_VIEW')")
    @Operation(summary = "Search branches / 搜索分行", description = "Search branches by keyword / 按关键字搜索分行")
    public ResponseEntity<ApiResponse<Page<BranchDTO>>> searchBranches(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "branchCode", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<BranchDTO> branches = branchService.searchBranches(keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(branches));
    }
}
