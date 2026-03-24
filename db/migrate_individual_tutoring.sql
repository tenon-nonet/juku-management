-- 個別指導塾対応マイグレーション
-- 実行: docker exec -i juku-management-db-1 psql -U juku_user -d juku < db/migrate_individual_tutoring.sql

-- 担当講師を生徒に紐付け
ALTER TABLE students ADD COLUMN IF NOT EXISTS primary_teacher_id BIGINT REFERENCES staff(id) ON DELETE SET NULL;

-- 授業に生徒を直接紐付け（個別指導の1対1対応）
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS student_id BIGINT REFERENCES students(id) ON DELETE SET NULL;

-- 講師の担当科目
CREATE TABLE IF NOT EXISTS staff_subjects (
    staff_id   BIGINT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    subject_id BIGINT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_id, subject_id)
);

-- 講師メモ
ALTER TABLE staff ADD COLUMN IF NOT EXISTS memo TEXT;

CREATE INDEX IF NOT EXISTS idx_students_primary_teacher ON students(primary_teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_id ON lessons(student_id);
