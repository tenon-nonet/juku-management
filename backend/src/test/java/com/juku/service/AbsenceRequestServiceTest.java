package com.juku.service;

import com.juku.dto.AbsenceRequestDto;
import com.juku.entity.AbsenceRequest;
import com.juku.entity.Student;
import com.juku.repository.AbsenceRequestRepository;
import com.juku.repository.LessonRepository;
import com.juku.repository.StudentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AbsenceRequestServiceTest {

    @Mock
    private AbsenceRequestRepository repo;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private LessonRepository lessonRepository;

    @InjectMocks
    private AbsenceRequestService absenceRequestService;

    // -----------------------------------------------------------------------
    // findAll_returnsAllSortedByDate
    // -----------------------------------------------------------------------
    @Test
    void findAll_returnsAllSortedByDate() {
        // Given: リポジトリが2件返す
        Student student = buildStudent(1L, "田中 太郎");

        AbsenceRequest r1 = buildAbsenceRequest(1L, student, LocalDate.of(2026, 3, 20));
        AbsenceRequest r2 = buildAbsenceRequest(2L, student, LocalDate.of(2026, 3, 10));

        when(repo.findAll(Sort.by(Sort.Direction.DESC, "absenceDate")))
                .thenReturn(List.of(r1, r2));

        // When
        List<AbsenceRequestDto> result = absenceRequestService.findAll();

        // Then: 2件が返される
        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals(2L, result.get(1).getId());
    }

    // -----------------------------------------------------------------------
    // create_setsStatusToPending
    // -----------------------------------------------------------------------
    @Test
    void create_setsStatusToPending() {
        // Given: 新規欠席連絡リクエスト
        Student student = buildStudent(2L, "鈴木 花子");

        AbsenceRequestDto req = new AbsenceRequestDto();
        req.setStudentId(2L);
        req.setAbsenceDate(LocalDate.of(2026, 4, 1));
        req.setReason("発熱のため");
        req.setWantsMakeup(false);

        when(studentRepository.findById(2L)).thenReturn(Optional.of(student));

        AbsenceRequest saved = buildAbsenceRequest(3L, student, LocalDate.of(2026, 4, 1));
        saved.setStatus(AbsenceRequest.Status.PENDING);
        when(repo.save(any(AbsenceRequest.class))).thenReturn(saved);

        // When
        AbsenceRequestDto result = absenceRequestService.create(req);

        // Then: ステータスが PENDING になっている
        assertEquals("PENDING", result.getStatus());
        verify(repo, times(1)).save(any(AbsenceRequest.class));
    }

    // -----------------------------------------------------------------------
    // updateStatus_changesStatus
    // -----------------------------------------------------------------------
    @Test
    void updateStatus_changesStatus() {
        // Given: 既存の欠席連絡レコード（PENDING）
        Student student = buildStudent(3L, "佐藤 次郎");
        AbsenceRequest existing = buildAbsenceRequest(4L, student, LocalDate.of(2026, 3, 25));
        existing.setStatus(AbsenceRequest.Status.PENDING);

        when(repo.findById(4L)).thenReturn(Optional.of(existing));
        when(repo.save(any(AbsenceRequest.class))).thenAnswer(inv -> inv.getArgument(0));

        // When: CONFIRMED に変更
        AbsenceRequestDto result = absenceRequestService.updateStatus(4L, "CONFIRMED", null);

        // Then: ステータスが CONFIRMED に変わっている
        assertEquals("CONFIRMED", result.getStatus());
    }

    // -----------------------------------------------------------------------
    // Helper methods
    // -----------------------------------------------------------------------

    private Student buildStudent(Long id, String fullName) {
        Student s = new Student();
        s.setId(id);
        s.setFullName(fullName);
        s.setGrade("中2");
        s.setStatus(Student.Status.ACTIVE);
        return s;
    }

    private AbsenceRequest buildAbsenceRequest(Long id, Student student, LocalDate absenceDate) {
        AbsenceRequest r = new AbsenceRequest();
        r.setId(id);
        r.setStudent(student);
        r.setAbsenceDate(absenceDate);
        r.setStatus(AbsenceRequest.Status.PENDING);
        return r;
    }
}
