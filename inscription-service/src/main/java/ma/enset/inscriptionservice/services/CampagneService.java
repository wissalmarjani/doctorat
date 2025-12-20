package ma.enset.inscriptionservice.services;

import ma.enset.inscriptionservice.entities.Campagne;

import java.util.List;
import java.util.Optional;

public interface CampagneService {

    Campagne createCampagne(Campagne campagne);

    Campagne updateCampagne(Long id, Campagne campagne);

    void deleteCampagne(Long id);

    Optional<Campagne> getCampagneById(Long id);

    Optional<Campagne> getCampagneActive();

    List<Campagne> getAllCampagnes();

    Campagne activerCampagne(Long id);
}