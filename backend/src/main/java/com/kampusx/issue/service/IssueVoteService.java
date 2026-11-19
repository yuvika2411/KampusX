package com.kampusx.issue.service;

import com.kampusx.common.BadRequestException;
import com.kampusx.common.ResourceNotFoundException;
import com.kampusx.common.websocket.WebSocketEventPublisher;
import com.kampusx.issue.dto.IssueResponse;
import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.entity.IssuePriority;
import com.kampusx.issue.entity.IssueVote;
import com.kampusx.issue.repository.IssueRepository;
import com.kampusx.issue.repository.IssueVoteRepository;
import com.kampusx.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class IssueVoteService {

    private final IssueVoteRepository issueVoteRepository;
    private final IssueRepository issueRepository;
    private final WebSocketEventPublisher webSocketEventPublisher;

    @Transactional
    public void vote(Long issueId, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found"));

        if (issueVoteRepository.existsByIssueIdAndUserId(issueId, user.getId())) {
            throw new BadRequestException("You have already voted for this issue");
        }

        IssueVote vote = new IssueVote();
        vote.setIssue(issue);
        vote.setUser(user);

        issueVoteRepository.save(vote);

        // Calculate affected users after the new vote
        long affectedUsers = issueVoteRepository.countByIssueId(issueId);

        // Calculate priority based on affected users
        IssuePriority priority = calculatePriority(affectedUsers);

        issue.setPriority(priority);
        issueRepository.save(issue);

        IssueResponse response = new IssueResponse();
        response.setId(issue.getId());
        response.setTitle(issue.getTitle());
        response.setDescription(issue.getDescription());
        response.setStatus(issue.getStatus());
        response.setPriority(issue.getPriority());
        response.setFloorRoom(issue.getFloorRoom());
        response.setCreatedAt(issue.getCreatedAt());
        response.setAffectedUsers((int) affectedUsers);
        response.setVoteCount(affectedUsers);
        if (issue.getCategory() != null) {
            response.setCategoryId(issue.getCategory().getId());
            response.setCategoryName(issue.getCategory().getName());
        }
        if (issue.getLocation() != null) {
            response.setLocationId(issue.getLocation().getId());
            response.setLocationName(issue.getLocation().getName());
        }
        if (issue.getReporter() != null) {
            response.setReporterId(issue.getReporter().getId());
            response.setReporterName(issue.getReporter().getName());
        }
        response.setHasVoted(true);

        String reporterEmail = issue.getReporter() != null ? issue.getReporter().getEmail() : null;
        webSocketEventPublisher.publishIssueVoted(response, reporterEmail);
    }

    public long getVoteCount(Long issueId) {

        // Verify issue exists
        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException("Issue not found");
        }

        return issueVoteRepository.countByIssueId(issueId);
    }

    private IssuePriority calculatePriority(long affectedUsers) {

        if (affectedUsers >= 30) {
            return IssuePriority.CRITICAL;
        }

        if (affectedUsers >= 15) {
            return IssuePriority.HIGH;
        }

        if (affectedUsers >= 5) {
            return IssuePriority.MEDIUM;
        }

        return IssuePriority.LOW;
    }
}