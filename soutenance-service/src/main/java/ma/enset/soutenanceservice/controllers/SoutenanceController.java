package ma.enset.soutenanceservice.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.soutenanceservice.entities.MembreJury;
import ma.enset.soutenanceservice.entities.Soutenance;
import ma.enset.soutenanceservice.enums.StatutSoutenance;
import ma.enset.soutenanceservice.services.SoutenanceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/soutenances")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SoutenanceController {

    private final SoutenanceService soutenanceService;

    // ========================================================
    // CRUD DE BASE
    // ========================================================

    @PostMapping
    public ResponseEntity<Soutenance> createSoutenance(@Valid @RequestBody Soutenance soutenance) {
        Soutenance created = soutenanceService.createSoutenance(soutenance);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping(value = "/soumettre", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> soumettreDemande(
            @RequestParam("titre") String titre,
            @RequestParam("doctorantId") Long doctorantId,
            @RequestParam("directeurId") Long directeurId,
            @RequestPart("manuscrit") MultipartFile manuscrit,
            @RequestPart("rapportAntiPlagiat") MultipartFile rapportAntiPlagiat,
            @RequestPart(value = "autorisation", required = false) MultipartFile autorisation) {
        try {
            Soutenance soumise = soutenanceService.soumettreDemande(titre, doctorantId, directeurId, manuscrit, rapportAntiPlagiat, autorisation);
            return ResponseEntity.status(HttpStatus.CREATED).body(soumise);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Soutenance>> getAllSoutenances() {
        return ResponseEntity.ok(soutenanceService.getAllSoutenances());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Soutenance> getSoutenanceById(@PathVariable Long id) {
        return soutenanceService.getSoutenanceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/doctorant/{doctorantId}")
    public ResponseEntity<List<Soutenance>> getSoutenancesByDoctorant(@PathVariable Long doctorantId) {
        return ResponseEntity.ok(soutenanceService.getSoutenancesByDoctorant(doctorantId));
    }

    @GetMapping("/directeur/{directeurId}")
    public ResponseEntity<List<Soutenance>> getSoutenancesByDirecteur(@PathVariable Long directeurId) {
        return ResponseEntity.ok(soutenanceService.getSoutenancesByDirecteur(directeurId));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Soutenance>> getSoutenancesByStatut(@PathVariable StatutSoutenance statut) {
        return ResponseEntity.ok(soutenanceService.getSoutenancesByStatut(statut));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Soutenance> updateSoutenance(@PathVariable Long id, @Valid @RequestBody Soutenance soutenance) {
        try {
            return ResponseEntity.ok(soutenanceService.updateSoutenance(id, soutenance));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSoutenance(@PathVariable Long id) {
        soutenanceService.deleteSoutenance(id);
        return ResponseEntity.noContent().build();
    }

    // ========================================================
    // ÉTAPE 1: DIRECTEUR - Valide les prérequis (SOUMIS → PREREQUIS_VALIDES)
    // ========================================================

    @PutMapping("/{id}/valider-prerequis")
    public ResponseEntity<?> validerPrerequisDirecteur(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String commentaire = (payload != null) ? payload.get("commentaire") : null;
            return ResponseEntity.ok(soutenanceService.validerPrerequisDirecteur(id, commentaire));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/rejeter-directeur")
    public ResponseEntity<?> rejeterParDirecteur(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String commentaire = payload.get("commentaire");
            if (commentaire == null || commentaire.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le commentaire est obligatoire"));
            }
            return ResponseEntity.ok(soutenanceService.rejeterParDirecteur(id, commentaire.trim()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========================================================
    // ÉTAPE 2: DIRECTEUR - Propose le jury (PREREQUIS_VALIDES → JURY_PROPOSE)
    // ========================================================

    @PostMapping("/{id}/jury")
    public ResponseEntity<?> ajouterMembreJury(@PathVariable Long id, @Valid @RequestBody MembreJury membreJury) {
        try {
            return ResponseEntity.ok(soutenanceService.ajouterMembreJury(id, membreJury));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/jury")
    public ResponseEntity<?> getMembresJury(@PathVariable Long id) {
        return soutenanceService.getSoutenanceById(id)
                .map(s -> ResponseEntity.ok(s.getMembresJury()))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{soutenanceId}/jury/{membreId}")
    public ResponseEntity<?> supprimerMembreJury(@PathVariable Long soutenanceId, @PathVariable Long membreId) {
        try {
            return ResponseEntity.ok(soutenanceService.supprimerMembreJury(soutenanceId, membreId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/proposer-jury")
    public ResponseEntity<?> proposerJury(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(soutenanceService.proposerJury(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========================================================
    // ÉTAPE 3: ADMIN - Valide ou refuse le jury (JURY_PROPOSE → AUTORISEE)
    // ========================================================

    @PutMapping("/{id}/valider-jury")
    public ResponseEntity<?> validerJury(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        try {
            String commentaire = (payload != null) ? payload.get("commentaire") : null;
            return ResponseEntity.ok(soutenanceService.validerJury(id, commentaire));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/refuser-jury")
    public ResponseEntity<?> refuserJury(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String commentaire = payload.get("commentaire");
            if (commentaire == null || commentaire.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le motif de refus est obligatoire"));
            }
            return ResponseEntity.ok(soutenanceService.refuserJury(id, commentaire.trim()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========================================================
    // ÉTAPE 4: DIRECTEUR - Propose date de soutenance
    // ========================================================

    @PutMapping("/{id}/proposer-date")
    public ResponseEntity<?> proposerDateSoutenance(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            String dateStr = (String) payload.get("dateSoutenance");
            String heureStr = (String) payload.get("heureSoutenance");
            String lieu = (String) payload.get("lieuSoutenance");

            LocalDate date = LocalDate.parse(dateStr);
            LocalTime heure = (heureStr != null && !heureStr.isEmpty()) ? LocalTime.parse(heureStr) : null;

            return ResponseEntity.ok(soutenanceService.proposerDateSoutenance(id, date, heure, lieu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========================================================
    // ÉTAPE 5: ADMIN - Planifie la soutenance (AUTORISEE → PLANIFIEE)
    // ========================================================

    @PutMapping("/{id}/planifier")
    public ResponseEntity<?> planifierSoutenance(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            String dateStr = (String) payload.get("dateSoutenance");
            String heureStr = (String) payload.get("heureSoutenance");
            String lieu = (String) payload.get("lieuSoutenance");

            LocalDate date = LocalDate.parse(dateStr);
            LocalTime heure = (heureStr != null && !heureStr.isEmpty()) ? LocalTime.parse(heureStr) : LocalTime.of(9, 0);

            return ResponseEntity.ok(soutenanceService.planifierSoutenance(id, date, heure, lieu));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/refuser-planification")
    public ResponseEntity<?> refuserPlanification(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String commentaire = payload.get("commentaire");
            if (commentaire == null || commentaire.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le motif de refus est obligatoire"));
            }
            return ResponseEntity.ok(soutenanceService.refuserPlanification(id, commentaire.trim()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========================================================
    // ÉTAPE 6: RÉSULTAT (PLANIFIEE → TERMINEE)
    // ========================================================

    @PutMapping("/{id}/resultat")
    public ResponseEntity<?> enregistrerResultat(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            Double note = body.get("note") != null ? ((Number) body.get("note")).doubleValue() : null;
            String mention = (String) body.get("mention");
            Boolean felicitations = (Boolean) body.get("felicitations");
            return ResponseEntity.ok(soutenanceService.enregistrerResultat(id, note, mention, felicitations));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========================================================
    // REJET GÉNÉRAL
    // ========================================================

    @PutMapping("/{id}/rejeter")
    public ResponseEntity<?> rejeterSoutenance(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(soutenanceService.rejeterSoutenance(id, body.get("motif")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ========================================================
    // AUTRES
    // ========================================================

    @PutMapping("/{soutenanceId}/jury/{membreJuryId}/rapport")
    public ResponseEntity<?> soumettreRapport(@PathVariable Long soutenanceId, @PathVariable Long membreJuryId, @RequestBody Map<String, Object> body) {
        try {
            Boolean avisFavorable = (Boolean) body.get("avisFavorable");
            String commentaire = (String) body.get("commentaire");
            return ResponseEntity.ok(soutenanceService.soumettreRapportRapporteur(soutenanceId, membreJuryId, avisFavorable, commentaire));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Soutenance Service is running!");
    }
}