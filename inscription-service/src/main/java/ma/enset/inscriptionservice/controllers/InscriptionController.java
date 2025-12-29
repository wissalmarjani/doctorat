package ma.enset.inscriptionservice.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.inscriptionservice.entities.Inscription;
import ma.enset.inscriptionservice.enums.StatutInscription;
import ma.enset.inscriptionservice.enums.TypeInscription;
import ma.enset.inscriptionservice.services.InscriptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inscriptions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InscriptionController {

    private final InscriptionService inscriptionService;

    // =============================================================
    // CRUD
    // =============================================================

    @PostMapping
    public ResponseEntity<Inscription> create(@Valid @RequestBody Inscription inscription) {
        log.info("REST request to create inscription");
        return ResponseEntity.status(HttpStatus.CREATED).body(inscriptionService.create(inscription));
    }

    @GetMapping
    public ResponseEntity<List<Inscription>> getAll() {
        return ResponseEntity.ok(inscriptionService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inscription> getById(@PathVariable Long id) {
        return inscriptionService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inscription> update(@PathVariable Long id, @RequestBody Inscription inscription) {
        try {
            return ResponseEntity.ok(inscriptionService.update(id, inscription));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inscriptionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // =============================================================
    // REQUÊTES SPÉCIFIQUES
    // =============================================================

    @GetMapping("/doctorant/{doctorantId}")
    public ResponseEntity<List<Inscription>> getByDoctorant(@PathVariable Long doctorantId) {
        return ResponseEntity.ok(inscriptionService.getByDoctorant(doctorantId));
    }

    @GetMapping("/directeur/{directeurId}")
    public ResponseEntity<List<Inscription>> getByDirecteur(@PathVariable Long directeurId) {
        return ResponseEntity.ok(inscriptionService.getByDirecteur(directeurId));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Inscription>> getByStatut(@PathVariable String statut) {
        try {
            StatutInscription statutEnum = StatutInscription.valueOf(statut);
            return ResponseEntity.ok(inscriptionService.getByStatut(statutEnum));
        } catch (IllegalArgumentException e) {
            log.error("Statut invalide: {}", statut);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/campagne/{campagneId}")
    public ResponseEntity<List<Inscription>> getByCampagne(@PathVariable Long campagneId) {
        return ResponseEntity.ok(inscriptionService.getByCampagne(campagneId));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Inscription>> getByType(@PathVariable String type) {
        try {
            TypeInscription typeEnum = TypeInscription.valueOf(type);
            return ResponseEntity.ok(inscriptionService.getByTypeInscription(typeEnum));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // =============================================================
    // WORKFLOW - SOUMISSION
    // =============================================================

    @PutMapping("/{id}/soumettre")
    public ResponseEntity<Inscription> soumettre(@PathVariable Long id) {
        log.info("📤 Soumission inscription {}", id);
        try {
            return ResponseEntity.ok(inscriptionService.soumettre(id));
        } catch (RuntimeException e) {
            log.error("❌ Erreur soumission: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // =============================================================
    // WORKFLOW - VALIDATION DIRECTEUR
    // =============================================================

    @PutMapping("/{id}/valider-directeur")
    public ResponseEntity<Inscription> validerParDirecteur(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaire) {
        log.info("✅ Validation directeur inscription {}", id);
        try {
            return ResponseEntity.ok(inscriptionService.validerParDirecteur(id, commentaire));
        } catch (RuntimeException e) {
            log.error("❌ Erreur validation directeur: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/rejeter-directeur")
    public ResponseEntity<Inscription> rejeterParDirecteur(
            @PathVariable Long id,
            @RequestParam String motif) {
        log.info("❌ Rejet directeur inscription {}", id);
        try {
            return ResponseEntity.ok(inscriptionService.rejeterParDirecteur(id, motif));
        } catch (RuntimeException e) {
            log.error("❌ Erreur rejet directeur: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // =============================================================
    // WORKFLOW - VALIDATION ADMIN
    // =============================================================

    @PutMapping("/{id}/valider-admin")
    public ResponseEntity<Inscription> validerParAdmin(
            @PathVariable Long id,
            @RequestParam(required = false) String commentaire) {
        log.info("✅ Validation admin inscription {}", id);
        try {
            return ResponseEntity.ok(inscriptionService.validerParAdmin(id, commentaire));
        } catch (RuntimeException e) {
            log.error("❌ Erreur validation admin: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/rejeter-admin")
    public ResponseEntity<Inscription> rejeterParAdmin(
            @PathVariable Long id,
            @RequestParam String motif) {
        log.info("❌ Rejet admin inscription {}", id);
        try {
            return ResponseEntity.ok(inscriptionService.rejeterParAdmin(id, motif));
        } catch (RuntimeException e) {
            log.error("❌ Erreur rejet admin: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // =============================================================
    // ENDPOINTS SPÉCIAUX POUR DIRECTEUR ET ADMIN
    // =============================================================

    /**
     * Réinscriptions en attente de validation par un directeur spécifique
     */
    @GetMapping("/directeur/{directeurId}/reinscriptions-en-attente")
    public ResponseEntity<List<Inscription>> getReinscritionsEnAttenteDirecteur(@PathVariable Long directeurId) {
        log.info("📋 Récupération réinscriptions en attente pour directeur {}", directeurId);
        return ResponseEntity.ok(inscriptionService.getReinscritionsEnAttenteDirecteur(directeurId));
    }

    /**
     * Réinscriptions en attente de validation admin (après validation directeur)
     */
    @GetMapping("/admin/reinscriptions-en-attente")
    public ResponseEntity<List<Inscription>> getReinscritionsEnAttenteAdmin() {
        log.info("📋 Récupération réinscriptions en attente pour admin");
        return ResponseEntity.ok(inscriptionService.getReinscritionsEnAttenteAdmin());
    }

    /**
     * Premières inscriptions en attente de validation admin
     */
    @GetMapping("/admin/premieres-inscriptions-en-attente")
    public ResponseEntity<List<Inscription>> getPremieresInscriptionsEnAttenteAdmin() {
        log.info("📋 Récupération premières inscriptions en attente pour admin");
        return ResponseEntity.ok(inscriptionService.getPremieresInscriptionsEnAttenteAdmin());
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Inscription Service is running!");
    }
}