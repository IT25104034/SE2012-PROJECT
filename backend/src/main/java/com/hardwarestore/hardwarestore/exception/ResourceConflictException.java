package com.hardwarestore.hardwarestore.exception;

public class ResourceConflictException extends RuntimeException {
    public ResourceConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
