package ma.enset.documentservice.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.documentservice.dto.*;
import ma.enset.documentservice.services.DocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Map;

/**
 * Contrôleur de test pour vérifier la génération de documents
 * À SUPPRIMER ou DÉSACTIVER en production !
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestDocumentController {

    private final DocumentService documentService;

    /**
     * Test simple - ping
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "service", "document-service",
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    /**
     * Test de génération d'une attestation d'inscription avec des données fictives
     */
    @PostMapping("/generate-attestation")
    public ResponseEntity<DocumentResponse> testGenerateAttestation() {
        log.info("🧪 Test de génération d'attestation d'inscription");

        AttestationInscriptionRequest request = AttestationInscriptionRequest.builder()
                .inscriptionId(99999L)
                .doctorantId(1L)
                .nomDoctorant("ALAMI")
                .prenomDoctorant("Ahmed")
                .cin("AB123456")
                .dateNaissance(LocalDate.of(1995, 5, 15))
                .lieuNaissance("Casablanca")
                .sujetThese("Intelligence Artificielle appliquée à la détection de fraudes dans les transactions bancaires")
                .specialite("Informatique - Intelligence Artificielle")
                .laboratoire("LIMATI")
                .structureRecherche("Équipe IA & Big Data")
                .directeurThese("Pr. BENANI Mohamed")
                .coDirecteurThese("Pr. CHRAIBI Fatima")
                .anneeUniversitaire("2024-2025")
                .dateInscription(LocalDate.of(2024, 10, 1))
                .numeroInscription("DOC-2024-001")
                .anneeThese(2)
                .email("ahmed.alami@test.com")
                .build();

        DocumentResponse response = documentService.generateAttestationInscription(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Test de génération d'une autorisation de soutenance avec des données fictives
     */
    @PostMapping("/generate-autorisation")
    public ResponseEntity<DocumentResponse> testGenerateAutorisation() {
        log.info("🧪 Test de génération d'autorisation de soutenance");

        AutorisationSoutenanceRequest request = AutorisationSoutenanceRequest.builder()
                .soutenanceId(99999L)
                .doctorantId(1L)
                .nomDoctorant("ALAMI")
                .prenomDoctorant("Ahmed")
                .cin("AB123456")
                .dateNaissance(LocalDate.of(1995, 5, 15))
                .lieuNaissance("Casablanca")
                .sujetThese("Intelligence Artificielle appliquée à la détection de fraudes dans les transactions bancaires")
                .specialite("Informatique - Intelligence Artificielle")
                .directeurThese("Pr. BENANI Mohamed")
                .coDirecteurThese("Pr. CHRAIBI Fatima")
                .datePremiereInscription(LocalDate.of(2022, 10, 1))
                .laboratoire("LIMATI")
                .dateSoutenance(LocalDateTime.of(2025, 3, 15, 14, 0))
                .lieuSoutenance("ENSET Mohammedia")
                .salleSoutenance("Salle de Conférence")
                .numeroAutorisation("AUT-2025-001")
                .dateAutorisation(LocalDate.now())
                .email("ahmed.alami@test.com")
                .membresJury(Arrays.asList(
                        AutorisationSoutenanceRequest.MembreJuryDto.builder()
                                .nom("TAZI")
                                .prenom("Hassan")
                                .titre("Pr.")
                                .etablissement("ENSEM Casablanca")
                                .role("PRESIDENT")
                                .email("htazi@ensem.ma")
                                .build(),
                        AutorisationSoutenanceRequest.MembreJuryDto.builder()
                                .nom("MOUSSAID")
                                .prenom("Karim")
                                .titre("Pr.")
                                .etablissement("FST Settat")
                                .role("RAPPORTEUR")
                                .email("kmoussaid@fst.ma")
                                .build(),
                        AutorisationSoutenanceRequest.MembreJuryDto.builder()
                                .nom("ELOUARDI")
                                .prenom("Samira")
                                .titre("Pr.")
                                .etablissement("FS Rabat")
                                .role("RAPPORTEUR")
                                .email("selouardi@fs.ma")
                                .build(),
                        AutorisationSoutenanceRequest.MembreJuryDto.builder()
                                .nom("BENANI")
                                .prenom("Mohamed")
                                .titre("Pr.")
                                .etablissement("ENSET Mohammedia")
                                .role("DIRECTEUR")
                                .email("mbenani@enset.ma")
                                .build(),
                        AutorisationSoutenanceRequest.MembreJuryDto.builder()
                                .nom("KABBAJ")
                                .prenom("Youssef")
                                .titre("Dr.")
                                .etablissement("ENSA Marrakech")
                                .role("EXAMINATEUR")
                                .email("ykabbaj@ensa.ma")
                                .build()
                ))
                .build();

        DocumentResponse response = documentService.generateAutorisationSoutenance(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Test de génération d'un procès-verbal de soutenance avec des données fictives
     */
    @PostMapping("/generate-pv")
    public ResponseEntity<DocumentResponse> testGeneratePV() {
        log.info("🧪 Test de génération de procès-verbal de soutenance");

        ProcesVerbalRequest request = ProcesVerbalRequest.builder()
                .soutenanceId(99999L)
                .doctorantId(1L)
                .nomDoctorant("ALAMI")
                .prenomDoctorant("Ahmed")
                .cin("AB123456")
                .dateNaissance(LocalDate.of(1995, 5, 15))
                .lieuNaissance("Casablanca")
                .sujetThese("Intelligence Artificielle appliquée à la détection de fraudes dans les transactions bancaires")
                .specialite("Informatique - Intelligence Artificielle")
                .directeurThese("Pr. BENANI Mohamed")
                .coDirecteurThese("Pr. CHRAIBI Fatima")
                .dateSoutenance(LocalDateTime.of(2025, 3, 15, 14, 0))
                .lieuSoutenance("ENSET Mohammedia")
                .salleSoutenance("Salle de Conférence")
                .mention("TRES_HONORABLE")
                .avecFelicitations(true)
                .observations("Excellent travail de recherche avec des contributions significatives dans le domaine de l'IA.")
                .numeroPv("PV-2025-001")
                .datePv(LocalDate.now())
                .email("ahmed.alami@test.com")
                .membresJury(Arrays.asList(
                        ProcesVerbalRequest.MembreJuryPvDto.builder()
                                .nom("TAZI")
                                .prenom("Hassan")
                                .titre("Pr.")
                                .etablissement("ENSEM Casablanca")
                                .role("PRESIDENT")
                                .present(true)
                                .build(),
                        ProcesVerbalRequest.MembreJuryPvDto.builder()
                                .nom("MOUSSAID")
                                .prenom("Karim")
                                .titre("Pr.")
                                .etablissement("FST Settat")
                                .role("RAPPORTEUR")
                                .present(true)
                                .build(),
                        ProcesVerbalRequest.MembreJuryPvDto.builder()
                                .nom("ELOUARDI")
                                .prenom("Samira")
                                .titre("Pr.")
                                .etablissement("FS Rabat")
                                .role("RAPPORTEUR")
                                .present(true)
                                .build(),
                        ProcesVerbalRequest.MembreJuryPvDto.builder()
                                .nom("BENANI")
                                .prenom("Mohamed")
                                .titre("Pr.")
                                .etablissement("ENSET Mohammedia")
                                .role("DIRECTEUR")
                                .present(true)
                                .build(),
                        ProcesVerbalRequest.MembreJuryPvDto.builder()
                                .nom("KABBAJ")
                                .prenom("Youssef")
                                .titre("Dr.")
                                .etablissement("ENSA Marrakech")
                                .role("EXAMINATEUR")
                                .present(true)
                                .build()
                ))
                .build();

        DocumentResponse response = documentService.generateProcesVerbal(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Liste les types de documents disponibles
     */
    @GetMapping("/document-types")
    public ResponseEntity<Map<String, Object>> getDocumentTypes() {
        return ResponseEntity.ok(Map.of(
                "types", ma.enset.documentservice.enums.DocumentType.values(),
                "endpoints", Map.of(
                        "attestation-inscription", "POST /api/documents/attestation-inscription",
                        "autorisation-soutenance", "POST /api/documents/autorisation-soutenance",
                        "proces-verbal", "POST /api/documents/proces-verbal"
                )
        ));
    }
}
