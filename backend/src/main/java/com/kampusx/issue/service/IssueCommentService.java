package com.kampusx.issue.service;

import com.kampusx.issue.dto.CreateCommentRequest;
import com.kampusx.issue.dto.IssueCommentResponse;
import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.entity.IssueComment;
import com.kampusx.issue.repository.IssueCommentRepository;
import com.kampusx.issue.repository.IssueRepository;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueCommentService {

    private final IssueCommentRepository issueCommentRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;

    public IssueCommentResponse addComment(
            Long issueId,
            String email,
            CreateCommentRequest request) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        IssueComment comment = new IssueComment();
        comment.setComment(request.getComment());
        comment.setIssue(issue);
        comment.setUser(user);

        IssueComment savedComment =
                issueCommentRepository.save(comment);

        return toResponse(savedComment);
    }

    public List<IssueCommentResponse> getComments(Long issueId) {

        if (!issueRepository.existsById(issueId)) {
            throw new RuntimeException("Issue not found");
        }

        return issueCommentRepository
                .findByIssueIdOrderByIdAsc(issueId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private IssueCommentResponse toResponse(IssueComment comment) {

        IssueCommentResponse response = new IssueCommentResponse();

        response.setId(comment.getId());
        response.setComment(comment.getComment());
        response.setUserId(comment.getUser().getId());

        // Change getName() if your User entity uses another field
        response.setUserName(comment.getUser().getName());

        return response;
    }
}