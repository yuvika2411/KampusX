package com.kampusx.issue.service;

import com.kampusx.issue.dto.CreateIssueRequest;
import com.kampusx.issue.dto.IssueResponse;
import com.kampusx.issue.entity.Category;
import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.entity.IssueStatus;
import com.kampusx.issue.entity.Location;
import com.kampusx.issue.repository.CategoryRepository;
import com.kampusx.issue.repository.IssueRepository;
import com.kampusx.issue.repository.LocationRepository;
import com.kampusx.issue.specification.IssueSpecification;
import com.kampusx.user.entity.Role;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import com.kampusx.issue.repository.IssueVoteRepository;
import com.kampusx.issue.repository.IssueCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import com.kampusx.notification.service.AppNotificationService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;
import com.kampusx.common.ResourceNotFoundException;
import com.kampusx.common.BadRequestException;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final IssueVoteRepository issueVoteRepository;
    private final IssueCommentRepository issueCommentRepository;
    private final AppNotificationService notificationService;

    public IssueResponse createIssue(CreateIssueRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User reporter = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Issue issue = new Issue();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(category);
        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        issue.setLocation(location);
        issue.setFloorRoom(request.getFloorRoom());
        if (issue.getCreatedAt() == null) {
            issue.setCreatedAt(LocalDateTime.now());
        }
        issue.setReporter(reporter);

        Issue savedIssue = issueRepository.save(issue);

        return toResponse(savedIssue);
    }

    public IssueResponse updateIssue(Long id, CreateIssueRequest request) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(category);
        issue.setLocation(location);
        if (request.getFloorRoom() != null) {
            issue.setFloorRoom(request.getFloorRoom());
        }

        Issue updatedIssue = issueRepository.save(issue);

        return toResponse(updatedIssue);
    }

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return userRepository.findByEmail(auth.getName())
                .map(User::getId)
                .orElse(null);
    }

    private List<IssueResponse> toResponseList(List<Issue> issues) {
        if (issues == null || issues.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> issueIds = issues.stream().map(Issue::getId).toList();
        Long currentUserId = getCurrentUserId();

        Map<Long, Long> voteCounts = new HashMap<>();
        for (Object[] row : issueVoteRepository.countVotesByIssueIds(issueIds)) {
            voteCounts.put((Long) row[0], (Long) row[1]);
        }

        Map<Long, Long> commentCounts = new HashMap<>();
        for (Object[] row : issueCommentRepository.countCommentsByIssueIds(issueIds)) {
            commentCounts.put((Long) row[0], (Long) row[1]);
        }

        Set<Long> userVotedIssueIds = currentUserId != null
                ? new HashSet<>(issueVoteRepository.findVotedIssueIdsByUserId(issueIds, currentUserId))
                : Collections.emptySet();

        return issues.stream()
                .map(issue -> toResponse(
                        issue,
                        voteCounts.getOrDefault(issue.getId(), 0L),
                        commentCounts.getOrDefault(issue.getId(), 0L),
                        userVotedIssueIds.contains(issue.getId())
                ))
                .toList();
    }

    private IssueResponse toResponse(Issue issue) {
        if (issue == null) return null;
        Long currentUserId = getCurrentUserId();
        long votes = issueVoteRepository.countByIssueId(issue.getId());
        long comments = issueCommentRepository.countByIssueId(issue.getId());
        boolean hasVoted = currentUserId != null && issueVoteRepository.existsByIssueIdAndUserId(issue.getId(), currentUserId);
        return toResponse(issue, votes, comments, hasVoted);
    }

    private IssueResponse toResponse(Issue issue, long voteCount, long commentCount, boolean hasVoted) {

        IssueResponse response = new IssueResponse();

        response.setId(issue.getId());
        response.setTitle(issue.getTitle());
        response.setDescription(issue.getDescription());
        response.setFloorRoom(issue.getFloorRoom());
        response.setCreatedAt(issue.getCreatedAt());

        if (issue.getCategory() != null) {
            response.setCategoryId(issue.getCategory().getId());
            response.setCategoryName(issue.getCategory().getName());
        }

        if (issue.getLocation() != null) {
            response.setLocationId(issue.getLocation().getId());
            response.setLocationName(issue.getLocation().getName());
        }

        response.setPriority(issue.getPriority());
        response.setStatus(issue.getStatus());

        response.setAffectedUsers((int) voteCount);
        response.setVoteCount(voteCount);
        response.setCommentCount(commentCount);
        response.setHasVoted(hasVoted);

        if (issue.getReporter() != null) {
            response.setReporterId(issue.getReporter().getId());
            response.setReporterName(issue.getReporter().getName());
        }

        return response;
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getAllIssues() {
        return toResponseList(issueRepository.findAll());
    }

    public List<IssueResponse> getMyIssues(String email) {

        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return toResponseList(issueRepository.findByReporterId(student.getId()));
    }

    public List<IssueResponse> getIssuesForCategoryHead(Long categoryHeadId) {

        return toResponseList(issueRepository.findByCategoryCategoryHeadId(categoryHeadId));
    }

    public IssueResponse getIssueById(Long id) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Issue not found")
                );

        return toResponse(issue);
    }

    @Transactional
    public IssueResponse updateStatus(
            Long issueId,
            IssueStatus newStatus,
            String email) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Only the assigned resolver can update the issue
        if (issue.getResolver() == null ||
                !issue.getResolver().getId().equals(user.getId())) {

            throw new AccessDeniedException(
                    "You are not the assigned resolver for this issue"
            );
        }

        IssueStatus currentStatus = issue.getStatus();

        if (newStatus == null) {
            throw new ResourceNotFoundException("Status is required");
        }

        if (currentStatus != IssueStatus.ASSIGNED
                && currentStatus != IssueStatus.IN_PROGRESS) {
            throw new ResourceNotFoundException(
                    "Issue cannot be updated from its current status"
            );
        }

        if (currentStatus == IssueStatus.ASSIGNED
                && newStatus != IssueStatus.IN_PROGRESS) {

            throw new BadRequestException(
                    "Assigned issue can only move to IN_PROGRESS"
            );
        }

        if (currentStatus == IssueStatus.IN_PROGRESS
                && newStatus != IssueStatus.RESOLVED) {

            throw new BadRequestException(
                    "In-progress issue can only move to RESOLVED"
            );
        }

        if (currentStatus == IssueStatus.RESOLVED
                || currentStatus == IssueStatus.CLOSED
                || currentStatus == IssueStatus.REOPENED) {

            throw new BadRequestException(
                    "Resolver cannot update the issue from its current status"
            );
        }

        issue.setStatus(newStatus);

        Issue savedIssue = issueRepository.save(issue);

        notificationService.notifyUser(
                savedIssue.getReporter(),
                savedIssue.getId(),
                "Your issue #" + savedIssue.getId()
                        + " status changed to " + newStatus + "."
        );

        return toResponse(savedIssue);
    }

    @Transactional
    public IssueResponse closeIssue(Long issueId, String studentEmail) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Only the student who created the issue can close it
        if (!issue.getReporter().getId().equals(student.getId())) {
            throw new AccessDeniedException(
                    "You are not the student who created this issue"
            );        }

        // Issue must be resolved before closing
        if (issue.getStatus() != IssueStatus.RESOLVED) {
            throw new BadRequestException("Only resolved issues can be closed");
        }

        issue.setStatus(IssueStatus.CLOSED);

        Issue savedIssue = issueRepository.save(issue);
        notificationService.notifyUser(
                savedIssue.getResolver(),
                savedIssue.getId(),
                "Issue #" + savedIssue.getId()
                        + " has been closed by the student."
        );

        return toResponse(savedIssue);
    }

    @Transactional
    public IssueResponse reopenIssue(Long issueId, String studentEmail) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Only the student who created the issue can reopen it
        if (!issue.getReporter().getId().equals(student.getId())) {
            throw new AccessDeniedException(
                    "You are not the student who created this issue"
            );
        }

        // Only CLOSED issues can be reopened
        if (issue.getStatus() != IssueStatus.CLOSED) {
            throw new BadRequestException(
                    "Only closed issues can be reopened"
            );
        }

        issue.setStatus(IssueStatus.REOPENED);

        Issue savedIssue = issueRepository.save(issue);
        notificationService.notifyUser(
                savedIssue.getResolver(),
                savedIssue.getId(),
                "Issue #" + savedIssue.getId()
                        + " has been reopened by the student."
        );

        return toResponse(savedIssue);
    }

    @Transactional
    public IssueResponse assignResolver(
            Long issueId,
            Long resolverId,
            Long categoryHeadId) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        User resolver = userRepository.findById(resolverId)
                .orElseThrow(() -> new ResourceNotFoundException("Resolver not found"));

        // Selected user must actually be a RESOLVER
        if (resolver.getRole() != Role.RESOLVER) {
            throw new BadRequestException("User is not a Resolver");
        }

        // Category Head can assign only issues from their own category
        if (issue.getCategory().getCategoryHead() == null ||
                !issue.getCategory().getCategoryHead().getId().equals(categoryHeadId)) {
            throw new AccessDeniedException(
                    "You cannot assign a resolver to this issue"
            );
        }

        if (issue.getStatus() == IssueStatus.RESOLVED
                || issue.getStatus() == IssueStatus.CLOSED) {
            throw new BadRequestException(
                    "Resolved or closed issues cannot be reassigned"
            );
        }

        if (!resolver.isActive()) {
            throw new BadRequestException(
                    "Inactive resolver cannot be assigned"
            );
        }

        issue.setResolver(resolver);
        issue.setStatus(IssueStatus.ASSIGNED);

        Issue savedIssue = issueRepository.save(issue);

        notificationService.notifyUser(
                resolver,
                savedIssue.getId(),
                "Issue #" + savedIssue.getId()
                        + " has been assigned to you."
        );

        notificationService.notifyUser(
                savedIssue.getReporter(),
                savedIssue.getId(),
                "A resolver has been assigned to your issue #"
                        + savedIssue.getId() + "."
        );

        return toResponse(savedIssue);
    }

    public void deleteIssue( Long issueId){
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        issueRepository.delete(issue);
    }

    public List<IssueResponse> getAssignedIssues(String email) {

        User resolver = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Resolver not found"));

        return toResponseList(issueRepository.findByResolverId(resolver.getId()));
    }

    public Page<IssueResponse> searchIssues(
            String status,
            String search,
            Long categoryId,
            Long locationId,
            String sort,
            Pageable pageable
    ) {
        Page<Issue> page = issueRepository.findAll(
                IssueSpecification.filter(
                        status,
                        search,
                        categoryId,
                        locationId,
                        sort
                ),
                pageable
        );
        List<IssueResponse> content = toResponseList(page.getContent());
        return new org.springframework.data.domain.PageImpl<>(content, pageable, page.getTotalElements());
    }

}