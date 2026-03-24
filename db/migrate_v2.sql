-- v2マイグレーション: 機能フラグ・ロール拡張・成績分析・メッセージ機能
-- 実行: docker exec -i juku-management-db-1 psql -U juku_user -d juku < db/migrate_v2.sql

-- =====================================================
-- 1. ロール拡張: staff テーブルにロールを追加
--    既存: ADMIN, STAFF
--    追加: PRINCIPAL（教室長）, TEACHER（講師）, OFFICE_STAFF（事務）
-- =====================================================
-- staffテーブルのroleはVARCHARなのでALTER不要。
-- 既存の 'STAFF' ロールは後方互換のためそのまま残す。

-- =====================================================
-- 2. 生徒・保護者にログイン認証情報を追加（ポータル用）
-- =====================================================
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS username  VARCHAR(50)  UNIQUE,
  ADD COLUMN IF NOT EXISTS password  VARCHAR(255);

ALTER TABLE guardians
  ADD COLUMN IF NOT EXISTS username  VARCHAR(50)  UNIQUE,
  ADD COLUMN IF NOT EXISTS password  VARCHAR(255);

-- =====================================================
-- 3. 機能フラグテーブル
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_flags (
    id           BIGSERIAL     PRIMARY KEY,
    feature_key  VARCHAR(60)   UNIQUE NOT NULL,
    is_enabled   BOOLEAN       NOT NULL DEFAULT FALSE,
    plan_level   VARCHAR(30)   NOT NULL DEFAULT 'BASIC',
    description  VARCHAR(200),
    updated_by   BIGINT        REFERENCES staff(id) ON DELETE SET NULL,
    updated_at   TIMESTAMP     NOT NULL DEFAULT NOW()
);

INSERT INTO feature_flags (feature_key, is_enabled, plan_level, description) VALUES
  ('CUSTOMER_MANAGEMENT',  TRUE,  'BASIC',        '顧客管理（生徒・保護者）'),
  ('SCHEDULE_MANAGEMENT',  TRUE,  'ADVANCED',     'スケジュール・時間割管理'),
  ('GRADE_MANAGEMENT',     TRUE,  'ADVANCED',     '成績管理・分析'),
  ('INVOICE_MANAGEMENT',   TRUE,  'BASIC',        '請求・支払い管理'),
  ('COMMUNICATION',        FALSE, 'ADVANCED',     'メッセージ・連絡機能'),
  ('SALES_MANAGEMENT',     FALSE, 'PROFESSIONAL', '売上管理・レポート'),
  ('ANNOUNCEMENT',         TRUE,  'BASIC',        'お知らせ機能'),
  ('STUDENT_PORTAL',       FALSE, 'ADVANCED',     '生徒ポータル（スマホ対応）'),
  ('GUARDIAN_PORTAL',      FALSE, 'ADVANCED',     '保護者ポータル（スマホ対応）')
ON CONFLICT (feature_key) DO NOTHING;

-- =====================================================
-- 4. 成績分析拡張: exam_results テーブルに学年・学期を追加
-- =====================================================
ALTER TABLE exam_results
  ADD COLUMN IF NOT EXISTS academic_year  INTEGER,
  ADD COLUMN IF NOT EXISTS semester       SMALLINT,   -- 1=1学期, 2=2学期, 3=3学期
  ADD COLUMN IF NOT EXISTS grade_at_exam  VARCHAR(20); -- 受験時の学年（例: 中1, 高2）

CREATE INDEX IF NOT EXISTS idx_exam_results_year ON exam_results(academic_year);

