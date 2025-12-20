package ma.enset.documentservice.repositories;

import ma.enset.documentservice.entities.GeneratedDocument;
import ma.enset.documentservice.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<GeneratedDocument, Long> {

    List<GeneratedDocument> findByUserId(Long userId);

    List<GeneratedDocument> findByDocumentType(DocumentType documentType);

    List<GeneratedDocument> findByReferenceIdAndReferenceType(Long referenceId, String referenceType);

    Optional<GeneratedDocument> findByFileName(String fileName);

    List<GeneratedDocument> findByUserIdAndDocumentType(Long userId, DocumentType documentType);

    List<GeneratedDocument> findByGeneratedAtBetween(LocalDateTime start, LocalDateTime end);

    List<GeneratedDocument> findByIsValidTrue();

    List<GeneratedDocument> findByValidUntilBeforeAndIsValidTrue(LocalDateTime date);

    long countByDocumentType(DocumentType documentType);

    long countByGeneratedAtAfter(LocalDateTime date);
}
