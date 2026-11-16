package com.kampusx.issue.service;

import com.kampusx.issue.dto.IssueResponse;
import com.kampusx.issue.entity.Category;
import com.kampusx.issue.entity.Issue;
import com.kampusx.issue.entity.IssuePriority;
import com.kampusx.issue.entity.IssueStatus;
import com.kampusx.issue.entity.Location;
import com.kampusx.issue.repository.CategoryRepository;
import com.kampusx.issue.repository.IssueCommentRepository;
import com.kampusx.issue.repository.IssueRepository;
import com.kampusx.issue.repository.IssueVoteRepository;
import com.kampusx.issue.repository.LocationRepository;
import com.kampusx.notification.service.AppNotificationService;
import com.kampusx.user.entity.Role;
import com.kampusx.user.entity.User;
import com.kampusx.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigInteger;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IssueServiceTest {

    @Mock
    private IssueRepository issueRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private LocationRepository locationRepository;

    @Mock
    private IssueVoteRepository issueVoteRepository;

    @Mock
    private IssueCommentRepository issueCommentRepository;

    @Mock
    private AppNotificationService notificationService;

    @InjectMocks
    private IssueService issueService;

    private User student;
    private Issue issue;

    @BeforeEach
    void setUp() {
        student = new User();
        student.setId(10L);
        student.setEmail("student@kiet.edu");
        student.setName("Student Name");
        student.setRole(Role.STUDENT);

        Category category = new Category();
        category.setId(1L);
        category.setName("CAMPUS_WIFI");

        Location location = new Location();
        location.setId(2L);
        location.setName("Aryabhatta Hostel");

        issue = new Issue();
        issue.setId(100L);
        issue.setTitle("Broken Wi-Fi AP");
        issue.setDescription("Wi-Fi dropping");
        issue.setFloorRoom("2nd Floor, Room 204");
        issue.setCreatedAt(LocalDateTime.of(2026, 11, 16, 12, 0));
        issue.setStatus(IssueStatus.REPORTED);
        issue.setPriority(IssuePriority.MEDIUM);
        issue.setCategory(category);
        issue.setLocation(location);
        issue.setReporter(student);

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(student.getEmail(), null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void getMyIssues_returnsProperlyMappedIssues() {
        when(userRepository.findByEmail("student@kiet.edu")).thenReturn(Optional.of(student));
        when(issueRepository.findByReporterId(10L)).thenReturn(List.of(issue));

        // Test with BigInteger and Long counts to ensure Number casting resilience
        List<Object[]> voteRows = new ArrayList<>();
        voteRows.add(new Object[]{100L, BigInteger.valueOf(5)});
        when(issueVoteRepository.countVotesByIssueIds(any())).thenReturn(voteRows);

        List<Object[]> commentRows = new ArrayList<>();
        commentRows.add(new Object[]{100L, 3L});
        when(issueCommentRepository.countCommentsByIssueIds(any())).thenReturn(commentRows);

        when(issueVoteRepository.findVotedIssueIdsByUserId(any(), eq(10L))).thenReturn(List.of(100L));

        List<IssueResponse> result = issueService.getMyIssues("student@kiet.edu");

        assertThat(result).hasSize(1);
        IssueResponse res = result.get(0);
        assertThat(res.getId()).isEqualTo(100L);
        assertThat(res.getTitle()).isEqualTo("Broken Wi-Fi AP");
        assertThat(res.getFloorRoom()).isEqualTo("2nd Floor, Room 204");
        assertThat(res.getCreatedAt()).isEqualTo(LocalDateTime.of(2026, 11, 16, 12, 0));
        assertThat(res.getCategoryName()).isEqualTo("CAMPUS_WIFI");
        assertThat(res.getLocationName()).isEqualTo("Aryabhatta Hostel");
        assertThat(res.getReporterName()).isEqualTo("Student Name");
        assertThat(res.getVoteCount()).isEqualTo(5L);
        assertThat(res.getCommentCount()).isEqualTo(3L);
        assertThat(res.isHasVoted()).isTrue();
    }

    @Test
    void getMyIssues_whenEmpty_returnsEmptyList() {
        when(userRepository.findByEmail("student@kiet.edu")).thenReturn(Optional.of(student));
        when(issueRepository.findByReporterId(10L)).thenReturn(List.of());

        List<IssueResponse> result = issueService.getMyIssues("student@kiet.edu");
        assertThat(result).isEmpty();
    }
}