-- =====================================================
-- 5. 志望校・合格実績
-- =====================================================
CREATE TABLE IF NOT EXISTS target_schools (
    id            BIGSERIAL     PRIMARY KEY,
    school_name   VARCHAR(100)  NOT NULL,
    school_type   VARCHAR(30)   NOT NULL DEFAULT 'HIGHSCHOOL', -- ELEMENTARY, JUNIOR, HIGHSCHOOL, UNIVERSITY
    region        VARCHAR(50),
    difficulty    SMALLINT,  -- 1-5
    memo          TEXT,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS acceptance_records (
    id                BIGSERIAL    PRIMARY KEY,
    student_id        BIGINT       REFERENCES students(id) ON DELETE SET NULL,
    target_school_id  BIGINT       NOT NULL REFERENCES target_schools(id) ON DELETE CASCADE,
    academic_year     INTEGER      NOT NULL,
    result            VARCHAR(20)  NOT NULL DEFAULT 'ACCEPTED', -- ACCEPTED, REJECTED
    note              TEXT,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acceptance_school ON acceptance_records(target_school_id);
CREATE INDEX IF NOT EXISTS idx_acceptance_year ON acceptance_records(academic_year);

-- 生徒の志望校（複数可）
CREATE TABLE IF NOT EXISTS student_target_schools (
    id                BIGSERIAL  PRIMARY KEY,
    student_id        BIGINT     NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    target_school_id  BIGINT     NOT NULL REFERENCES target_schools(id) ON DELETE CASCADE,
    priority          SMALLINT   NOT NULL DEFAULT 1, -- 第1志望=1, 第2志望=2...
    created_at        TIMESTAMP  NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, target_school_id)
);

-- =====================================================
-- 6. CSVインポートログ
-- =====================================================
CREATE TABLE IF NOT EXISTS grade_import_logs (
    id             BIGSERIAL     PRIMARY KEY,
    imported_by    BIGINT        REFERENCES staff(id) ON DELETE SET NULL,
    file_name      VARCHAR(200),
    row_count      INTEGER       NOT NULL DEFAULT 0,
    success_count  INTEGER       NOT NULL DEFAULT 0,
    error_count    INTEGER       NOT NULL DEFAULT 0,
    errors_json    TEXT,
    imported_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 7. メッセージ機能
-- =====================================================
CREATE TABLE IF NOT EXISTS message_threads (
    id                      BIGSERIAL     PRIMARY KEY,
    subject                 VARCHAR(200)  NOT NULL,
    category                VARCHAR(30)   NOT NULL DEFAULT 'GENERAL', -- GENERAL, INQUIRY, ABSENCE, BILLING
    status                  VARCHAR(20)   NOT NULL DEFAULT 'OPEN',    -- OPEN, CLOSED
    created_by_staff_id     BIGINT        REFERENCES staff(id) ON DELETE SET NULL,
    created_by_student_id   BIGINT        REFERENCES students(id) ON DELETE SET NULL,
    created_by_guardian_id  BIGINT        REFERENCES guardians(id) ON DELETE SET NULL,
    student_id              BIGINT        REFERENCES students(id) ON DELETE SET NULL,
    created_at              TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threads_student ON message_threads(student_id);
CREATE INDEX IF NOT EXISTS idx_threads_updated ON message_threads(updated_at DESC);

CREATE TABLE IF NOT EXISTS messages (
    id                  BIGSERIAL    PRIMARY KEY,
    thread_id           BIGINT       NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,
    content             TEXT         NOT NULL,
    sender_type         VARCHAR(20)  NOT NULL, -- STAFF, STUDENT, GUARDIAN
    sender_staff_id     BIGINT       REFERENCES staff(id) ON DELETE SET NULL,
    sender_student_id   BIGINT       REFERENCES students(id) ON DELETE SET NULL,
    sender_guardian_id  BIGINT       REFERENCES guardians(id) ON DELETE SET NULL,
    is_read             BOOLEAN      NOT NULL DEFAULT FALSE,
    read_at             TIMESTAMP,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(thread_id, is_read) WHERE is_read = FALSE;

-- =====================================================
-- 8. 売上管理（プロフェッショナルプラン）
-- =====================================================
CREATE TABLE IF NOT EXISTS sales_targets (
    id            BIGSERIAL    PRIMARY KEY,
    target_month  VARCHAR(7)   NOT NULL,  -- 例: 2025-04
    target_amount INTEGER      NOT NULL DEFAULT 0,
    created_by    BIGINT       REFERENCES staff(id) ON DELETE SET NULL,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (target_month)
);

-- =====================================================
-- 9. PRINCIPAL ロールの管理者アカウントを初期データとして追加
--    （既存のadminアカウントをPRINCIPALに更新）
-- =====================================================
UPDATE staff SET role = 'PRINCIPAL' WHERE username = 'admin' AND role = 'ADMIN';
