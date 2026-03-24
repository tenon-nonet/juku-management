package com.juku.service;

import com.juku.entity.*;
import com.juku.repository.*;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GradeImportService {

    private final ExamResultRepository examResultRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final ExamTypeRepository examTypeRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_FMT2 = DateTimeFormatter.ofPattern("yyyy/MM/dd");

    /**
     * CSV Import
     * Required columns: student_id または student_name, subject_name, exam_name, exam_date(yyyy-MM-dd), score
     * Optional: max_score, rank, total_students, academic_year, semester, grade_at_exam, exam_type, memo
     */
    @Transactional
    public Map<String, Object> importCsv(MultipartFile file) throws IOException {
        int successCount = 0;
        List<String> errors = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> rows = reader.readAll();
            if (rows.isEmpty()) {
                return Map.of("successCount", 0, "errorCount", 0, "errors", List.of("ファイルが空です"));
            }

            String[] header = rows.get(0);
            Map<String, Integer> colIndex = new HashMap<>();
            for (int i = 0; i < header.length; i++) {
                colIndex.put(header[i].trim().toLowerCase(), i);
            }

            for (int rowNum = 1; rowNum < rows.size(); rowNum++) {
                String[] row = rows.get(rowNum);
                if (row.length == 0 || (row.length == 1 && row[0].isBlank())) continue;

                try {
                    ExamResult r = new ExamResult();

                    // Student
                    if (colIndex.containsKey("student_id")) {
                        Long studentId = Long.parseLong(getCell(row, colIndex, "student_id").trim());
                        r.setStudent(studentRepository.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("生徒IDが見つかりません: " + studentId)));
                    } else if (colIndex.containsKey("student_name")) {
                        String name = getCell(row, colIndex, "student_name").trim();
                        r.setStudent(studentRepository.findAll().stream()
                            .filter(s -> s.getFullName().equals(name))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("生徒名が見つかりません: " + name)));
                    } else {
                        throw new RuntimeException("student_id または student_name が必要です");
                    }

                    // Subject
                    String subjectName = getCell(row, colIndex, "subject_name").trim();
                    r.setSubject(subjectRepository.findAll().stream()
                        .filter(s -> s.getName().equals(subjectName))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("科目が見つかりません: " + subjectName)));

                    // Required fields
                    r.setExamName(getCell(row, colIndex, "exam_name").trim());
                    r.setExamDate(parseDate(getCell(row, colIndex, "exam_date").trim()));
                    r.setScore(new BigDecimal(getCell(row, colIndex, "score").trim()));

                    // Optional fields
                    r.setMaxScore(colIndex.containsKey("max_score") && !getCell(row, colIndex, "max_score").isBlank()
                        ? new BigDecimal(getCell(row, colIndex, "max_score").trim())
                        : BigDecimal.valueOf(100));

                    if (colIndex.containsKey("rank") && !getCell(row, colIndex, "rank").isBlank()) {
                        r.setRank(Integer.parseInt(getCell(row, colIndex, "rank").trim()));
                    }
                    if (colIndex.containsKey("total_students") && !getCell(row, colIndex, "total_students").isBlank()) {
                        r.setTotalStudents(Integer.parseInt(getCell(row, colIndex, "total_students").trim()));
                    }
                    if (colIndex.containsKey("academic_year") && !getCell(row, colIndex, "academic_year").isBlank()) {
                        r.setAcademicYear(Integer.parseInt(getCell(row, colIndex, "academic_year").trim()));
                    }
                    if (colIndex.containsKey("semester") && !getCell(row, colIndex, "semester").isBlank()) {
                        r.setSemester(Short.parseShort(getCell(row, colIndex, "semester").trim()));
                    }
                    if (colIndex.containsKey("grade_at_exam") && !getCell(row, colIndex, "grade_at_exam").isBlank()) {
                        r.setGradeAtExam(getCell(row, colIndex, "grade_at_exam").trim());
                    }
                    if (colIndex.containsKey("memo") && !getCell(row, colIndex, "memo").isBlank()) {
                        r.setMemo(getCell(row, colIndex, "memo").trim());
                    }
                    if (colIndex.containsKey("exam_type") && !getCell(row, colIndex, "exam_type").isBlank()) {
                        String typeName = getCell(row, colIndex, "exam_type").trim();
                        examTypeRepository.findAll().stream()
                            .filter(t -> t.getName().equals(typeName))
                            .findFirst()
                            .ifPresent(r::setExamType);
                    }

                    examResultRepository.save(r);
                    successCount++;
                } catch (Exception e) {
                    errors.add("行 " + (rowNum + 1) + ": " + e.getMessage());
                }
            }
        } catch (CsvException e) {
            return Map.of("successCount", 0, "errorCount", 1, "errors", List.of("CSVパースエラー: " + e.getMessage()));
        }

        return Map.of("successCount", successCount, "errorCount", errors.size(), "errors", errors);
    }

    /**
     * CSV Export - export exam results as CSV
     */
    public byte[] exportCsv(Long studentId, Long subjectId) throws IOException {
        List<ExamResult> results = examResultRepository.search(studentId, subjectId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        // BOM for Excel compatibility
        baos.write(0xEF);
        baos.write(0xBB);
        baos.write(0xBF);

        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            writer.writeNext(new String[]{
                "student_id", "student_name", "subject_name", "exam_type",
                "exam_name", "exam_date", "score", "max_score",
                "rank", "total_students", "academic_year", "semester", "grade_at_exam", "memo"
            });

            for (ExamResult r : results) {
                writer.writeNext(new String[]{
                    String.valueOf(r.getStudent().getId()),
                    r.getStudent().getFullName(),
                    r.getSubject().getName(),
                    r.getExamType() != null ? r.getExamType().getName() : "",
                    r.getExamName(),
                    r.getExamDate().toString(),
                    r.getScore().toPlainString(),
                    r.getMaxScore().toPlainString(),
                    r.getRank() != null ? String.valueOf(r.getRank()) : "",
                    r.getTotalStudents() != null ? String.valueOf(r.getTotalStudents()) : "",
                    r.getAcademicYear() != null ? String.valueOf(r.getAcademicYear()) : "",
                    r.getSemester() != null ? String.valueOf(r.getSemester()) : "",
                    r.getGradeAtExam() != null ? r.getGradeAtExam() : "",
                    r.getMemo() != null ? r.getMemo() : ""
                });
            }
        }
        return baos.toByteArray();
    }

    /**
     * Analysis: Get grade trend for a student by subject
     */
    public List<Map<String, Object>> getStudentTrend(Long studentId, Long subjectId) {
        return examResultRepository.findByStudentIdOrderByExamDateAsc(studentId).stream()
            .filter(r -> subjectId == null || r.getSubject().getId().equals(subjectId))
            .map(r -> {
                Map<String, Object> point = new LinkedHashMap<>();
                point.put("examName", r.getExamName());
                point.put("examDate", r.getExamDate().toString());
                point.put("score", r.getScore());
                point.put("maxScore", r.getMaxScore());
                point.put("percentage", r.getMaxScore().compareTo(BigDecimal.ZERO) > 0
                    ? r.getScore().multiply(BigDecimal.valueOf(100)).divide(r.getMaxScore(), 1, java.math.RoundingMode.HALF_UP)
                    : BigDecimal.ZERO);
                point.put("rank", r.getRank());
                point.put("subjectName", r.getSubject().getName());
                point.put("subjectColor", r.getSubject().getColor());
                point.put("semester", r.getSemester());
                point.put("academicYear", r.getAcademicYear());
                return point;
            })
            .toList();
    }

    /**
     * Analysis: School-wide score distribution for an exam
     */
    public Map<String, Object> getSchoolDistribution(String schoolName, String examName) {
        List<ExamResult> results = examResultRepository.findBySchoolAndExam(schoolName, examName);
        if (results.isEmpty()) return Map.of("count", 0, "buckets", List.of());

        double avg = results.stream().mapToDouble(r -> r.getScore().doubleValue()).average().orElse(0);
        double max = results.stream().mapToDouble(r -> r.getScore().doubleValue()).max().orElse(0);
        double min = results.stream().mapToDouble(r -> r.getScore().doubleValue()).min().orElse(0);

        // Build histogram buckets (10-point intervals)
        Map<String, Long> buckets = new LinkedHashMap<>();
        for (int i = 0; i <= 90; i += 10) {
            int lo = i, hi = i + 10;
            long count = results.stream()
                .filter(r -> r.getScore().doubleValue() >= lo && r.getScore().doubleValue() < hi)
                .count();
            buckets.put(lo + "~" + hi, count);
        }

        return Map.of(
            "count", results.size(),
            "average", Math.round(avg * 10.0) / 10.0,
            "max", max,
            "min", min,
            "buckets", buckets
        );
    }

    private String getCell(String[] row, Map<String, Integer> colIndex, String key) {
        Integer idx = colIndex.get(key);
        if (idx == null || idx >= row.length) return "";
        return row[idx] != null ? row[idx] : "";
    }

    private LocalDate parseDate(String s) {
        try { return LocalDate.parse(s, DATE_FMT); } catch (DateTimeParseException e) {}
        try { return LocalDate.parse(s, DATE_FMT2); } catch (DateTimeParseException e) {}
        throw new RuntimeException("日付形式が不正です: " + s + " (yyyy-MM-dd または yyyy/MM/dd)");
    }
}
