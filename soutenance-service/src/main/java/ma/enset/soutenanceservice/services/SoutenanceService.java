package ma.enset.soutenanceservice.services;

import ma.enset.soutenanceservice.entities.MembreJury;
import ma.enset.soutenanceservice.entities.Soutenance;
import ma.enset.soutenanceservice.enums.StatutSoutenance;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface SoutenanceService {

    // Méthode de base
    Soutenance createSoutenance(Soutenance soutenance);

    // ✅ NOUVELLE MÉTHODE pour gérer le formulaire avec fichiers (Appelée par le Controller)
    Soutenance soumettreDemande(String titre, Long doctorantId, Long directeurId,
                                MultipartFile manuscrit, MultipartFile rapportAntiPlagiat, MultipartFile autorisation);

    Soutenance updateSoutenance(Long id, Soutenance soutenance);

    void deleteSoutenance(Long id);

    Optional<Soutenance> getSoutenanceById(Long id);

    List<Soutenance> getAllSoutenances();

    List<Soutenance> getSoutenancesByDoctorant(Long doctorantId);

    List<Soutenance> getSoutenancesByDirecteur(Long directeurId);

    List<Soutenance> getSoutenancesByStatut(StatutSoutenance statut);

    Soutenance verifierPrerequisEtSoumettre(Long id);

    Soutenance ajouterMembreJury(Long soutenanceId, MembreJury membreJury);

    Soutenance proposerJury(Long id);

    Soutenance soumettreRapportRapporteur(Long soutenanceId, Long membreJuryId, Boolean avisFavorable, String commentaire);

    Soutenance autoriserSoutenance(Long id, String commentaire);

    Soutenance planifierSoutenance(Long id, LocalDate date, LocalTime heure, String lieu);

    Soutenance enregistrerResultat(Long id, Double note, String mention, Boolean felicitations);

    Soutenance rejeterSoutenance(Long id, String motif);
}