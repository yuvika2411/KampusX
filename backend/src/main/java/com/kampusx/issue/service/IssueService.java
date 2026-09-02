package com.kampusx.issue.service;

import com.kampusx.issue.dto.CreateIssueRequest;
import com.kampusx.issue.dto.IssueResponse;
import com.kampusx.issue.entity.Category;
import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.repository.CategoryRepository;
import com.kampusx.issue.repository.IssueRepository;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
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
        issue.setLocationType(request.getLocationType());
        issue.setLocation(request.getLocation());
        issue.setPriority(request.getPriority());
        issue.setAffectedUsers(request.getAffectedUsers());
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
        response.setLocationType(issue.getLocationType());
        response.setLocation(issue.getLocation());
        response.setPriority(issue.getPriority());
        response.setStatus(issue.getStatus());
        response.setAffectedUsers(issue.getAffectedUsers());
        response.setReporterId(issue.getReporter().getId());

        return response;
    }

    public List<IssueResponse> getAllIssues() {
        return issueRepository.findAll()
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

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(category);
        issue.setLocationType(request.getLocationType());
        issue.setLocation(request.getLocation());
        issue.setPriority(request.getPriority());
        issue.setAffectedUsers(request.getAffectedUsers());

        Issue updatedIssue = issueRepository.save(issue);

        return toResponse(updatedIssue);
    }

    public void deleteIssue(Long id) {
        issueRepository.deleteById(id);
    }
}