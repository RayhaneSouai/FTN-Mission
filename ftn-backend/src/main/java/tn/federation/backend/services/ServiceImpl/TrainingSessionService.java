package tn.federation.backend.services.ServiceImpl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.federation.backend.entities.FormationProgram;
import tn.federation.backend.entities.TrainingSession;
import tn.federation.backend.repositories.FormationProgramRepository;
import tn.federation.backend.repositories.TrainingSessionRepository;

import java.util.List;

@Service
public class TrainingSessionService {

    private final TrainingSessionRepository sessionRepository;
    private final FormationProgramRepository programRepository;

    public TrainingSessionService(
            TrainingSessionRepository sessionRepository,
            FormationProgramRepository programRepository) {
        this.sessionRepository = sessionRepository;
        this.programRepository = programRepository;
    }

    public List<TrainingSession> findByProgram(Long programId) {
        return sessionRepository.findByProgram_IdOrderBySessionDateAscStartTimeAsc(programId);
    }

    @Transactional
    public TrainingSession create(Long programId, TrainingSession session) {
        FormationProgram program = requireProgram(programId);
        validate(session);
        session.setId(null);
        session.setProgram(program);
        return sessionRepository.save(session);
    }

    @Transactional
    public TrainingSession update(Long programId, Long sessionId, TrainingSession session) {
        requireProgram(programId);
        TrainingSession existing = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Séance introuvable"));
        if (!existing.getProgram().getId().equals(programId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette séance n'appartient pas à ce programme");
        }
        validate(session);
        existing.setSessionDate(session.getSessionDate());
        existing.setStartTime(session.getStartTime());
        existing.setEndTime(session.getEndTime());
        existing.setLocation(session.getLocation());
        existing.setNotes(session.getNotes());
        if (session.getStatus() != null) {
            existing.setStatus(session.getStatus());
        }
        return sessionRepository.save(existing);
    }

    @Transactional
    public void delete(Long programId, Long sessionId) {
        TrainingSession existing = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Séance introuvable"));
        if (!existing.getProgram().getId().equals(programId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette séance n'appartient pas à ce programme");
        }
        sessionRepository.deleteById(sessionId);
    }

    private FormationProgram requireProgram(Long programId) {
        return programRepository.findById(programId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Programme introuvable"));
    }

    private void validate(TrainingSession session) {
        if (session.getSessionDate() == null) {
            throw new IllegalArgumentException("La date de la séance est obligatoire");
        }
        if (session.getStartTime() == null || session.getEndTime() == null) {
            throw new IllegalArgumentException("Les horaires de début et de fin sont obligatoires");
        }
        if (!session.getEndTime().isAfter(session.getStartTime())) {
            throw new IllegalArgumentException("L'heure de fin doit être après l'heure de début");
        }
    }
}
