-- 塾顧客管理システム DB初期化スクリプト
-- 実行: psql -U postgres -d juku -f db/init.sql

-- =====================================================
-- スタッフ（認証ユーザー）
-- =====================================================
CREATE TABLE IF NOT EXISTS staff (
    id            BIGSERIAL     PRIMARY KEY,
    username      VARCHAR(50)   UNIQUE NOT NULL,
    password      VARCHAR(255)  NOT NULL,
    full_name     VARCHAR(100)  NOT NULL,
    role          VARCHAR(20)   NOT NULL DEFAULT 'STAFF',
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 保護者
-- =====================================================
CREATE TABLE IF NOT EXISTS guardians (
    id              BIGSERIAL     PRIMARY KEY,
    full_name       VARCHAR(100)  NOT NULL,
    full_name_kana  VARCHAR(100),
    phone           VARCHAR(20)   NOT NULL,
    phone_sub       VARCHAR(20),
    email           VARCHAR(255),
    address         TEXT,
    memo            TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 生徒
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
    id              BIGSERIAL     PRIMARY KEY,
    full_name       VARCHAR(100)  NOT NULL,
    full_name_kana  VARCHAR(100),
    birth_date      DATE,
    grade           VARCHAR(20)   NOT NULL,
    school_name     VARCHAR(100),
    guardian_id     BIGINT        REFERENCES guardians(id) ON DELETE SET NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'ACTIVE',
    enrolled_at     DATE          NOT NULL DEFAULT CURRENT_DATE,
    left_at         DATE,
    memo            TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_guardian_id ON students(guardian_id);

-- =====================================================
-- 科目
-- =====================================================
CREATE TABLE IF NOT EXISTS subjects (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(50)  UNIQUE NOT NULL,
    color       VARCHAR(7)   DEFAULT '#6366f1',
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- =====================================================
-- コース
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
    id            BIGSERIAL     PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    subject_id    BIGINT        REFERENCES subjects(id) ON DELETE SET NULL,
    grade_target  VARCHAR(50),
    monthly_fee   INTEGER       NOT NULL DEFAULT 0,
    description   TEXT,
    is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 生徒×コース（受講登録）
-- =====================================================
CREATE TABLE IF NOT EXISTS student_courses (
    id          BIGSERIAL  PRIMARY KEY,
    student_id  BIGINT     NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id   BIGINT     NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    started_at  DATE       NOT NULL DEFAULT CURRENT_DATE,
    ended_at    DATE,
    UNIQUE (student_id, course_id, started_at)
);

CREATE INDEX IF NOT EXISTS idx_student_courses_student ON student_courses(student_id);

-- =====================================================
-- 授業コマ（スケジュール）
-- =====================================================
CREATE TABLE IF NOT EXISTS lessons (
    id            BIGSERIAL    PRIMARY KEY,
    course_id     BIGINT       NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id    BIGINT       REFERENCES staff(id) ON DELETE SET NULL,
    classroom     VARCHAR(50),
    scheduled_at  TIMESTAMP    NOT NULL,
    duration_min  INTEGER      NOT NULL DEFAULT 60,
    status        VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED',
    note          TEXT,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_scheduled_at ON lessons(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);

-- =====================================================
-- 出席記録
-- =====================================================
CREATE TABLE IF NOT EXISTS attendances (
    id          BIGSERIAL    PRIMARY KEY,
    lesson_id   BIGINT       NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    student_id  BIGINT       NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    status      VARCHAR(20)  NOT NULL DEFAULT 'PRESENT',
    checked_at  TIMESTAMP,
    note        TEXT,
    UNIQUE (lesson_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_attendances_student ON attendances(student_id);
CREATE INDEX IF NOT EXISTS idx_attendances_lesson ON attendances(lesson_id);

-- =====================================================
-- テスト種別マスタ
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_types (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(50)  UNIQUE NOT NULL,
    sort_order  INTEGER      NOT NULL DEFAULT 0
);

-- =====================================================
-- テスト・成績記録
-- =====================================================
CREATE TABLE IF NOT EXISTS exam_results (
    id              BIGSERIAL      PRIMARY KEY,
    student_id      BIGINT         NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id      BIGINT         NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_type_id    BIGINT         REFERENCES exam_types(id) ON DELETE SET NULL,
    exam_name       VARCHAR(100)   NOT NULL,
    exam_date       DATE           NOT NULL,
    score           NUMERIC(5,1)   NOT NULL,
    max_score       NUMERIC(5,1)   NOT NULL DEFAULT 100,
    rank            INTEGER,
    total_students  INTEGER,
    memo            TEXT,
    created_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_results_student ON exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_date ON exam_results(exam_date);

-- =====================================================
-- 請求書
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
    id             BIGSERIAL    PRIMARY KEY,
    student_id     BIGINT       NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    billing_month  VARCHAR(7)   NOT NULL,
    total_amount   INTEGER      NOT NULL,
    due_date       DATE         NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'UNPAID',
    note           TEXT,
    issued_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, billing_month)
);

CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- =====================================================
-- 請求明細
-- =====================================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id           BIGSERIAL     PRIMARY KEY,
    invoice_id   BIGINT        NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description  VARCHAR(200)  NOT NULL,
    amount       INTEGER       NOT NULL,
    sort_order   INTEGER       NOT NULL DEFAULT 0
);

-- =====================================================
-- 支払い記録
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
    id           BIGSERIAL    PRIMARY KEY,
    invoice_id   BIGINT       NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    paid_amount  INTEGER      NOT NULL,
    paid_at      DATE         NOT NULL,
    method       VARCHAR(30)  NOT NULL DEFAULT 'BANK_TRANSFER',
    note         TEXT,
    recorded_by  BIGINT       REFERENCES staff(id) ON DELETE SET NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- =====================================================
-- お知らせ
-- =====================================================
CREATE TABLE IF NOT EXISTS announcements (
    id            BIGSERIAL     PRIMARY KEY,
    title         VARCHAR(200)  NOT NULL,
    content       TEXT          NOT NULL,
    target        VARCHAR(20)   NOT NULL DEFAULT 'ALL',
    target_value  VARCHAR(50),
    is_published  BOOLEAN       NOT NULL DEFAULT FALSE,
    published_at  TIMESTAMP,
    expires_at    TIMESTAMP,
    created_by    BIGINT        REFERENCES staff(id) ON DELETE SET NULL,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 初期データ（管理者アカウント: admin / admin123）
-- =====================================================
INSERT INTO staff (username, password, full_name, role)
VALUES ('admin', '$2a$10$qVBpxyFG8S0b9hHNZaB6vuNqR/En/SIYE2XX4QIc.IbRf1ZuT8os6', '管理者', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- 科目初期データ
INSERT INTO subjects (name, color, sort_order) VALUES
  ('英語', '#3b82f6', 1),
  ('数学', '#ef4444', 2),
  ('国語', '#22c55e', 3),
  ('理科', '#f59e0b', 4),
  ('社会', '#8b5cf6', 5)
ON CONFLICT (name) DO NOTHING;

-- テスト種別初期データ
INSERT INTO exam_types (name, sort_order) VALUES
  ('定期テスト', 1),
  ('模擬試験', 2),
  ('実力テスト', 3),
  ('小テスト', 4)
ON CONFLICT (name) DO NOTHING;
