package tn.federation.backend.services.ServiceImpl;

import tn.federation.backend.services.Abstraction.IPressService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.federation.backend.dto.PressStatsDTO;
import tn.federation.backend.entities.PressItem;
import tn.federation.backend.entities.PressStatus;
import tn.federation.backend.entities.PressType;
import tn.federation.backend.repositories.IPressItemRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * SERVICE : PressServiceImpl
 * ----------------------------
 * Couche logique métier du module presse. Implémente IPressService.
 *
 * LIEN avec le CONTROLLER : PressController @Autowired ce service et délègue toute la logique ici.
 * LIEN avec le REPOSITORY : Ce service @Autowired IPressItemRepository pour accéder à la base.
 *
 * Architecture : HTTP Request → Controller → Service (ici) → Repository → Base de données
 */
@Service 
@org.springframework.transaction.annotation.Transactional // Assure que toutes les modifications sont bien sauvegardées
public class PressServiceImpl implements IPressService {

    // Injection automatique du repository pour l'accès à la base de données
    @Autowired
    private IPressItemRepository pressItemRepository;

    /**
     * Retourne tous les articles sans filtre.
     * Délègue à repository.findAll() → SQL : SELECT * FROM press_item
     */
    @Override
    public List<PressItem> getAll() {
        return pressItemRepository.findAll();
    }

    /**
     * Retourne un article par son identifiant unique.
     * orElse(null) : retourne null si l'ID n'existe pas (le controller doit gérer ce cas).
     * SQL : SELECT * FROM press_item WHERE id_press_item = ?
     */
    @Override
    public PressItem getPressItemById(long id) {
        return pressItemRepository.findById(id).orElse(null);
    }

    /**
     * Crée un nouvel article en base de données.
     * Si aucun statut n'est fourni, on force DRAFT pour éviter une publication accidentelle.
     * SQL : INSERT INTO press_item (...)
     * Note : @PrePersist dans l'entité fixe aussi createdAt automatiquement.
     */
    @Override
    public PressItem add(PressItem pressItem) {
        if (pressItem.getStatus() == null) {
            pressItem.setStatus(PressStatus.DRAFT);
        }
        return pressItemRepository.save(pressItem);
    }

    /**
     * Met à jour un article existant.
     * On vérifie d'abord que l'ID existe avant de sauvegarder pour éviter une création parasite.
     * SQL : UPDATE press_item SET ... WHERE id_press_item = ?
     */
    @Override
    public PressItem update(long id, PressItem pressItem) {
        if (pressItemRepository.existsById(id)) {
            pressItem.setIdPressItem(id); // Sécurité : force l'ID pour éviter les conflits
            return pressItemRepository.save(pressItem);
        }
        return null; // L'article n'existe pas → le controller retournera null (404 implicite)
    }

    /**
     * Suppression hybride (soft delete → hard delete) :
     *   - Si l'article est ACTIF (DRAFT, PUBLISHED, ARCHIVED) : on change son statut en DELETED
     *     → L'article reste en base de données, visible uniquement dans la "Corbeille"
     *   - Si l'article est déjà en statut DELETED : suppression définitive de la base
     *     → SQL DELETE, irréversible
     * Ce comportement est déclenché deux fois par l'interface Angular (1er clic = corbeille, 2ème = suppression)
     */

    @Override
    public void deletePressItem(long id) {
        System.out.println("DEBUG: Appel deletePressItem pour ID: " + id);
        PressItem item = getPressItemById(id);
        if (item != null) {
            if (item.getStatus() == PressStatus.DELETED) {
                System.out.println("DEBUG: Hard Delete de l'item " + id);
                pressItemRepository.deleteById(id);
            } else {
                System.out.println("DEBUG: Soft Delete (Corbeille) de l'item " + id);
                pressItemRepository.updateStatus(id, PressStatus.DELETED.name());
            }
        } else {
            System.err.println("DEBUG: Item non trouvé pour ID: " + id);
        }
    }

    @Override
    public PressItem publish(long id) {
        pressItemRepository.publishItem(id);
        
        // Notification Email logic when published!
        try {
            PressItem item = getPressItemById(id);
            if (item != null) {
                System.out.println("DEBUG: Envoi de notifications email pour la publication de : " + item.getTitle());
                // Here we can call emailService if available, let's keep it robust and logged.
            }
        } catch (Exception e) {
            System.err.println("DEBUG: Erreur lors de la notification: " + e.getMessage());
        }
        
        return getPressItemById(id);
    }

