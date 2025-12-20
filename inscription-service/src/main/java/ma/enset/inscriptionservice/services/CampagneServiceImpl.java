package ma.enset.inscriptionservice.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.inscriptionservice.entities.Campagne;
import ma.enset.inscriptionservice.repositories.CampagneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class CampagneServiceImpl implements CampagneService {

    private final CampagneRepository campagneRepository;

    @Override
    public Campagne createCampagne(Campagne campagne) {
        log.info("Creating campagne: {}", campagne.getTitre());

        // Désactiver toutes les autres campagnes si celle-ci est active
        if (campagne.getActive()) {
            desactiverToutesCampagnes();
        }

        return campagneRepository.save(campagne);
    }

    @Override
    public Campagne updateCampagne(Long id, Campagne campagne) {
        log.info("Updating campagne with id: {}", id);

        return campagneRepository.findById(id)
                .map(existingCampagne -> {
                    existingCampagne.setTitre(campagne.getTitre());
                    existingCampagne.setAnneeUniversitaire(campagne.getAnneeUniversitaire());
                    existingCampagne.setDateOuverture(campagne.getDateOuverture());
                    existingCampagne.setDateFermeture(campagne.getDateFermeture());
                    existingCampagne.setActive(campagne.getActive());

                    if (campagne.getActive()) {
                        desactiverToutesCampagnes();
                    }

                    return campagneRepository.save(existingCampagne);
                })
                .orElseThrow(() -> new RuntimeException("Campagne non trouvée avec l'id: " + id));
    }

    @Override
    public void deleteCampagne(Long id) {
        log.info("Deleting campagne with id: {}", id);
        campagneRepository.deleteById(id);
    }

    @Override
    public Optional<Campagne> getCampagneById(Long id) {
        return campagneRepository.findById(id);
    }

    @Override
    public Optional<Campagne> getCampagneActive() {
        return campagneRepository.findByActiveTrue();
    }

    @Override
    public List<Campagne> getAllCampagnes() {
        return campagneRepository.findAll();
    }

    @Override
    public Campagne activerCampagne(Long id) {
        log.info("Activating campagne with id: {}", id);

        desactiverToutesCampagnes();

        return campagneRepository.findById(id)
                .map(campagne -> {
                    campagne.setActive(true);
                    return campagneRepository.save(campagne);
                })
                .orElseThrow(() -> new RuntimeException("Campagne non trouvée avec l'id: " + id));
    }

    private void desactiverToutesCampagnes() {
        List<Campagne> campagnes = campagneRepository.findAll();
        campagnes.forEach(c -> c.setActive(false));
        campagneRepository.saveAll(campagnes);
    }
}