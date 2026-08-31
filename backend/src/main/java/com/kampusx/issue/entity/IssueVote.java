package com.kampusx.issue.entity;

import com.kampusx.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "issue_votes",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"issue_id", "user_id"})
        }
)
@Getter
@Setter
public class IssueVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "issue_id", nullable = false)
    private Issue issue;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}