package com.secbank.cbs.exception;

/**
 * Resource Not Found Exception / 资源未找到异常
 * Thrown when a requested resource does not exist.
 */
public class ResourceNotFoundException extends RuntimeException {
    
    private final String resourceName;
    private final String fieldName;
    private final Object fieldValue;
    
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s' / 未找到%s，%s: '%s'", 
            resourceName, fieldName, fieldValue, resourceName, fieldName, fieldValue));
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }
    
    public String getResourceName() {
        return resourceName;
    }
    
    public String getFieldName() {
        return fieldName;
    }
    
    public Object getFieldValue() {
        return fieldValue;
    }
}
