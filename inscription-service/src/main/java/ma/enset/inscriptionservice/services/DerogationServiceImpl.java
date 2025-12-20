package ma.enset.inscriptionservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.inscriptionservice.entities.Derogation;
import ma.enset.inscriptionservice.enums.StatutDerogation;
import ma.enset.inscriptionservice.enums.TypeDerogation;
import ma.enset.inscriptionservice.repositories.DerogationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class DerogationServiceImpl implements DerogationService {

    private final DerogationRepository derogationRepository;

    @Override
    public Derogation demanderDerogation(Long doctorantId, TypeDerogation type, String motif) {
        log.info("📝 Demande de dérogation - Doctorant: {}, Type: {}", doctorantId, type);

        // Vérifier si une demande similaire est déjà en attente
        List<Derogation> derogationsEnAttente = derogationRepository
                .findByDoctorantIdOrderByDateDemandeDesc(doctorantId)
                .stream()
                .filter(d -> d.getStatut() == StatutDerogation.EN_ATTENTE)
                .filter(d -> d.getTypeDerogation() == type)
                .toList();

        if (!derogationsEnAttente.isEmpty()) {
            throw new RuntimeException("Une demande de dérogation similaire est déjà en attente pour ce doctorant");
        }

        // Créer la dérogation
        Derogation derogation = Derogation.builder()
                .doctorantId(doctorantId)
                .typeDerogation(type)
                .motif(motif)
                .anneeDemandee(type.getAnneeAutorisee())
                .statut(StatutDerogation.EN_ATTENTE)
                .dateDemande(LocalDateTime.now())
                .build();

        Derogation saved = derogationRepository.save(derogation);
        log.info("✅ Demande de dérogation créée - ID: {}", saved.getId());

        return saved;
    }

    @Override
    public Derogation approuverDerogation(Long derogationId, Long decideurId, String commentaire) {
        log.info("✅ Approbation dérogation - ID: {}, Décideur: {}", derogationId, decideurId);

        Derogation derogation = derogationRepository.findById(derogationId)
                .orElseThrow(() -> new RuntimeException("Dérogation non trouvée: " + derogationId));

        if (derogation.getStatut() != StatutDerogation.EN_ATTENTE) {
            throw new RuntimeException("Cette dérogation a déjà été traitée");
        }

        derogation.setStatut(StatutDerogation.APPROUVEE);
        derogation.setDecideParId(decideurId);
        derogation.setCommentaireDecision(commentaire);
        derogation.setDateDecision(LocalDateTime.now());
        
        // La dérogation est valide pour l'année universitaire en cours + 1 an
        derogation.setDateExpiration(LocalDate.now().plusYears(1).withMonth(9).withDayOfMonth(30));

        Derogation saved = derogationRepository.save(derogation);
        log.info("✅ Dérogation approuvée pour l'année {}", derogation.getAnneeDemandee());

        // TODO: Publier événement Kafka pour notification
        
        return saved;
    }

    @Override
    public Derogation refuserDerogation(Long derogationId, Long decideurId, String commentaire) {
        log.info("❌ Refus dérogation - ID: {}, Décideur: {}", derogationId, decideurId);

        Derogation derogation = derogationRepository.findById(derogationId)
                .orElseThrow(() -> new RuntimeException("Dérogation non trouvée: " + derogationId));

        if (derogation.getStatut() != StatutDerogation.EN_ATTENTE) {
            throw new RuntimeException("Cette dérogation a déjà été traitée");
        }

        derogation.setStatut(StatutDerogation.REFUSEE);
        derogation.setDecideParId(decideurId);
        derogation.setCommentaireDecision(commentaire);
        derogation.setDateDecision(LocalDateTime.now());

        Derogation saved = derogationRepository.save(derogation);
        log.info("❌ Dérogation refusée");

        // TODO: Publier événement Kafka pour notification
        
        return saved;
    }

    @Override
    public Optional<Derogation> getDerogationById(Long id) {
        return derogationRepository.findById(id);
    }

    @Override
    public List<Derogation> getDerogationsByDoctorant(Long doctorantId) {
        return derogationRepository.findByDoctorantIdOrderByDateDemandeDesc(doctorantId);
    }

    @Override
    public List<Derogation> getDerogationsEnAttente() {
        return derogationRepository.findByStatutOrderByDateDemandeAsc(StatutDerogation.EN_ATTENTE);
    }

    @Override
    public boolean hasDerogationValide(Long doctorantId, int annee) {
        return derogationRepository.hasDerogationValide(doctorantId, annee);
    }

    @Override
    public List<Derogation> getDerogationsByStatut(StatutDerogation statut) {
        return derogationRepository.findByStatut(statut);
    }
}
