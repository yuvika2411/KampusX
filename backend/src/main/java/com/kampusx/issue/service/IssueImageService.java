package com.kampusx.issue.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.entity.IssueImage;
import com.kampusx.issue.repository.IssueImageRepository;
import com.kampusx.issue.repository.IssueRepository;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IssueImageService {

    private static final long MAX_SIZE = 5L * 1024 * 1024;

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    private final Cloudinary cloudinary;
    private final IssueRepository issueRepository;
    private final IssueImageRepository imageRepository;
    private final UserRepository userRepository;

    public record ImageResponse(
            Long id,
            Long issueId,
            String imageUrl
    ) {}

    public ImageResponse upload(
            Long issueId,
            MultipartFile file,
            String email
    ) {
        User user = getUser(email);

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Issue not found"));

        if (!issue.getReporter().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the reporter can upload images");
        }

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Image is required");
        }

        if (file.getSize() > MAX_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "Maximum image size is 5 MB");
        }

        String detectedType;

        try (InputStream input = file.getInputStream()) {
            detectedType = detectType(input.readNBytes(16));
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot read image", e);
        }

        if (!ALLOWED_TYPES.contains(detectedType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPG, PNG and WebP images are allowed");
        }

        String publicId = "kampusx/issues/" + UUID.randomUUID();

        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "resource_type", "image",
                            "overwrite", false
                    )
            );

            String savedPublicId =
                    (String) result.get("public_id");

            String imageUrl =
                    (String) result.get("secure_url");

            if (savedPublicId == null || imageUrl == null) {
                throw new IOException(
                        "Cloudinary returned incomplete upload data");
            }

            try {
                IssueImage image = new IssueImage();
                image.setIssue(issue);
                image.setPublicId(savedPublicId);
                image.setImageUrl(imageUrl);

                imageRepository.save(image);

                return toResponse(image);

            } catch (RuntimeException e) {
                try {
                    cloudinary.uploader().destroy(
                            savedPublicId,
                            ObjectUtils.emptyMap()
                    );
                } catch (Exception cleanupError) {
                    e.addSuppressed(cleanupError);
                }
                throw e;
            }

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Cloudinary upload failed", e);
        }
    }

    public List<ImageResponse> list(Long issueId) {
        if (!issueRepository.existsById(issueId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Issue not found");
        }

        return imageRepository.findByIssueIdOrderByIdAsc(issueId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void delete(Long imageId, String email) {
        User user = getUser(email);

        IssueImage image = imageRepository.findById(imageId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Image not found"));

        boolean reporter = image.getIssue()
                .getReporter().getId().equals(user.getId());

        boolean admin = user.getRole().name().equals("ADMIN");

        if (!reporter && !admin) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Not allowed to delete this image");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().destroy(
                    image.getPublicId(),
                    ObjectUtils.emptyMap()
            );

            if (!"ok".equals(result.get("result"))
                    && !"not found".equals(result.get("result"))) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Cloudinary could not delete image");
            }

            imageRepository.delete(image);

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Cloudinary delete failed", e);
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private ImageResponse toResponse(IssueImage image) {
        return new ImageResponse(
                image.getId(),
                image.getIssue().getId(),
                image.getImageUrl()
        );
    }

    private String detectType(byte[] b) {
        if (b.length >= 3
                && (b[0] & 255) == 255
                && (b[1] & 255) == 216
                && (b[2] & 255) == 255) {
            return "image/jpeg";
        }

        if (b.length >= 8
                && (b[0] & 255) == 137
                && b[1] == 'P'
                && b[2] == 'N'
                && b[3] == 'G'
                && (b[4] & 255) == 13
                && (b[5] & 255) == 10
                && (b[6] & 255) == 26
                && (b[7] & 255) == 10) {
            return "image/png";
        }

        if (b.length >= 12
                && b[0] == 'R'
                && b[1] == 'I'
                && b[2] == 'F'
                && b[3] == 'F'
                && b[8] == 'W'
                && b[9] == 'E'
                && b[10] == 'B'
                && b[11] == 'P') {
            return "image/webp";
        }

        return null;
    }
}