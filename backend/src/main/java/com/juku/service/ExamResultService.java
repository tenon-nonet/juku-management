package com.juku.service;

import com.juku.dto.ExamResultRequest;
import com.juku.dto.ExamResultResponse;
import com.juku.entity.ExamResult;
import com.juku.repository.ExamResultRepository;
import com.juku.repository.ExamTypeRepository;
import com.juku.repository.StudentRepository;
import com.juku.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamResultService {

    private final ExamResultRepository examResultRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final ExamTypeRepository examTypeRepository;

    public List<ExamResultResponse> search(Long studentId, Long subjectId) {
        return examResultRepository.search(studentId, subjectId)
            .stream().map(ExamResultResponse::new).toList();
    }

    public ExamResultResponse findById(Long id) {
        return examResultRepository.findById(id)
            .map(ExamResultResponse::new)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public ExamResultResponse create(ExamResultRequest req) {
        ExamResult r = new ExamResult();
        applyRequest(r, req);
        return new ExamResultResponse(examResultRepository.save(r));
    }

    public ExamResultResponse update(Long id, ExamResultRequest req) {
        ExamResult r = examResultRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        applyRequest(r, req);
        return new ExamResultResponse(examResultRepository.save(r));
    }

    public void delete(Long id) {
        if (!examResultRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        examResultRepository.deleteById(id);
    }

    private void applyRequest(ExamResult r, ExamResultRequest req) {
        var student = studentRepository.findById(req.getStudentId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Student not found"));
        var subject = subjectRepository.findById(req.getSubjectId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject not found"));
        r.setStudent(student);
        r.setSubject(subject);
        r.setExamName(req.getExamName());
        r.setExamDate(req.getExamDate());
        r.setScore(req.getScore());
        r.setMaxScore(req.getMaxScore());
        r.setRank(req.getRank());
        r.setTotalStudents(req.getTotalStudents());
        r.setMemo(req.getMemo());
        if (req.getExamTypeId() != null) {
            var examType = examTypeRepository.findById(req.getExamTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "ExamType not found"));
            r.setExamType(examType);
        }
    }
}
