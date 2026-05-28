package tn.federation.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class BulkUserImportResponseDTO {
    private int total;
    private int successCount;
    private int failureCount;
    private List<UserImportRowResultDTO> results = new ArrayList<>();

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }

    public List<UserImportRowResultDTO> getResults() {
        return results;
    }

    public void setResults(List<UserImportRowResultDTO> results) {
        this.results = results;
    }
}
