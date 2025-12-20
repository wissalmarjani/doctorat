package ma.enset.documentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ma.enset.documentservice.enums.DocumentType;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentResponse {

    private Long id;
    private DocumentType documentType;
    private String fileName;
    private String downloadUrl;
    private Long fileSize;
    private LocalDateTime generatedAt;
    private boolean isValid;
    private String message;
}
