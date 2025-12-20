package ma.enset.documentservice.services;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.enset.documentservice.dto.AttestationInscriptionRequest;
import ma.enset.documentservice.dto.AutorisationSoutenanceRequest;
import ma.enset.documentservice.dto.ProcesVerbalRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfGeneratorService {

    @Value("${app.documents.storage-path:/tmp/documents}")
    private String storagePath;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.FRENCH);
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy 'à' HH'h'mm", Locale.FRENCH);

    // Couleurs
    private static final Color PRIMARY_COLOR = new Color(30, 58, 95); // Bleu foncé
    private static final Color SECONDARY_COLOR = new Color(45, 90, 135);
    private static final Color ACCENT_COLOR = new Color(0, 123, 255);

    // Polices
    private Font getTitleFont() {
        Font font = new Font(Font.HELVETICA, 18, Font.BOLD);
        font.setColor(PRIMARY_COLOR);
        return font;
    }

    private Font getSubtitleFont() {
        Font font = new Font(Font.HELVETICA, 14, Font.BOLD);
        font.setColor(SECONDARY_COLOR);
        return font;
    }

    private Font getNormalFont() {
        return new Font(Font.HELVETICA, 11, Font.NORMAL, Color.BLACK);
    }

    private Font getBoldFont() {
        return new Font(Font.HELVETICA, 11, Font.BOLD, Color.BLACK);
    }

    private Font getSmallFont() {
        return new Font(Font.HELVETICA, 9, Font.NORMAL, Color.GRAY);
    }

    /**
     * Génère une attestation d'inscription en PDF
     */
    public byte[] generateAttestationInscription(AttestationInscriptionRequest request) throws DocumentException, IOException {
        log.info("Génération attestation d'inscription pour: {} {}", request.getPrenomDoctorant(), request.getNomDoctorant());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        document.open();

        // En-tête
        addHeader(document, "ATTESTATION D'INSCRIPTION");

        // Numéro et date
        Paragraph refParagraph = new Paragraph();
        refParagraph.setAlignment(Element.ALIGN_RIGHT);
        refParagraph.add(new Chunk("N° : " + (request.getNumeroInscription() != null ? request.getNumeroInscription() : "ATT-" + System.currentTimeMillis()), getSmallFont()));
        refParagraph.add(Chunk.NEWLINE);
        refParagraph.add(new Chunk("Date : " + LocalDate.now().format(DATE_FORMATTER), getSmallFont()));
        document.add(refParagraph);

        document.add(new Paragraph("\n"));

        // Corps de l'attestation
        Paragraph body = new Paragraph();
        body.setAlignment(Element.ALIGN_JUSTIFIED);
        body.setLeading(20f);

        body.add(new Chunk("Le Directeur de l'École Nationale Supérieure d'Enseignement Technique (ENSET) de Mohammedia atteste que :\n\n", getNormalFont()));

        // Informations du doctorant
        body.add(new Chunk("M./Mme ", getNormalFont()));
        body.add(new Chunk(request.getPrenomDoctorant().toUpperCase() + " " + request.getNomDoctorant().toUpperCase(), getBoldFont()));

        if (request.getCin() != null) {
            body.add(new Chunk("\nCIN : ", getNormalFont()));
            body.add(new Chunk(request.getCin(), getBoldFont()));
        }

        if (request.getDateNaissance() != null && request.getLieuNaissance() != null) {
            body.add(new Chunk("\nNé(e) le ", getNormalFont()));
            body.add(new Chunk(request.getDateNaissance().format(DATE_FORMATTER), getBoldFont()));
            body.add(new Chunk(" à ", getNormalFont()));
            body.add(new Chunk(request.getLieuNaissance(), getBoldFont()));
        }

        body.add(new Chunk("\n\nest régulièrement inscrit(e) au cycle doctoral au titre de l'année universitaire ", getNormalFont()));
        body.add(new Chunk(request.getAnneeUniversitaire(), getBoldFont()));
        body.add(new Chunk(" en ", getNormalFont()));
        body.add(new Chunk(request.getAnneeThese() + (request.getAnneeThese() == 1 ? "ère" : "ème") + " année de thèse", getBoldFont()));
        body.add(new Chunk(".\n\n", getNormalFont()));

        // Sujet de thèse
        body.add(new Chunk("Sujet de thèse : ", getNormalFont()));
        body.add(new Chunk("« " + request.getSujetThese() + " »", getBoldFont()));
        body.add(new Chunk("\n\n", getNormalFont()));

        // Directeur de thèse
        body.add(new Chunk("Sous la direction de : ", getNormalFont()));
        body.add(new Chunk(request.getDirecteurThese(), getBoldFont()));
        if (request.getCoDirecteurThese() != null && !request.getCoDirecteurThese().isEmpty()) {
            body.add(new Chunk("\nCo-direction : ", getNormalFont()));
            body.add(new Chunk(request.getCoDirecteurThese(), getBoldFont()));
        }

        if (request.getSpecialite() != null) {
            body.add(new Chunk("\n\nSpécialité : ", getNormalFont()));
            body.add(new Chunk(request.getSpecialite(), getBoldFont()));
        }

        if (request.getLaboratoire() != null) {
            body.add(new Chunk("\nLaboratoire : ", getNormalFont()));
            body.add(new Chunk(request.getLaboratoire(), getBoldFont()));
        }

        body.add(new Chunk("\n\nCette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.", getNormalFont()));

        document.add(body);

        // Signature
        addSignatureBlock(document, "Mohammedia");

        document.close();

        log.info("Attestation d'inscription générée avec succès");
        return baos.toByteArray();
    }

    /**
     * Génère une autorisation de soutenance en PDF
     */
    public byte[] generateAutorisationSoutenance(AutorisationSoutenanceRequest request) throws DocumentException, IOException {
        log.info("Génération autorisation de soutenance pour: {} {}", request.getPrenomDoctorant(), request.getNomDoctorant());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        document.open();

        // En-tête
        addHeader(document, "AUTORISATION DE SOUTENANCE DE THÈSE");

        // Numéro et date
        Paragraph refParagraph = new Paragraph();
        refParagraph.setAlignment(Element.ALIGN_RIGHT);
        refParagraph.add(new Chunk("N° : " + (request.getNumeroAutorisation() != null ? request.getNumeroAutorisation() : "AUT-" + System.currentTimeMillis()), getSmallFont()));
        refParagraph.add(Chunk.NEWLINE);
        refParagraph.add(new Chunk("Date : " + (request.getDateAutorisation() != null ? request.getDateAutorisation().format(DATE_FORMATTER) : LocalDate.now().format(DATE_FORMATTER)), getSmallFont()));
        document.add(refParagraph);

        document.add(new Paragraph("\n"));

        // Corps
        Paragraph body = new Paragraph();
        body.setAlignment(Element.ALIGN_JUSTIFIED);
        body.setLeading(18f);

        body.add(new Chunk("Le Chef de l'Établissement autorise :\n\n", getNormalFont()));

        body.add(new Chunk("M./Mme ", getNormalFont()));
        body.add(new Chunk(request.getPrenomDoctorant().toUpperCase() + " " + request.getNomDoctorant().toUpperCase(), getBoldFont()));

        if (request.getCin() != null) {
            body.add(new Chunk("\nCIN : ", getNormalFont()));
            body.add(new Chunk(request.getCin(), getBoldFont()));
        }

        body.add(new Chunk("\n\nà soutenir sa thèse de doctorat intitulée :\n", getNormalFont()));
        body.add(new Chunk("« " + request.getSujetThese() + " »\n\n", getBoldFont()));

        body.add(new Chunk("Préparée sous la direction de : ", getNormalFont()));
        body.add(new Chunk(request.getDirecteurThese(), getBoldFont()));

        if (request.getCoDirecteurThese() != null && !request.getCoDirecteurThese().isEmpty()) {
            body.add(new Chunk("\nCo-direction : ", getNormalFont()));
            body.add(new Chunk(request.getCoDirecteurThese(), getBoldFont()));
        }

        document.add(body);
        document.add(new Paragraph("\n"));

        // Date et lieu de soutenance
        if (request.getDateSoutenance() != null) {
            Paragraph soutenanceInfo = new Paragraph();
            soutenanceInfo.add(new Chunk("La soutenance aura lieu le ", getNormalFont()));
            soutenanceInfo.add(new Chunk(request.getDateSoutenance().format(DATETIME_FORMATTER), getBoldFont()));
            if (request.getLieuSoutenance() != null) {
                soutenanceInfo.add(new Chunk(" à ", getNormalFont()));
                soutenanceInfo.add(new Chunk(request.getLieuSoutenance(), getBoldFont()));
            }
            if (request.getSalleSoutenance() != null) {
                soutenanceInfo.add(new Chunk(", " + request.getSalleSoutenance(), getBoldFont()));
            }
            soutenanceInfo.add(new Chunk(".\n", getNormalFont()));
            document.add(soutenanceInfo);
        }

        document.add(new Paragraph("\n"));

        // Tableau du jury
        if (request.getMembresJury() != null && !request.getMembresJury().isEmpty()) {
            Paragraph juryTitle = new Paragraph("Composition du Jury :", getSubtitleFont());
            juryTitle.setSpacingAfter(10f);
            document.add(juryTitle);

            PdfPTable juryTable = new PdfPTable(4);
            juryTable.setWidthPercentage(100);
            juryTable.setWidths(new float[]{2.5f, 3f, 2f, 2f});

            // En-têtes du tableau
            addTableHeader(juryTable, "Nom et Prénom");
            addTableHeader(juryTable, "Établissement");
            addTableHeader(juryTable, "Qualité");
            addTableHeader(juryTable, "Rôle");

            for (AutorisationSoutenanceRequest.MembreJuryDto membre : request.getMembresJury()) {
                addTableCell(juryTable, (membre.getTitre() != null ? membre.getTitre() + " " : "") + membre.getPrenom() + " " + membre.getNom());
                addTableCell(juryTable, membre.getEtablissement() != null ? membre.getEtablissement() : "-");
                addTableCell(juryTable, membre.getTitre() != null ? membre.getTitre() : "-");
                addTableCell(juryTable, formatRole(membre.getRole()));
            }

            document.add(juryTable);
        }

        // Signature
        addSignatureBlock(document, "Mohammedia");

        document.close();

        log.info("Autorisation de soutenance générée avec succès");
        return baos.toByteArray();
    }

    /**
     * Génère un procès-verbal de soutenance en PDF
     */
    public byte[] generateProcesVerbal(ProcesVerbalRequest request) throws DocumentException, IOException {
        log.info("Génération PV de soutenance pour: {} {}", request.getPrenomDoctorant(), request.getNomDoctorant());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        PdfWriter writer = PdfWriter.getInstance(document, baos);

        document.open();

        // En-tête
        addHeader(document, "PROCÈS-VERBAL DE SOUTENANCE DE THÈSE");

        // Numéro et date
        Paragraph refParagraph = new Paragraph();
        refParagraph.setAlignment(Element.ALIGN_RIGHT);
        refParagraph.add(new Chunk("N° : " + (request.getNumeroPv() != null ? request.getNumeroPv() : "PV-" + System.currentTimeMillis()), getSmallFont()));
        document.add(refParagraph);

        document.add(new Paragraph("\n"));

        // Date et lieu
        Paragraph intro = new Paragraph();
        intro.setAlignment(Element.ALIGN_JUSTIFIED);
        intro.setLeading(18f);

        intro.add(new Chunk("Le ", getNormalFont()));
        intro.add(new Chunk(request.getDateSoutenance().format(DATETIME_FORMATTER), getBoldFont()));
        intro.add(new Chunk(", s'est réuni à ", getNormalFont()));
        intro.add(new Chunk(request.getLieuSoutenance(), getBoldFont()));
        if (request.getSalleSoutenance() != null) {
            intro.add(new Chunk(" (" + request.getSalleSoutenance() + ")", getNormalFont()));
        }
        intro.add(new Chunk(", le jury de soutenance de thèse de doctorat de :\n\n", getNormalFont()));

        // Candidat
        intro.add(new Chunk("M./Mme ", getNormalFont()));
        intro.add(new Chunk(request.getPrenomDoctorant().toUpperCase() + " " + request.getNomDoctorant().toUpperCase(), getBoldFont()));

        if (request.getCin() != null) {
            intro.add(new Chunk("\nCIN : ", getNormalFont()));
            intro.add(new Chunk(request.getCin(), getBoldFont()));
        }

        intro.add(new Chunk("\n\nTitre de la thèse :\n", getNormalFont()));
        intro.add(new Chunk("« " + request.getSujetThese() + " »\n\n", getBoldFont()));

        intro.add(new Chunk("Dirigée par : ", getNormalFont()));
        intro.add(new Chunk(request.getDirecteurThese(), getBoldFont()));

        document.add(intro);
        document.add(new Paragraph("\n"));

        // Composition du jury
        if (request.getMembresJury() != null && !request.getMembresJury().isEmpty()) {
            Paragraph juryTitle = new Paragraph("Le jury était composé de :", getSubtitleFont());
            juryTitle.setSpacingAfter(10f);
            document.add(juryTitle);

            PdfPTable juryTable = new PdfPTable(4);
            juryTable.setWidthPercentage(100);
            juryTable.setWidths(new float[]{3f, 2.5f, 2f, 1.5f});

            addTableHeader(juryTable, "Membre");
            addTableHeader(juryTable, "Établissement");
            addTableHeader(juryTable, "Rôle");
            addTableHeader(juryTable, "Présent");

            for (ProcesVerbalRequest.MembreJuryPvDto membre : request.getMembresJury()) {
                addTableCell(juryTable, (membre.getTitre() != null ? membre.getTitre() + " " : "") + membre.getPrenom() + " " + membre.getNom());
                addTableCell(juryTable, membre.getEtablissement() != null ? membre.getEtablissement() : "-");
                addTableCell(juryTable, formatRole(membre.getRole()));
                addTableCell(juryTable, membre.isPresent() ? "Oui" : "Non");
            }

            document.add(juryTable);
        }

        document.add(new Paragraph("\n"));

        // Délibération et résultat
        Paragraph deliberation = new Paragraph();
        deliberation.setAlignment(Element.ALIGN_JUSTIFIED);
        deliberation.setLeading(18f);

        deliberation.add(new Chunk("Après avoir entendu la présentation des travaux de recherche par le(la) candidat(e) et les réponses aux questions du jury, ce dernier, après délibération, a décidé d'attribuer au(à la) candidat(e) le grade de ", getNormalFont()));
        deliberation.add(new Chunk("DOCTEUR", getBoldFont()));
        deliberation.add(new Chunk(" avec la mention :\n\n", getNormalFont()));

        // Mention avec style
        Paragraph mentionPara = new Paragraph();
        mentionPara.setAlignment(Element.ALIGN_CENTER);
        Font mentionFont = new Font(Font.HELVETICA, 16, Font.BOLD);
        mentionFont.setColor(PRIMARY_COLOR);
        mentionPara.add(new Chunk(formatMention(request.getMention()), mentionFont));
        if (request.isAvecFelicitations()) {
            mentionPara.add(new Chunk("\navec les félicitations du jury", getBoldFont()));
        }
        document.add(deliberation);
        document.add(mentionPara);

        // Observations
        if (request.getObservations() != null && !request.getObservations().isEmpty()) {
            document.add(new Paragraph("\n"));
            Paragraph obs = new Paragraph();
            obs.add(new Chunk("Observations : ", getBoldFont()));
            obs.add(new Chunk(request.getObservations(), getNormalFont()));
            document.add(obs);
        }

        document.add(new Paragraph("\n\n"));

        // Zone de signatures du jury
        Paragraph signaturesTitle = new Paragraph("Signatures des membres du jury :", getSubtitleFont());
        signaturesTitle.setSpacingAfter(20f);
        document.add(signaturesTitle);

        if (request.getMembresJury() != null && request.getMembresJury().size() >= 2) {
            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);
            sigTable.setSpacingBefore(10f);

            for (ProcesVerbalRequest.MembreJuryPvDto membre : request.getMembresJury()) {
                PdfPCell cell = new PdfPCell();
                cell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
                cell.setPadding(10f);

                Paragraph sigBlock = new Paragraph();
                sigBlock.add(new Chunk(formatRole(membre.getRole()) + "\n", getSmallFont()));
                sigBlock.add(new Chunk((membre.getTitre() != null ? membre.getTitre() + " " : "") + membre.getPrenom() + " " + membre.getNom() + "\n\n\n", getNormalFont()));
                sigBlock.add(new Chunk("Signature : _______________", getSmallFont()));

                cell.addElement(sigBlock);
                sigTable.addCell(cell);
            }

            // Ajouter une cellule vide si nombre impair
            if (request.getMembresJury().size() % 2 != 0) {
                PdfPCell emptyCell = new PdfPCell();
                emptyCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
                sigTable.addCell(emptyCell);
            }

            document.add(sigTable);
        }

        document.close();

        log.info("Procès-verbal de soutenance généré avec succès");
        return baos.toByteArray();
    }

    // ==================== MÉTHODES UTILITAIRES ====================

    private void addHeader(Document document, String title) throws DocumentException {
        // Logo et nom de l'établissement
        Paragraph header = new Paragraph();
        header.setAlignment(Element.ALIGN_CENTER);

        Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD);
        headerFont.setColor(PRIMARY_COLOR);

        header.add(new Chunk("ROYAUME DU MAROC\n", headerFont));
        header.add(new Chunk("Université Hassan II de Casablanca\n", headerFont));
        header.add(new Chunk("École Nationale Supérieure d'Enseignement Technique\n", headerFont));
        header.add(new Chunk("ENSET Mohammedia\n", headerFont));

        document.add(header);

        // Ligne de séparation
        LineSeparator line = new LineSeparator();
        line.setLineColor(PRIMARY_COLOR);
        line.setLineWidth(1.5f);
        document.add(new Chunk(line));

        document.add(new Paragraph("\n"));

        // Titre du document
        Paragraph titlePara = new Paragraph(title, getTitleFont());
        titlePara.setAlignment(Element.ALIGN_CENTER);
        titlePara.setSpacingAfter(20f);
        document.add(titlePara);
    }

    private void addSignatureBlock(Document document, String city) throws DocumentException {
        document.add(new Paragraph("\n\n"));

        PdfPTable sigTable = new PdfPTable(2);
        sigTable.setWidthPercentage(100);

        // Cellule vide à gauche
        PdfPCell emptyCell = new PdfPCell();
        emptyCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        sigTable.addCell(emptyCell);

        // Bloc signature à droite
        PdfPCell sigCell = new PdfPCell();
        sigCell.setBorder(com.lowagie.text.Rectangle.NO_BORDER);
        sigCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph sigBlock = new Paragraph();
        sigBlock.setAlignment(Element.ALIGN_CENTER);
        sigBlock.add(new Chunk("Fait à " + city + ", le " + LocalDate.now().format(DATE_FORMATTER) + "\n\n", getNormalFont()));
        sigBlock.add(new Chunk("Le Chef de l'Établissement\n\n\n\n", getBoldFont()));
        sigBlock.add(new Chunk("_______________________", getNormalFont()));

        sigCell.addElement(sigBlock);
        sigTable.addCell(sigCell);

        document.add(sigTable);
    }

    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, getBoldFont()));
        cell.setBackgroundColor(new Color(240, 240, 240));
        cell.setPadding(8f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, getNormalFont()));
        cell.setPadding(6f);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(cell);
    }

    private String formatRole(String role) {
        if (role == null) return "-";
        return switch (role.toUpperCase()) {
            case "PRESIDENT" -> "Président";
            case "RAPPORTEUR" -> "Rapporteur";
            case "EXAMINATEUR" -> "Examinateur";
            case "DIRECTEUR" -> "Directeur de thèse";
            case "CO_DIRECTEUR" -> "Co-directeur";
            default -> role;
        };
    }

    private String formatMention(String mention) {
        if (mention == null) return "HONORABLE";
        return switch (mention.toUpperCase()) {
            case "TRES_HONORABLE", "TRES HONORABLE" -> "TRÈS HONORABLE";
            case "HONORABLE" -> "HONORABLE";
            case "PASSABLE" -> "PASSABLE";
            default -> mention.toUpperCase();
        };
    }
}