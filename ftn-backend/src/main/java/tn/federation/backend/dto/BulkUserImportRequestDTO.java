package tn.federation.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class BulkUserImportRequestDTO {

    @NotEmpty
    @Size(max = 500)
    @Valid
    private List<AdminUserCreateRequestDTO> users = new ArrayList<>();

    public List<AdminUserCreateRequestDTO> getUsers() {
        return users;
    }

    public void setUsers(List<AdminUserCreateRequestDTO> users) {
        this.users = users;
    }
}
