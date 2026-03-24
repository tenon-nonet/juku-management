-- v3マイグレーション: 体験生管理・特別授業パック・給与計算・面談記録・欠席連絡・売上管理強化

-- =====================================================
-- 1. 体験生・見込み客管理 (prospects)
-- =====================================================
CREATE TABLE IF NOT EXISTS prospects (
    id                  BIGSERIAL       PRIMARY KEY,
    full_name           VARCHAR(50)     NOT NULL,
    full_name_kana      VARCHAR(50),
    phone               VARCHAR(20),
    email               VARCHAR(100),
    grade               VARCHAR(20),
    school_name         VARCHAR(100),
    inquiry_date        DATE            NOT NULL DEFAULT CURRENT_DATE,
    trial_date          DATE,
    status              VARCHAR(20)     NOT NULL DEFAULT 'INQUIRY',
    -- INQUIRY(問い合わせ), TRIAL_SCHEDULED(体験予約), TRIAL_DONE(体験済),
    -- ENROLLED(入塾), DROPPED(見送り)
    interest_courses    TEXT,           -- 興味コース（自由記述）
    referral_source     VARCHAR(50),    -- 流入経路: WEB, SNS, FLYER, REFERRAL, WALK_IN, OTHER
    memo                TEXT,
    assigned_staff_id   BIGINT          REFERENCES staff(id) ON DELETE SET NULL,
    enrolled_student_id BIGINT          REFERENCES students(id) ON DELETE SET NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_prospects_status       ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_inquiry_date ON prospects(inquiry_date);

-- =====================================================
-- 2. 特別授業パック (lesson_packs) - 夏期講習等コマ制
-- =====================================================
CREATE TABLE IF NOT EXISTS lesson_packs (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    pack_type       VARCHAR(20)     NOT NULL DEFAULT 'SPECIAL',
    -- REGULAR, SUMMER, WINTER, SPRING, CUSTOM
    total_sessions  INT             NOT NULL,
    price           INT             NOT NULL,
    subject_id      BIGINT          REFERENCES subjects(id) ON DELETE SET NULL,
    valid_from      DATE,
    valid_to        DATE,
    description     TEXT,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_lesson_packs (
    id              BIGSERIAL       PRIMARY KEY,
    student_id      BIGINT          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    pack_id         BIGINT          NOT NULL REFERENCES lesson_packs(id),
    purchased_at    DATE            NOT NULL DEFAULT CURRENT_DATE,
    total_sessions  INT             NOT NULL,
    used_sessions   INT             NOT NULL DEFAULT 0,
    invoice_id      BIGINT          REFERENCES invoices(id) ON DELETE SET NULL,
    memo            TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_student_packs_student ON student_lesson_packs(student_id);

-- lessonsにパック紐付けカラム追加
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS lesson_type VARCHAR(20) NOT NULL DEFAULT 'REGULAR';
-- REGULAR(通常), PACK(パック授業), TRIAL(体験)
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS student_pack_id BIGINT REFERENCES student_lesson_packs(id) ON DELETE SET NULL;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS prospect_id     BIGINT REFERENCES prospects(id) ON DELETE SET NULL;

-- =====================================================
-- 3. 講師給与管理
-- =====================================================
CREATE TABLE IF NOT EXISTS salary_rules (
    id                  BIGSERIAL   PRIMARY KEY,
    staff_id            BIGINT      NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    lesson_type         VARCHAR(20) NOT NULL DEFAULT 'REGULAR',
    amount_per_lesson   INT         NOT NULL DEFAULT 0,
    effective_from      DATE        NOT NULL,
    effective_to        DATE,
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE(staff_id, lesson_type, effective_from)
);

CREATE TABLE IF NOT EXISTS salary_records (
    id              BIGSERIAL   PRIMARY KEY,
    staff_id        BIGINT      NOT NULL REFERENCES staff(id),
    salary_month    VARCHAR(7)  NOT NULL,  -- YYYY-MM
    lesson_count    INT         NOT NULL DEFAULT 0,
    base_amount     INT         NOT NULL DEFAULT 0,
    adjustment      INT         NOT NULL DEFAULT 0,  -- 手当・控除
    total_amount    INT         NOT NULL DEFAULT 0,
    note            TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT', -- DRAFT, CONFIRMED, PAID
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE(staff_id, salary_month)
);
CREATE INDEX IF NOT EXISTS idx_salary_records_month ON salary_records(salary_month);

-- =====================================================
-- 4. 保護者面談記録
-- =====================================================
CREATE TABLE IF NOT EXISTS consultation_records (
    id                  BIGSERIAL   PRIMARY KEY,
    student_id          BIGINT      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    consultation_date   DATE        NOT NULL,
    attendees           TEXT,
    content             TEXT,
    action_items        TEXT,       -- 宿題・対応事項
    next_date           DATE,
    staff_id            BIGINT      REFERENCES staff(id) ON DELETE SET NULL,
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_consultations_student ON consultation_records(student_id);

-- =====================================================
-- 5. 欠席連絡・補講管理
-- =====================================================
CREATE TABLE IF NOT EXISTS absence_requests (
    id                  BIGSERIAL   PRIMARY KEY,
    student_id          BIGINT      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    lesson_id           BIGINT      REFERENCES lessons(id) ON DELETE SET NULL,
    absence_date        DATE        NOT NULL,
    reason              TEXT,
    wants_makeup        BOOLEAN     NOT NULL DEFAULT FALSE,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    -- PENDING, CONFIRMED, MAKEUP_SCHEDULED, COMPLETED
    makeup_lesson_id    BIGINT      REFERENCES lessons(id) ON DELETE SET NULL,
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_absence_student ON absence_requests(student_id);

-- =====================================================
-- 6. 売上目標の強化 (sales_targets拡張)
-- =====================================================
ALTER TABLE sales_targets ADD COLUMN IF NOT EXISTS course_breakdown JSONB;
-- {"中学数学コース": 300000, "高校英語コース": 180000, ...}

-- 月次売上サマリービュー
CREATE OR REPLACE VIEW monthly_revenue_view AS
SELECT
    billing_month,
    COUNT(*)                                        AS invoice_count,
    SUM(total_amount)                               AS billed_amount,
    SUM(CASE WHEN status='PAID' THEN total_amount ELSE 0 END) AS collected_amount,
    SUM(CASE WHEN status IN ('UNPAID','OVERDUE') THEN total_amount ELSE 0 END) AS uncollected_amount
FROM invoices
GROUP BY billing_month
ORDER BY billing_month DESC;

-- 在籍推移ビュー（月次）
CREATE OR REPLACE VIEW enrollment_trend_view AS
WITH months AS (
    SELECT TO_CHAR(d, 'YYYY-MM') AS month
    FROM generate_series(
        DATE_TRUNC('month', NOW() - INTERVAL '12 months'),
        DATE_TRUNC('month', NOW()),
        '1 month'::INTERVAL
    ) AS d
)
SELECT
    m.month,
    COUNT(s.id) FILTER (WHERE s.status = 'ACTIVE'
        AND TO_CHAR(s.enrolled_at, 'YYYY-MM') <= m.month
        AND (s.left_at IS NULL OR TO_CHAR(s.left_at, 'YYYY-MM') >= m.month)
    ) AS active_count,
    COUNT(s.id) FILTER (WHERE TO_CHAR(s.enrolled_at, 'YYYY-MM') = m.month) AS new_count,
    COUNT(s.id) FILTER (WHERE TO_CHAR(s.left_at, 'YYYY-MM') = m.month) AS left_count
FROM months m
CROSS JOIN students s
GROUP BY m.month
ORDER BY m.month;
