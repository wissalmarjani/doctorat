package ma.enset.soutenanceservice.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Prerequis {

    @Column(name = "nombre_articles_q1_q2")
    private Integer nombreArticlesQ1Q2 = 0;

    @Column(name = "nombre_conferences")
    private Integer nombreConferences = 0;

    @Column(name = "heures_formation")
    private Integer heuresFormation = 0;

    @Column(name = "prerequis_valides")
    private Boolean prerequisValides = false;

    // Méthode de validation
    public boolean verifierPrerequisMinimaux() {
        return nombreArticlesQ1Q2 >= 2
                && nombreConferences >= 2
                && heuresFormation >= 200;
    }
}