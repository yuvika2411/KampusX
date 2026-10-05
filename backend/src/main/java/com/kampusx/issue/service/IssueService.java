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
import com.kampusx.user.entity.Role;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import com.kampusx.issue.repository.IssueVoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final IssueVoteRepository issueVoteRepository;

    public IssueResponse createIssue(CreateIssueRequest request) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User reporter = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Issue issue = new Issue();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(category);
        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        issue.setLocation(location);
        issue.setReporter(reporter);

        Issue savedIssue = issueRepository.save(issue);

        return toResponse(savedIssue);
    }

    private IssueResponse toResponse(Issue issue) {

        IssueResponse response = new IssueResponse();

        response.setId(issue.getId());
        response.setTitle(issue.getTitle());
        response.setDescription(issue.getDescription());
        response.setCategoryId(issue.getCategory().getId());
        response.setCategoryName(issue.getCategory().getName());
        response.setLocationId(issue.getLocation().getId());
        response.setLocationName(issue.getLocation().getName());
        response.setPriority(issue.getPriority());
        response.setStatus(issue.getStatus());
        long affectedUsers =
                issueVoteRepository.countByIssueId(issue.getId());

        response.setAffectedUsers(
                (int) issueVoteRepository.countByIssueId(issue.getId())
        );
        response.setReporterId(issue.getReporter().getId());

        return response;
    }

    public List<IssueResponse> getAllIssues() {
        return issueRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<IssueResponse> getIssuesForCategoryHead(Long categoryHeadId) {

        return issueRepository.findByCategoryCategoryHeadId(categoryHeadId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public IssueResponse getIssueById(Long id) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        return toResponse(issue);
    }

    public IssueResponse updateIssue(Long id, CreateIssueRequest request) {

        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));


        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(category);
        issue.setLocation(location);

        Issue updatedIssue = issueRepository.save(issue);

        return toResponse(updatedIssue);
    }

    public IssueResponse assignResolver(
            Long issueId,
            Long resolverId,
            Long categoryHeadId) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        User resolver = userRepository.findById(resolverId)
                .orElseThrow(() -> new RuntimeException("Resolver not found"));

        // Selected user must actually be a RESOLVER
        if (resolver.getRole() != Role.RESOLVER) {
            throw new RuntimeException("User is not a Resolver");
        }

        // Category Head can assign only issues from their own category
        if (issue.getCategory().getCategoryHead() == null ||
                !issue.getCategory().getCategoryHead().getId().equals(categoryHeadId)) {
            throw new RuntimeException(
                    "You cannot assign a resolver to this issue"
            );
        }

        issue.setResolver(resolver);
        issue.setStatus(IssueStatus.ASSIGNED);

        Issue savedIssue = issueRepository.save(issue);

        return toResponse(savedIssue);
    }

    public void deleteIssue( Long issueId){
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        issueRepository.delete(issue);
    }


}