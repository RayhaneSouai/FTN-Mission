package tn.federation.backend.services.Abstraction;

import tn.federation.backend.dto.AthleteProgressDTO;
import tn.federation.backend.dto.RegisterRequestDTO;
import tn.federation.backend.dto.SwimmerDashboardDTO;
import tn.federation.backend.dto.UserDTO;
import java.util.List;

public interface IUserService {
    List<UserDTO> findAllUsers();
    List<UserDTO> findSwimmers();
    UserDTO findById(Long id);
    UserDTO findByEmail(String email);
    UserDTO createUser(RegisterRequestDTO request);
    UserDTO updateUser(Long id, UserDTO dto);
    void deleteUser(Long id);
    UserDTO approveUser(Long id);
    UserDTO rejectUser(Long id);
    AthleteProgressDTO getAthleteProgress(Long swimmerId);
    SwimmerDashboardDTO getSwimmerDashboardStats(Long swimmerId);
    tn.federation.backend.dto.AdminDashboardDTO getAdminDashboardStats();
}
