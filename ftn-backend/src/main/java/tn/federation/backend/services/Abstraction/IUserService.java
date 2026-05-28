package tn.federation.backend.services.Abstraction;

import tn.federation.backend.dto.AthleteProgressDTO;
import tn.federation.backend.dto.AdminUserCreateRequestDTO;
import tn.federation.backend.dto.AdminUserCreateResponseDTO;
import tn.federation.backend.dto.BulkUserImportResponseDTO;
import tn.federation.backend.dto.RegisterRequestDTO;
import tn.federation.backend.dto.SwimmerDashboardDTO;
import tn.federation.backend.dto.UserDTO;
import java.util.List;

public interface IUserService {
    List<UserDTO> findAllUsers();
    List<UserDTO> findSwimmers();
    UserDTO findById(Long id);
    UserDTO findByEmail(String email);
    AdminUserCreateResponseDTO createUser(AdminUserCreateRequestDTO request);
    BulkUserImportResponseDTO importUsers(List<AdminUserCreateRequestDTO> users);
    UserDTO updateUser(Long id, UserDTO dto);
    void deleteUser(Long id);
    UserDTO approveUser(Long id);
    UserDTO rejectUser(Long id);
    AthleteProgressDTO getAthleteProgress(Long swimmerId);
    void changePassword(String currentEmail, String oldPassword, String newPassword);
    SwimmerDashboardDTO getSwimmerDashboardStats(Long swimmerId);
    tn.federation.backend.dto.AdminDashboardDTO getAdminDashboardStats();
}
