package com.kampusx.issue.service;

import com.kampusx.issue.dto.CreateIssueRequest;
import com.kampusx.issue.dto.IssueResponse;
import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.repository.IssueRepository;
import com.kampusx.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.kampusx.user.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    public IssueResponse createIssue(CreateIssueRequest request) {

        User reporter = userRepository.findById(request.getReporterId())
                .orElseThrow(() -> new RuntimeException("Reporter not found"));

        Issue issue = new Issue();

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(request.getCategory());
        issue.setLocation(request.getLocation());
        issue.setPriority(request.getPriority());
        issue.setAffectedUsers(request.getAffectedUsers());
        issue.setReporter(reporter);

        Issue savedIssue = issueRepository.save(issue);

        IssueResponse response = new IssueResponse();

        response.setId(savedIssue.getId());
        response.setTitle(savedIssue.getTitle());
        response.setDescription(savedIssue.getDescription());
        response.setCategory(savedIssue.getCategory());
        response.setLocation(savedIssue.getLocation());
        response.setPriority(savedIssue.getPriority());
        response.setStatus(savedIssue.getStatus());
        response.setAffectedUsers(savedIssue.getAffectedUsers());
        response.setReporterId(savedIssue.getReporter().getId());

        return response;
    }

    private IssueResponse toResponse(Issue issue) {

        IssueResponse response = new IssueResponse();

        response.setId(issue.getId());
        response.setTitle(issue.getTitle());
        response.setDescription(issue.getDescription());
        response.setCategory(issue.getCategory());
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

        issue.setTitle(request.getTitle());
        issue.setDescription(request.getDescription());
        issue.setCategory(request.getCategory());
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