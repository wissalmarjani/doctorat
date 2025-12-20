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
     * Demander une dérogation
     * POST /api/derogations
     */
    @PostMapping
    public ResponseEntity<Derogation> demanderDerogation(@Valid @RequestBody DemandeDerogationDTO dto) {
        log.info("📝 Nouvelle demande de dérogation - Doctorant: {}, Type: {}", 
                dto.getDoctorantId(), dto.getTypeDerogation());
        
        Derogation derogation = derogationService.demanderDerogation(
                dto.getDoctorantId(),
                dto.getTypeDerogation(),
                dto.getMotif()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(derogation);
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

    // ==================== ENDPOINTS ADMIN/PED ====================

    /**
     * Récupérer toutes les dérogations en attente (pour admin/PED)
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
     * Traiter une dérogation (approuver ou refuser)
     * PUT /api/derogations/decision
     */
    @PutMapping("/decision")
    public ResponseEntity<Derogation> traiterDerogation(@Valid @RequestBody DecisionDerogationDTO dto) {
        log.info("⚖️ Traitement dérogation - ID: {}, Décision: {}", 
                dto.getDerogationId(), dto.getApprouver() ? "APPROUVER" : "REFUSER");
        
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
    }

    /**
     * Approuver une dérogation (raccourci)
     * PUT /api/derogations/{id}/approuver
     */
    @PutMapping("/{id}/approuver")
    public ResponseEntity<Derogation> approuverDerogation(
            @PathVariable Long id,
            @RequestParam Long decideurId,
            @RequestParam(required = false) String commentaire) {
        
        Derogation derogation = derogationService.approuverDerogation(id, decideurId, commentaire);
        return ResponseEntity.ok(derogation);
    }

    /**
     * Refuser une dérogation (raccourci)
     * PUT /api/derogations/{id}/refuser
     */
    @PutMapping("/{id}/refuser")
    public ResponseEntity<Derogation> refuserDerogation(
            @PathVariable Long id,
            @RequestParam Long decideurId,
            @RequestParam String commentaire) {
        
        Derogation derogation = derogationService.refuserDerogation(id, decideurId, commentaire);
        return ResponseEntity.ok(derogation);
    }

    // ==================== ENDPOINT STATISTIQUES ====================

    /**
     * Statistiques des dérogations
     * GET /api/derogations/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("enAttente", derogationService.getDerogationsEnAttente().size());
        stats.put("approuvees", derogationService.getDerogationsByStatut(StatutDerogation.APPROUVEE).size());
        stats.put("refusees", derogationService.getDerogationsByStatut(StatutDerogation.REFUSEE).size());
        
        return ResponseEntity.ok(stats);
    }
}
