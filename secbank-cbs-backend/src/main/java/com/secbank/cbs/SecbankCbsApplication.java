package com.secbank.cbs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * SecBank CBS Application / SecBank核心银行系统应用
 * Main entry point for the Spring Boot application.
 */
@SpringBootApplication
@EnableAsync
public class SecbankCbsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecbankCbsApplication.class, args);
    }
}
