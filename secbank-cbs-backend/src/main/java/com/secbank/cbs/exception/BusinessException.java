package com.secbank.cbs.exception;

/**
 * Business Exception / 业务异常
 * Thrown when a business rule is violated.
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String message) {
        super(message);
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
