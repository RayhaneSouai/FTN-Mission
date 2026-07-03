package tn.federation.backend.exceptions;

/**
 * Thrown when an operation is blocked by dependent records
 * (e.g. deleting a program that still has registrations or certificates).
 * Mapped to HTTP 409 Conflict by {@link tn.federation.backend.config.GlobalExceptionHandler}.
 */
public class ResourceConflictException extends RuntimeException {
    public ResourceConflictException(String message) {
        super(message);
    }
}
