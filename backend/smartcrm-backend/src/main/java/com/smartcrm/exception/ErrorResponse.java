package com.smartcrm.exception;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ErrorResponse {

    private String message;
    private int status;
    private LocalDateTime timestamp;
    private Map<String, List<String>> errors;

    public ErrorResponse(String message, int status, LocalDateTime timestamp, Map<String, List<String>> errors) {
        this.message = message;
        this.status = status;
        this.timestamp = timestamp;
        this.errors = errors;
    }

    // Getters
    public String getMessage() {
        return message;
    }

    public int getStatus() {
        return status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Map<String, List<String>> getErrors() {
        return errors;
    }
}