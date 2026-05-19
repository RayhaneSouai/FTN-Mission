import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class FixDb {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/ftn-db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "root";
        String password = "";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            String sql = "UPDATE press_item SET status='DRAFT' WHERE status='SUBMITTED'";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                int rowsAffected = stmt.executeUpdate();
                System.out.println("Rows fixed: " + rowsAffected);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
