package com.secbank.cbs.service;

import com.secbank.cbs.dto.BranchDTO;
import com.secbank.cbs.dto.CreateBranchRequest;
import com.secbank.cbs.dto.UpdateBranchRequest;
import com.secbank.cbs.entity.Branch;
import com.secbank.cbs.exception.BusinessException;
import com.secbank.cbs.exception.ResourceNotFoundException;
import com.secbank.cbs.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Branch Service / 分行服务
 * Handles all branch-related business logic.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BranchService {

    private final BranchRepository branchRepository;
    private final AuditLogService auditLogService;

    /**
     * Get all branches with pagination.
     * 分页获取所有分行
     */
    @Transactional(readOnly = true)
    public Page<BranchDTO> getAllBranches(Pageable pageable) {
        return branchRepository.findAll(pageable).map(this::toDTO);
    }

    /**
     * Get all active branches.
     * 获取所有活跃分行
     */
    @Transactional(readOnly = true)
    public List<BranchDTO> getActiveBranches() {
        return branchRepository.findByStatus("ACTIVE").stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get branch by ID.
     * 根据ID获取分行
     */
    @Transactional(readOnly = true)
    public BranchDTO getBranchById(Long id) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));
        return toDTO(branch);
    }

    /**
     * Get branch by code.
     * 根据代码获取分行
     */
    @Transactional(readOnly = true)
    public BranchDTO getBranchByCode(String branchCode) {
        Branch branch = branchRepository.findByBranchCode(branchCode)
            .orElseThrow(() -> new ResourceNotFoundException("Branch", "branchCode", branchCode));
        return toDTO(branch);
    }

    /**
     * Create a new branch.
     * 创建新分行
     */
    public BranchDTO createBranch(CreateBranchRequest request, Long currentUserId) {
        // Check if branch code already exists
        if (branchRepository.existsByBranchCode(request.getBranchCode())) {
            throw new BusinessException("Branch code already exists / 分行代码已存在: " + request.getBranchCode());
        }

        Branch branch = Branch.builder()
            .branchCode(request.getBranchCode())
            .branchName(request.getBranchName())
            .branchNameCn(request.getBranchNameCn())
            .address(request.getAddress())
            .city(request.getCity())
            .province(request.getProvince())
            .postalCode(request.getPostalCode())
            .phone(request.getPhone())
            .email(request.getEmail())
            .managerName(request.getManagerName())
            .isHeadOffice(false)
            .status("ACTIVE")
            .createdBy(currentUserId)
            .build();

        branch = branchRepository.save(branch);
        
        // Log audit
        auditLogService.logAction(currentUserId, "CREATE", "ADMINISTRATION", 
            "Branch", branch.getId(), null, branch, "Created branch: " + branch.getBranchCode());

        log.info("Branch created: {} by user {}", branch.getBranchCode(), currentUserId);
        return toDTO(branch);
    }

    /**
     * Update an existing branch.
     * 更新现有分行
     */
    public BranchDTO updateBranch(Long id, UpdateBranchRequest request, Long currentUserId) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));

        Branch oldBranch = Branch.builder()
            .branchName(branch.getBranchName())
            .branchNameCn(branch.getBranchNameCn())
            .address(branch.getAddress())
            .city(branch.getCity())
            .province(branch.getProvince())
            .postalCode(branch.getPostalCode())
            .phone(branch.getPhone())
            .email(branch.getEmail())
            .managerName(branch.getManagerName())
            .status(branch.getStatus())
            .build();

        // Update fields
        if (request.getBranchName() != null) {
            branch.setBranchName(request.getBranchName());
        }
        if (request.getBranchNameCn() != null) {
            branch.setBranchNameCn(request.getBranchNameCn());
        }
        if (request.getAddress() != null) {
            branch.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            branch.setCity(request.getCity());
        }
        if (request.getProvince() != null) {
            branch.setProvince(request.getProvince());
        }
        if (request.getPostalCode() != null) {
            branch.setPostalCode(request.getPostalCode());
        }
        if (request.getPhone() != null) {
            branch.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            branch.setEmail(request.getEmail());
        }
        if (request.getManagerName() != null) {
            branch.setManagerName(request.getManagerName());
        }
        if (request.getStatus() != null) {
            branch.setStatus(request.getStatus());
        }

        branch.setUpdatedBy(currentUserId);
        branch = branchRepository.save(branch);

        // Log audit
        auditLogService.logAction(currentUserId, "UPDATE", "ADMINISTRATION",
            "Branch", branch.getId(), oldBranch, branch, "Updated branch: " + branch.getBranchCode());

        log.info("Branch updated: {} by user {}", branch.getBranchCode(), currentUserId);
        return toDTO(branch);
    }

    /**
     * Delete a branch.
     * 删除分行
     */
    public void deleteBranch(Long id, Long currentUserId) {
        Branch branch = branchRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Branch", "id", id));

        // Cannot delete head office
        if (branch.getIsHeadOffice()) {
            throw new BusinessException("Cannot delete head office / 无法删除总行");
        }

        // Log audit before deletion
        auditLogService.logAction(currentUserId, "DELETE", "ADMINISTRATION",
            "Branch", branch.getId(), branch, null, "Deleted branch: " + branch.getBranchCode());

        branchRepository.delete(branch);
        log.info("Branch deleted: {} by user {}", branch.getBranchCode(), currentUserId);
    }

    /**
     * Search branches by keyword.
     * 按关键字搜索分行
     */
    @Transactional(readOnly = true)
    public Page<BranchDTO> searchBranches(String keyword, Pageable pageable) {
        return branchRepository.searchByKeyword(keyword, pageable).map(this::toDTO);
    }

    /**
     * Convert entity to DTO.
     * 将实体转换为DTO
     */
    private BranchDTO toDTO(Branch branch) {
        return BranchDTO.builder()
            .id(branch.getId())
            .branchCode(branch.getBranchCode())
            .branchName(branch.getBranchName())
            .branchNameCn(branch.getBranchNameCn())
            .address(branch.getAddress())
            .city(branch.getCity())
            .province(branch.getProvince())
            .postalCode(branch.getPostalCode())
            .phone(branch.getPhone())
            .email(branch.getEmail())
            .managerName(branch.getManagerName())
            .isHeadOffice(branch.getIsHeadOffice())
            .status(branch.getStatus())
            .createdAt(branch.getCreatedAt())
            .updatedAt(branch.getUpdatedAt())
            .build();
    }
}
