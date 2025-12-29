package ma.enset.inscriptionservice.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.inscriptionservice.dto.DecisionDerogationDTO;
import ma.enset.inscriptionservice.dto.DemandeDerogationDTO;
import ma.enset.inscriptionservice.dto.EligibiliteReinscriptionDTO;
import ma.enset.inscriptionservice.entities.Derogation;
import ma.enset.inscriptionservice.enums.StatutDerogation;
import ma.enset.inscriptionservice.services.DerogationService;
import ma.enset.inscriptionservice.services.DoctoratDureeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/derogations")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DerogationController {

    private final DerogationService derogationService;
    private final DoctoratDureeService doctoratDureeService;

    // ==================== ENDPOINTS DOCTORANT ====================

    /**
     * Vérifier l'éligibilité à la réinscription
     * GET /api/derogations/eligibilite/{doctorantId}
     */
    @GetMapping("/eligibilite/{doctorantId}")
    public ResponseEntity<EligibiliteReinscriptionDTO> verifierEligibilite(@PathVariable Long doctorantId) {
        log.info("📋 Vérification éligibilité réinscription - Doctorant: {}", doctorantId);
        EligibiliteReinscriptionDTO result = doctoratDureeService.verifierEligibiliteReinscription(doctorantId);
        return ResponseEntity.ok(result);
    }

    /**
     * Obtenir l'année de doctorat actuelle
     * GET /api/derogations/annee/{doctorantId}
     */
    @GetMapping("/annee/{doctorantId}")
    public ResponseEntity<Map<String, Object>> getAnneeDoctorat(@PathVariable Long doctorantId) {
        int annee = doctoratDureeService.calculerAnneeDoctorat(doctorantId);
        int restantes = doctoratDureeService.anneesRestantes(doctorantId);
        String alerte = doctoratDureeService.getMessageAlerte(doctorantId);

        Map<String, Object> response = new HashMap<>();
        response.put("doctorantId", doctorantId);
        response.put("anneeActuelle", annee);
        response.put("anneesRestantes", restantes);
        response.put("dureeNormale", DoctoratDureeService.DUREE_NORMALE_ANNEES);
        response.put("dureeMaximale", DoctoratDureeService.DUREE_MAXIMALE_ANNEES);
        response.put("enPeriodeAlerte", doctoratDureeService.estEnPeriodeAlerte(doctorantId));
        response.put("messageAlerte", alerte);

        return ResponseEntity.ok(response);
    }

    /**
     * Demander une dérogation (avec directeurId)
     * POST /api/derogations
     */
    @PostMapping
    public ResponseEntity<?> demanderDerogation(@Valid @RequestBody DemandeDerogationDTO dto) {
        log.info("📝 Nouvelle demande de dérogation - Doctorant: {}, Directeur: {}, Type: {}",
                dto.getDoctorantId(), dto.getDirecteurId(), dto.getTypeDerogation());

        try {
            Derogation derogation = derogationService.demanderDerogation(
                    dto.getDoctorantId(),
                    dto.getDirecteurId(),
                    dto.getTypeDerogation(),
                    dto.getMotif()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(derogation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Récupérer mes dérogations (doctorant)
     * GET /api/derogations/doctorant/{doctorantId}
     */
    @GetMapping("/doctorant/{doctorantId}")
    public ResponseEntity<List<Derogation>> getMesDerogations(@PathVariable Long doctorantId) {
        List<Derogation> derogations = derogationService.getDerogationsByDoctorant(doctorantId);
        return ResponseEntity.ok(derogations);
    }

    // ==================== ENDPOINTS DIRECTEUR ====================

    /**
     * Récupérer les dérogations en attente pour un directeur
     * GET /api/derogations/directeur/{directeurId}
     */
    @GetMapping("/directeur/{directeurId}")
    public ResponseEntity<List<Derogation>> getDerogationsDirecteur(@PathVariable Long directeurId) {
        log.info("📋 Récupération dérogations pour directeur: {}", directeurId);
        List<Derogation> derogations = derogationService.getDerogationsEnAttenteDirecteur(directeurId);
        return ResponseEntity.ok(derogations);
    }

    /**
     * Directeur valide une dérogation
     * PUT /api/derogations/{id}/valider-directeur
     */
    @PutMapping("/{id}/valider-directeur")
    public ResponseEntity<?> validerParDirecteur(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            Long directeurId = Long.valueOf(payload.get("directeurId").toString());
            String commentaire = (String) payload.get("commentaire");

            log.info("✅ Validation directeur - Dérogation: {}, Directeur: {}", id, directeurId);
            Derogation derogation = derogationService.validerParDirecteur(id, directeurId, commentaire);
            return ResponseEntity.ok(derogation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Directeur refuse une dérogation
     * PUT /api/derogations/{id}/refuser-directeur
     */
    @PutMapping("/{id}/refuser-directeur")
    public ResponseEntity<?> refuserParDirecteur(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            Long directeurId = Long.valueOf(payload.get("directeurId").toString());
            String commentaire = (String) payload.get("commentaire");

            if (commentaire == null || commentaire.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le commentaire est obligatoire pour un refus"));
            }

            log.info("❌ Refus directeur - Dérogation: {}, Directeur: {}", id, directeurId);
            Derogation derogation = derogationService.refuserParDirecteur(id, directeurId, commentaire);
            return ResponseEntity.ok(derogation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ENDPOINTS ADMIN ====================

    /**
     * Récupérer toutes les dérogations
     * GET /api/derogations
     */
    @GetMapping
    public ResponseEntity<List<Derogation>> getAllDerogations() {
        List<Derogation> derogations = derogationService.getAllDerogations();
        return ResponseEntity.ok(derogations);
    }

    /**
     * Récupérer les dérogations en attente admin
     * GET /api/derogations/en-attente-admin
     */
    @GetMapping("/en-attente-admin")
    public ResponseEntity<List<Derogation>> getDerogationsEnAttenteAdmin() {
        List<Derogation> derogations = derogationService.getDerogationsEnAttenteAdmin();
        return ResponseEntity.ok(derogations);
    }

    /**
     * Récupérer toutes les dérogations en attente (tous statuts)
     * GET /api/derogations/en-attente
     */
    @GetMapping("/en-attente")
    public ResponseEntity<List<Derogation>> getDerogationsEnAttente() {
        List<Derogation> derogations = derogationService.getDerogationsEnAttente();
        return ResponseEntity.ok(derogations);
    }

    /**
     * Récupérer les dérogations par statut
     * GET /api/derogations/statut/{statut}
     */
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Derogation>> getDerogationsByStatut(@PathVariable StatutDerogation statut) {
        List<Derogation> derogations = derogationService.getDerogationsByStatut(statut);
        return ResponseEntity.ok(derogations);
    }

    /**
     * Récupérer une dérogation par ID
     * GET /api/derogations/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Derogation> getDerogationById(@PathVariable Long id) {
        return derogationService.getDerogationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Admin approuve une dérogation
     * PUT /api/derogations/{id}/approuver
     */
    @PutMapping("/{id}/approuver")
    public ResponseEntity<?> approuverDerogation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            Long decideurId = Long.valueOf(payload.get("decideurId").toString());
            String commentaire = (String) payload.get("commentaire");

            log.info("✅ Approbation admin - Dérogation: {}, Admin: {}", id, decideurId);
            Derogation derogation = derogationService.approuverDerogation(id, decideurId, commentaire);
            return ResponseEntity.ok(derogation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Admin refuse une dérogation
     * PUT /api/derogations/{id}/refuser
     */
    @PutMapping("/{id}/refuser")
    public ResponseEntity<?> refuserDerogation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        try {
            Long decideurId = Long.valueOf(payload.get("decideurId").toString());
            String commentaire = (String) payload.get("commentaire");

            if (commentaire == null || commentaire.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le commentaire est obligatoire pour un refus"));
            }

            log.info("❌ Refus admin - Dérogation: {}, Admin: {}", id, decideurId);
            Derogation derogation = derogationService.refuserDerogation(id, decideurId, commentaire);
            return ResponseEntity.ok(derogation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Traiter une dérogation (legacy - pour compatibilité)
     * PUT /api/derogations/decision
     */
    @PutMapping("/decision")
    public ResponseEntity<?> traiterDerogation(@Valid @RequestBody DecisionDerogationDTO dto) {
        log.info("⚖️ Traitement dérogation - ID: {}, Décision: {}",
                dto.getDerogationId(), dto.getApprouver() ? "APPROUVER" : "REFUSER");

        try {
            Derogation derogation;
            if (dto.getApprouver()) {
                derogation = derogationService.approuverDerogation(
                        dto.getDerogationId(),
                        dto.getDecideurId(),
                        dto.getCommentaire()
                );
            } else {
                derogation = derogationService.refuserDerogation(
                        dto.getDerogationId(),
                        dto.getDecideurId(),
                        dto.getCommentaire()
                );
            }
            return ResponseEntity.ok(derogation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== ENDPOINT STATISTIQUES ====================

    /**
     * Statistiques des dérogations
     * GET /api/derogations/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("enAttenteDirecteur", derogationService.getDerogationsByStatut(StatutDerogation.EN_ATTENTE_DIRECTEUR).size());
        stats.put("enAttenteAdmin", derogationService.getDerogationsByStatut(StatutDerogation.EN_ATTENTE_ADMIN).size());
        stats.put("approuvees", derogationService.getDerogationsByStatut(StatutDerogation.APPROUVEE).size());
        stats.put("refusees", derogationService.getDerogationsByStatut(StatutDerogation.REFUSEE).size());

        return ResponseEntity.ok(stats);
    }
}