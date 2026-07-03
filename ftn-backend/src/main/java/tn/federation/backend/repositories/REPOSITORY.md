# Repository query reference — clubs & formation

Documents the keyword/JPQL methods added across the clubs and formation
rebuild, and where each one is actually used in production code (not just
defined). Repositories live flat in this package; this file groups them by
domain for readability.

## ClubRepository

| Method | Used by | Purpose |
|---|---|---|
| `findByActiveTrueOrderByNameAsc` | — | Active clubs, name-sorted |
| `findByDiscipline` | — | Clubs filtered by discipline |
| `findTop5ByOrderByAffiliationDateDesc` | — | Most recently affiliated clubs |
| `findClubsWithAvailableSpots` | — | Clubs where `swimmers.size() < maxCapacity` |
| `findActiveClubsByCoach` | — | Clubs run by an active coach |
| `countSwimmersPerClub` | `ClubServiceImpl` (ranking) | Swimmer count per club, ranked |
| `findClubsRankedBySwimmerCount` | `IClubService.getTopClubsBySwimmers` | Top-clubs ranking page |

## UserRepository

| Method | Used by | Purpose |
|---|---|---|
| `countByClub_Id` | `ClubJoinRequestService.evaluate` | Capacity check during join auto-approval — replaced a lazy `club.getSwimmers().size()` load |

## FormationProgramRepository

| Method | Used by | Purpose |
|---|---|---|
| `findProgramsAlreadyJoinedBySwimmer` | — | Programs a swimmer is already registered in |
| `findEligiblePrograms(niveau)` | `FormationProgramController.getEligiblePrograms` (`GET /api/formation/programs/eligible`) | Rule-based "conditions mention my niveau" badge — a lightweight complement to the AI (Gemini) eligibility check, not a replacement |
| `countRegistrationsPerProgram` | `FormationProgramServiceImpl.applyRegisteredCounts`, feeding `getCoachCertificationPrograms` / `getSwimmerTrainingPrograms` | Populates the transient `registeredCount` field shown as "places restantes" on program cards |
| `findByProgramTypeOrderByCreatedAtDesc` / `findByProgramTypeAndSeason_IdOrderByCreatedAtDesc` | `FormationProgramServiceImpl` | Splits the catalog into coach-certification (BF1/BF2) vs. swimmer-training programs |

## FormationRegistrationRepository

| Method | Used by | Purpose |
|---|---|---|
| `countByProgram_Id` | `FormationProgramServiceImpl.delete` | Blocks program deletion (409) while registrations exist |
| `findByProgram_Season_Id...` / `findByStatusOrderByRegisteredAtDesc` / `findAllByOrderByRegisteredAtDesc` | `FormationUserService.listForAdmin` | Admin "Inscriptions" tab filtering |

## FormationCertificateRepository

| Method | Used by | Purpose |
|---|---|---|
| `countByProgram_Id` | `FormationProgramServiceImpl.delete` | Blocks program deletion (409) while certificates exist |

## TrainingSessionRepository

| Method | Used by | Purpose |
|---|---|---|
| `findByProgram_IdOrderBySessionDateAscStartTimeAsc` | `TrainingSessionService.findByProgram` | Session schedule shown on swimmer program detail page and admin session manager |
| `countByProgram_Id` | (available, not yet consumed) | Reserved for a future "N séances programmées" summary |
