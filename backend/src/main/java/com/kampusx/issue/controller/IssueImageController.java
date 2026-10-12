package com.kampusx.issue.controller;

import com.kampusx.issue.service.IssueImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/issues")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class IssueImageController {

    private final IssueImageService imageService;

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping(
            value = "/{issueId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<IssueImageService.ImageResponse> upload(
            @PathVariable Long issueId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(imageService.upload(
                        issueId,
                        file,
                        authentication.getName()
                ));
    }

    @GetMapping("/{issueId}/images")
    public List<IssueImageService.ImageResponse> list(
            @PathVariable Long issueId
    ) {
        return imageService.list(issueId);
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long imageId,
            Authentication authentication
    ) {
        imageService.delete(imageId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}