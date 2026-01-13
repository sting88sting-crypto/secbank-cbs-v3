package com.secbank.cbs.dto;

import lombok.*;

/**
 * Permission DTO / 权限数据传输对象
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermissionDTO {
    private Long id;
    private String permissionCode;
    private String permissionName;
    private String permissionNameCn;
    private String module;
    private String description;
    private String descriptionCn;
}
