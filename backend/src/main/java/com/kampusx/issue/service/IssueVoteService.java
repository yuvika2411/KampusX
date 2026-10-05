package com.kampusx.issue.service;

import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.entity.IssuePriority;
import com.kampusx.issue.entity.IssueVote;
import com.kampusx.issue.repository.IssueRepository;
import com.kampusx.issue.repository.IssueVoteRepository;
import com.kampusx.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IssueVoteService {

    private final IssueVoteRepository issueVoteRepository;
    private final IssueRepository issueRepository;

    public void vote(Long issueId, User user) {

        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new RuntimeException("Issue not found"));

        if (issueVoteRepository.existsByIssueIdAndUserId(issueId, user.getId())) {
            throw new RuntimeException("You have already voted for this issue");
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
    }

    public long getVoteCount(Long issueId) {

        // Verify issue exists
        if (!issueRepository.existsById(issueId)) {
            throw new RuntimeException("Issue not found");
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