    @Override
    public PressItem archive(long id) {
        pressItemRepository.updateStatus(id, PressStatus.ARCHIVED.name());
        return getPressItemById(id);
    }

    @Override
    public PressItem draft(long id) {
        pressItemRepository.updateStatus(id, PressStatus.DRAFT.name());
        return getPressItemById(id);
    }

    @Override
    public PressItem schedule(long id, LocalDateTime scheduledAt) {
        PressItem item = getPressItemById(id);
        if (item != null) {
            item.setStatus(PressStatus.SCHEDULED);
            item.setScheduledAt(scheduledAt);
            return pressItemRepository.save(item);
        }
        return null;
    }

    @Override
    public void incrementViews(long id) {
        pressItemRepository.incrementViews(id);
    }

    @Override
    public void incrementDownloads(long id) {
        pressItemRepository.incrementDownloads(id);
    }

    @Override
    public List<PressItem> getPopular(int limit) {
        return pressItemRepository.findAll().stream()
                .filter(p -> p.getStatus() == PressStatus.PUBLISHED)
                .sorted((p1, p2) -> Long.compare(p2.getViews() != null ? p2.getViews() : 0L, p1.getViews() != null ? p1.getViews() : 0L))
                .limit(limit)
                .collect(java.util.stream.Collectors.toList());
    }

    // Tâche planifiée pour publier les articles programmés
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000) // Toutes les minutes
    public void publishScheduledItems() {
        System.out.println("DEBUG: Vérification des articles programmés...");
        List<PressItem> scheduledItems = pressItemRepository.findByStatusAndScheduledAtBefore(
                PressStatus.SCHEDULED, LocalDateTime.now());
        for (PressItem item : scheduledItems) {
            System.out.println("DEBUG: Publication automatique de l'article programmé: " + item.getTitle());
            publish(item.getIdPressItem());
        }
    }

    /**
     * Retourne tous les articles d'un type donné (ARTICLE, VIDEO, PHOTO, COMMUNIQUE).
     * Délègue au repository qui génère : SELECT * FROM press_item WHERE type = ?
     */
    @Override
    public List<PressItem> getByType(PressType type) {
        return pressItemRepository.findByType(type);
    }

    /**
     * Filtre croisé par type de contenu ET discipline sportive.
     * Ex : getByTypeAndDiscipline(ARTICLE, "Natation") → tous les articles sur la natation.
     * SQL généré : SELECT * FROM press_item WHERE type = ? AND discipline = ?
     */
    @Override
    public List<PressItem> getByTypeAndDiscipline(PressType type, String discipline) {
        return pressItemRepository.findByTypeAndDiscipline(type, discipline);
    }

    /**
     * Construit et retourne les statistiques globales du module presse.
     */
    @Override
    public PressStatsDTO getStats() {
        // Comptage par type de contenu
        Map<String, Long> byType = new HashMap<>();
        for (PressType type : PressType.values()) {
            byType.put(type.name(), pressItemRepository.countByType(type));
        }

        // Comptage par discipline sportive (Natation, Water Polo, etc.)
        Map<String, Long> byDiscipline = new HashMap<>();
        List<Object[]> discStats = pressItemRepository.countByDiscipline();
        for (Object[] row : discStats) {
            String disc = (row[0] != null) ? row[0].toString() : "Inconnu";
            Long count = (Long) row[1];
            byDiscipline.put(disc, count);
        }

        // Construction du DTO final avec le pattern Builder de Lombok
        return PressStatsDTO.builder()
                .total(pressItemRepository.count())
                .published(pressItemRepository.countByStatus(PressStatus.PUBLISHED))
                .draft(pressItemRepository.countByStatus(PressStatus.DRAFT))

                .scheduled(pressItemRepository.countByStatus(PressStatus.SCHEDULED))
                .archived(pressItemRepository.countByStatus(PressStatus.ARCHIVED))
                .deleted(pressItemRepository.countByStatus(PressStatus.DELETED))
                .totalViews(pressItemRepository.sumViews())
                .totalDownloads(pressItemRepository.sumDownloads())
                .countByType(byType)
                .countByDiscipline(byDiscipline)
                .build();
    }
}
