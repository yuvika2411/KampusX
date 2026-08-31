package com.kampusx.issue.service;

import com.kampusx.issue.entity.Issue;
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

        boolean alreadyVoted =
                issueVoteRepository.existsByIssueIdAndUserId(
                        issueId,
                        user.getId()
                );

        if (alreadyVoted) {
            throw new RuntimeException("Already marked as affected");
        }

        IssueVote vote = new IssueVote();
        vote.setIssue(issue);
        vote.setUser(user);

        issueVoteRepository.save(vote);
    }

    public long getVoteCount(Long issueId) {
        return issueVoteRepository.countByIssueId(issueId);
    }
}