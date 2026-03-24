-- 文字コードエラーで失敗した箇所のパッチ

-- 1. exam_results カラム追加（migrate_v2.sql line 51-56 が失敗した場合）
ALTER TABLE exam_results
  ADD COLUMN IF NOT EXISTS academic_year  INTEGER,
  ADD COLUMN IF NOT EXISTS semester       SMALLINT,
  ADD COLUMN IF NOT EXISTS grade_at_exam  VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_exam_results_year ON exam_results(academic_year);

-- 2. 管理者アカウント（admin / admin123）
INSERT INTO staff (username, password, full_name, role)
VALUES ('admin', '$2a$10$qVBpxyFG8S0b9hHNZaB6vuNqR/En/SIYE2XX4QIc.IbRf1ZuT8os6', 'kanrisha', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- 3. 科目初期データ
INSERT INTO subjects (name, color, sort_order) VALUES
  ('eigo',   '#3b82f6', 1),
  ('sugaku', '#ef4444', 2),
  ('kokugo', '#22c55e', 3),
  ('rika',   '#f59e0b', 4),
  ('shakai', '#8b5cf6', 5)
ON CONFLICT (name) DO NOTHING;

-- 4. テスト種別初期データ
INSERT INTO exam_types (name, sort_order) VALUES
  ('teiki',   1),
  ('mogi',    2),
  ('jitsuryoku', 3),
  ('sho',     4)
ON CONFLICT (name) DO NOTHING;

-- 5. 機能フラグ初期データ
INSERT INTO feature_flags (feature_key, enabled, plan_level, description) VALUES
  ('GRADE_MANAGEMENT',     TRUE,  'ADVANCED',     'grade management'),
  ('INVOICE_MANAGEMENT',   TRUE,  'BASIC',        'invoice management'),
  ('COMMUNICATION',        FALSE, 'ADVANCED',     'messaging'),
  ('SALES_MANAGEMENT',     FALSE, 'PROFESSIONAL', 'sales management'),
  ('ANNOUNCEMENT',         TRUE,  'BASIC',        'announcements'),
  ('STUDENT_PORTAL',       FALSE, 'ADVANCED',     'student portal'),
  ('GUARDIAN_PORTAL',      FALSE, 'ADVANCED',     'guardian portal')
ON CONFLICT (feature_key) DO NOTHING;
