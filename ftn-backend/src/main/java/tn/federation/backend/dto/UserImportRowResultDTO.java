package tn.federation.backend.dto;

public class UserImportRowResultDTO {
    private int rowNumber;
    private String email;
    private boolean success;
    private String message;

    public UserImportRowResultDTO() {}

    public UserImportRowResultDTO(int rowNumber, String email, boolean success, String message) {
        this.rowNumber = rowNumber;
        this.email = email;
        this.success = success;
        this.message = message;
    }

    public int getRowNumber() {
        return rowNumber;
    }

    public void setRowNumber(int rowNumber) {
        this.rowNumber = rowNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
