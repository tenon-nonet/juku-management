-- =====================================================
-- テストデータ投入スクリプト
-- 実行: psql -U juku_user -d juku -f db/testdata.sql
-- ※ 既存データをクリアして再投入します
-- =====================================================

-- クリア（staff の admin は保持）
TRUNCATE TABLE payments, invoice_items, invoices, attendances,
               exam_results, student_courses, lessons,
               announcements, students, guardians, courses
RESTART IDENTITY CASCADE;

DELETE FROM staff WHERE username != 'admin';

-- =====================================================
-- スタッフ（teacher123）
-- =====================================================
INSERT INTO staff (username, password, full_name, role) VALUES
  ('yamamoto', '$2b$10$XjvyBC951x1hgVlm8HSeKO4AdfEcVm9qTij1w1OrJW6bENMl/hIta', '山本 健太', 'STAFF'),
  ('tanaka_t',  '$2b$10$XjvyBC951x1hgVlm8HSeKO4AdfEcVm9qTij1w1OrJW6bENMl/hIta', '田中 由美', 'STAFF');

-- =====================================================
-- コース（subjects は init.sql で投入済み）
-- =====================================================
INSERT INTO courses (name, subject_id, grade_target, monthly_fee, description, is_active) VALUES
  ('中学数学コース',   (SELECT id FROM subjects WHERE name='数学'), '中学生全般', 15000, '中学数学の基礎から応用まで。定期テスト対策も実施。', TRUE),
  ('高校数学コース',   (SELECT id FROM subjects WHERE name='数学'), '高校生全般', 18000, '数学ⅠA・ⅡB・ⅢCに対応。大学入試を見据えた指導。', TRUE),
  ('中学英語コース',   (SELECT id FROM subjects WHERE name='英語'), '中学生全般', 15000, '英文法・読解・リスニングを総合的にカバー。', TRUE),
  ('高校英語コース',   (SELECT id FROM subjects WHERE name='英語'), '高校生全般', 18000, '長文読解・英作文・共通テスト対策。', TRUE),
  ('国語・読解コース', (SELECT id FROM subjects WHERE name='国語'), '中学生全般', 12000, '読解力・記述力を養成。国語全般に対応。', TRUE),
  ('理科基礎コース',   (SELECT id FROM subjects WHERE name='理科'), '中学生全般', 13000, '中学理科（物理・化学・生物・地学）。', FALSE);

-- =====================================================
-- 保護者
-- =====================================================
INSERT INTO guardians (full_name, full_name_kana, phone, phone_sub, email, address, memo) VALUES
  ('田中 幸子', 'タナカ サチコ', '090-1111-2222', '03-1234-5678', 'sachiko.tanaka@example.com',
   '東京都新宿区西新宿1-1-1', '送迎は父親が担当。連絡は母親携帯に。'),
  ('佐藤 明',   'サトウ アキラ', '080-2222-3333', NULL, 'akira.sato@example.com',
   '東京都渋谷区代々木2-2-2', NULL),
  ('鈴木 恵美', 'スズキ エミ',   '070-3333-4444', '03-5678-9012', 'emi.suzuki@example.com',
   '東京都世田谷区三軒茶屋3-3-3', '下の子も入塾検討中。'),
  ('山田 正夫', 'ヤマダ マサオ', '090-4444-5555', NULL, NULL,
   '東京都杉並区荻窪4-4-4', '転塾のため2月末で退塾済み。');

-- =====================================================
-- 生徒
-- =====================================================
INSERT INTO students (full_name, full_name_kana, birth_date, grade, school_name, guardian_id, status, enrolled_at, left_at, memo) VALUES
  -- 田中家：2人
  ('田中 太郎', 'タナカ タロウ', '2010-05-15', '中3',
   '新宿中学校', (SELECT id FROM guardians WHERE full_name='田中 幸子'),
   'ACTIVE', '2024-04-01', NULL, '志望校：新宿高校。数学が得意、英語が苦手。'),
  ('田中 花子', 'タナカ ハナコ', '2013-08-20', '中1',
   '新宿中学校', (SELECT id FROM guardians WHERE full_name='田中 幸子'),
   'ACTIVE', '2025-04-01', NULL, NULL),
  -- 佐藤家：1人
  ('佐藤 次郎', 'サトウ ジロウ', '2008-11-03', '高2',
   '渋谷高校', (SELECT id FROM guardians WHERE full_name='佐藤 明'),
   'ACTIVE', '2024-04-01', NULL, '志望校：早稲田大学。英語は得意。'),
  -- 鈴木家：2人
  ('鈴木 三郎', 'スズキ サブロウ', '2011-02-28', '中2',
   '世田谷中学校', (SELECT id FROM guardians WHERE full_name='鈴木 恵美'),
   'ACTIVE', '2024-09-01', NULL, NULL),
  ('鈴木 四郎', 'スズキ シロウ', '2015-07-10', '小6',
   '世田谷小学校', (SELECT id FROM guardians WHERE full_name='鈴木 恵美'),
   'SUSPENDED', '2025-04-01', NULL, '2026年1月より病気療養のため休塾中。'),
  -- 山田：退塾済み
  ('山田 五郎', 'ヤマダ ゴロウ', '2007-03-12', '高3',
   '杉並高校', (SELECT id FROM guardians WHERE full_name='山田 正夫'),
   'INACTIVE', '2023-04-01', '2026-02-28', '大学受験のため2月末で退塾。志望校合格。');

-- =====================================================
-- 受講登録
-- =====================================================
INSERT INTO student_courses (student_id, course_id, started_at) VALUES
  -- 田中太郎：中学数学 + 中学英語
  ((SELECT id FROM students WHERE full_name='田中 太郎'), (SELECT id FROM courses WHERE name='中学数学コース'), '2024-04-01'),
  ((SELECT id FROM students WHERE full_name='田中 太郎'), (SELECT id FROM courses WHERE name='中学英語コース'), '2024-04-01'),
  -- 田中花子：中学英語 + 国語
  ((SELECT id FROM students WHERE full_name='田中 花子'), (SELECT id FROM courses WHERE name='中学英語コース'), '2025-04-01'),
  ((SELECT id FROM students WHERE full_name='田中 花子'), (SELECT id FROM courses WHERE name='国語・読解コース'), '2025-04-01'),
  -- 佐藤次郎：高校数学 + 高校英語
  ((SELECT id FROM students WHERE full_name='佐藤 次郎'), (SELECT id FROM courses WHERE name='高校数学コース'), '2024-04-01'),
  ((SELECT id FROM students WHERE full_name='佐藤 次郎'), (SELECT id FROM courses WHERE name='高校英語コース'), '2024-04-01'),
  -- 鈴木三郎：中学数学
  ((SELECT id FROM students WHERE full_name='鈴木 三郎'), (SELECT id FROM courses WHERE name='中学数学コース'), '2024-09-01'),
  -- 鈴木四郎：国語（休塾中）
  ((SELECT id FROM students WHERE full_name='鈴木 四郎'), (SELECT id FROM courses WHERE name='国語・読解コース'), '2025-04-01'),
  -- 山田五郎：退塾（ended_at あり）
  ((SELECT id FROM students WHERE full_name='山田 五郎'), (SELECT id FROM courses WHERE name='高校数学コース'), '2023-04-01');

UPDATE student_courses SET ended_at = '2026-02-28'
  WHERE student_id = (SELECT id FROM students WHERE full_name='山田 五郎');

-- =====================================================
-- 授業コマ
-- =====================================================
-- 2月（先月）の授業 → DONE
INSERT INTO lessons (course_id, teacher_id, classroom, scheduled_at, duration_min, status, note) VALUES
  ((SELECT id FROM courses WHERE name='中学数学コース'),
   (SELECT id FROM staff WHERE username='yamamoto'),
   'A教室', '2026-02-04 17:00:00', 90, 'DONE', '二次方程式の解法'),
  ((SELECT id FROM courses WHERE name='中学数学コース'),
   (SELECT id FROM staff WHERE username='yamamoto'),
   'A教室', '2026-02-11 17:00:00', 90, 'DONE', '二次関数の基礎'),
  ((SELECT id FROM courses WHERE name='中学数学コース'),
   (SELECT id FROM staff WHERE username='yamamoto'),
   'A教室', '2026-02-18 17:00:00', 90, 'DONE', '図形と相似'),
  ((SELECT id FROM courses WHERE name='中学英語コース'),
   (SELECT id FROM staff WHERE username='tanaka_t'),
   'B教室', '2026-02-05 16:00:00', 90, 'DONE', '関係代名詞'),
  ((SELECT id FROM courses WHERE name='中学英語コース'),
   (SELECT id FROM staff WHERE username='tanaka_t'),
   'B教室', '2026-02-12 16:00:00', 90, 'DONE', '受動態'),
  ((SELECT id FROM courses WHERE name='高校数学コース'),
   (SELECT id FROM staff WHERE username='yamamoto'),
   'A教室', '2026-02-06 19:00:00', 90, 'DONE', '数列（等差・等比）'),
  ((SELECT id FROM courses WHERE name='高校英語コース'),
   (SELECT id FROM staff WHERE username='tanaka_t'),
   'B教室', '2026-02-06 18:00:00', 90, 'DONE', '長文読解①'),
  -- 3月（今月）の授業 → 完了済み
  ((SELECT id FROM courses WHERE name='中学数学コース'),
   (SELECT id FROM staff WHERE username='yamamoto'),
   'A教室', '2026-03-04 17:00:00', 90, 'DONE', '確率の基礎'),
  ((SELECT id FROM courses WHERE name='中学数学コース'),
   (SELECT id FROM staff WHERE username='yamamoto'),
   'A教室', '2026-03-11 17:00:00', 90, 'DONE', '統計データの活用'),
  ((SELECT id FROM courses WHERE name='中学英語コース'),
   (SELECT id FROM staff WHERE username='tanaka_t'),
   'B教室', '2026-03-05 16:00:00', 90, 'DONE', '仮定法'),
  ((SELECT id FROM courses WHERE name='高校英語コース'),
   (SELECT id FROM staff WHERE username='tanaka_t'),
   'B教室', '2026-03-06 18:00:00', 90, 'DONE', '長文読解②'),
  -- 今日の授業（ダッシュボードに表示）
  ((SELECT id FROM courses WHERE name='中学数学コース'),
   (SELECT id FROM staff WHERE username='yamamoto'),
   'A教室', '2026-03-21 17:00:00', 90, 'SCHEDULED', '入試対策：総まとめ'),
  ((SELECT id FROM courses WHERE name='中学英語コース'),
   (SELECT id FROM staff WHERE username='tanaka_t'),
   'B教室', '2026-03-21 16:00:00', 90, 'SCHEDULED', '入試対策：英作文'),
  ((SELECT id FROM courses WHERE name='高校数学コース'),
   (SELECT id FROM staff WHERE username='yamamoto'),
   'A教室', '2026-03-21 19:00:00', 90, 'SCHEDULED', '微分・積分 応用'),
  -- 今後の授業
  ((SELECT id FROM courses WHERE name='中学数学コース'),
   (SELECT id FROM staff WHERE username='yamamoto'),
   'A教室', '2026-03-25 17:00:00', 90, 'SCHEDULED', NULL),
  ((SELECT id FROM courses WHERE name='中学英語コース'),
   (SELECT id FROM staff WHERE username='tanaka_t'),
   'B教室', '2026-03-26 16:00:00', 90, 'SCHEDULED', NULL),
  ((SELECT id FROM courses WHERE name='高校英語コース'),
   (SELECT id FROM staff WHERE username='tanaka_t'),
   'B教室', '2026-03-27 18:00:00', 90, 'SCHEDULED', NULL);

-- =====================================================
-- 出席記録（DONE の授業のみ）
-- =====================================================
-- 2026-02-04 中学数学
INSERT INTO attendances (lesson_id, student_id, status, checked_at) VALUES
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-04 17:00:00'),
   (SELECT id FROM students WHERE full_name='田中 太郎'), 'PRESENT', '2026-02-04 17:05:00'),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-04 17:00:00'),
   (SELECT id FROM students WHERE full_name='鈴木 三郎'), 'ABSENT',  NULL);

-- 2026-02-11 中学数学
INSERT INTO attendances (lesson_id, student_id, status, checked_at) VALUES
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-11 17:00:00'),
   (SELECT id FROM students WHERE full_name='田中 太郎'), 'PRESENT', '2026-02-11 17:03:00'),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-11 17:00:00'),
   (SELECT id FROM students WHERE full_name='鈴木 三郎'), 'LATE',    '2026-02-11 17:22:00');

-- 2026-02-18 中学数学
INSERT INTO attendances (lesson_id, student_id, status, checked_at) VALUES
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-18 17:00:00'),
   (SELECT id FROM students WHERE full_name='田中 太郎'), 'PRESENT', '2026-02-18 17:01:00'),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-18 17:00:00'),
   (SELECT id FROM students WHERE full_name='鈴木 三郎'), 'PRESENT', '2026-02-18 16:58:00');

-- 2026-02-05 中学英語
INSERT INTO attendances (lesson_id, student_id, status, checked_at) VALUES
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-05 16:00:00'),
   (SELECT id FROM students WHERE full_name='田中 太郎'), 'PRESENT', '2026-02-05 16:00:00'),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-05 16:00:00'),
   (SELECT id FROM students WHERE full_name='田中 花子'), 'PRESENT', '2026-02-05 15:58:00');

-- 2026-02-12 中学英語
INSERT INTO attendances (lesson_id, student_id, status, checked_at) VALUES
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-12 16:00:00'),
   (SELECT id FROM students WHERE full_name='田中 太郎'), 'EXCUSED', NULL),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-12 16:00:00'),
   (SELECT id FROM students WHERE full_name='田中 花子'), 'PRESENT', '2026-02-12 16:02:00');

-- 2026-02-06 高校数学
INSERT INTO attendances (lesson_id, student_id, status, checked_at) VALUES
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-06 19:00:00'),
   (SELECT id FROM students WHERE full_name='佐藤 次郎'), 'PRESENT', '2026-02-06 18:59:00');

-- 2026-02-06 高校英語
INSERT INTO attendances (lesson_id, student_id, status, checked_at) VALUES
  ((SELECT id FROM lessons WHERE scheduled_at='2026-02-06 18:00:00'),
   (SELECT id FROM students WHERE full_name='佐藤 次郎'), 'PRESENT', '2026-02-06 18:00:00');

-- 3月の完了済み授業
INSERT INTO attendances (lesson_id, student_id, status, checked_at) VALUES
  ((SELECT id FROM lessons WHERE scheduled_at='2026-03-04 17:00:00'),
   (SELECT id FROM students WHERE full_name='田中 太郎'), 'PRESENT', '2026-03-04 17:02:00'),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-03-04 17:00:00'),
   (SELECT id FROM students WHERE full_name='鈴木 三郎'), 'PRESENT', '2026-03-04 17:00:00'),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-03-11 17:00:00'),
   (SELECT id FROM students WHERE full_name='田中 太郎'), 'PRESENT', '2026-03-11 17:05:00'),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-03-11 17:00:00'),
   (SELECT id FROM students WHERE full_name='鈴木 三郎'), 'ABSENT',  NULL),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-03-05 16:00:00'),
   (SELECT id FROM students WHERE full_name='田中 太郎'), 'PRESENT', '2026-03-05 16:01:00'),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-03-05 16:00:00'),
   (SELECT id FROM students WHERE full_name='田中 花子'), 'LATE',    '2026-03-05 16:18:00'),
  ((SELECT id FROM lessons WHERE scheduled_at='2026-03-06 18:00:00'),
   (SELECT id FROM students WHERE full_name='佐藤 次郎'), 'PRESENT', '2026-03-06 17:58:00');

-- =====================================================
-- 成績記録
-- =====================================================
INSERT INTO exam_results (student_id, subject_id, exam_type_id, exam_name, exam_date, score, max_score, rank, total_students, memo) VALUES
  -- 田中太郎
  ((SELECT id FROM students WHERE full_name='田中 太郎'),
   (SELECT id FROM subjects WHERE name='数学'),
   (SELECT id FROM exam_types WHERE name='定期テスト'),
   '2025年度 2学期中間テスト', '2025-10-15', 88, 100, 5, 120, '得点アップ！'),
  ((SELECT id FROM students WHERE full_name='田中 太郎'),
   (SELECT id FROM subjects WHERE name='英語'),
   (SELECT id FROM exam_types WHERE name='定期テスト'),
   '2025年度 2学期中間テスト', '2025-10-15', 62, 100, 68, 120, '要強化'),
  ((SELECT id FROM students WHERE full_name='田中 太郎'),
   (SELECT id FROM subjects WHERE name='数学'),
   (SELECT id FROM exam_types WHERE name='定期テスト'),
   '2025年度 2学期期末テスト', '2025-12-10', 91, 100, 3, 120, NULL),
  ((SELECT id FROM students WHERE full_name='田中 太郎'),
   (SELECT id FROM subjects WHERE name='英語'),
   (SELECT id FROM exam_types WHERE name='定期テスト'),
   '2025年度 2学期期末テスト', '2025-12-10', 70, 100, 45, 120, '改善傾向'),
  ((SELECT id FROM students WHERE full_name='田中 太郎'),
   (SELECT id FROM subjects WHERE name='数学'),
   (SELECT id FROM exam_types WHERE name='模擬試験'),
   '2026年1月 公開模試', '2026-01-18', 78, 100, NULL, NULL, NULL),
  -- 佐藤次郎
  ((SELECT id FROM students WHERE full_name='佐藤 次郎'),
   (SELECT id FROM subjects WHERE name='数学'),
   (SELECT id FROM exam_types WHERE name='定期テスト'),
   '2025年度 2学期中間テスト', '2025-10-16', 75, 100, 22, 200, NULL),
  ((SELECT id FROM students WHERE full_name='佐藤 次郎'),
   (SELECT id FROM subjects WHERE name='英語'),
   (SELECT id FROM exam_types WHERE name='定期テスト'),
   '2025年度 2学期中間テスト', '2025-10-16', 92, 100, 4, 200, '英語は安定して高得点'),
  ((SELECT id FROM students WHERE full_name='佐藤 次郎'),
   (SELECT id FROM subjects WHERE name='英語'),
   (SELECT id FROM exam_types WHERE name='模擬試験'),
   '2026年1月 全統模試', '2026-01-19', 85, 100, NULL, NULL, NULL),
  -- 鈴木三郎
  ((SELECT id FROM students WHERE full_name='鈴木 三郎'),
   (SELECT id FROM subjects WHERE name='数学'),
   (SELECT id FROM exam_types WHERE name='定期テスト'),
   '2025年度 2学期期末テスト', '2025-12-11', 55, 100, 95, 150, '基礎からやり直し中'),
  ((SELECT id FROM students WHERE full_name='鈴木 三郎'),
   (SELECT id FROM subjects WHERE name='数学'),
   (SELECT id FROM exam_types WHERE name='定期テスト'),
   '2025年度 3学期中間テスト', '2026-02-12', 68, 100, 62, 150, '着実に上昇中');

-- =====================================================
-- 請求書・明細（2月分：入金済み、3月分：未入金）
-- =====================================================

-- 田中太郎 2月分（PAID）
INSERT INTO invoices (student_id, billing_month, total_amount, due_date, status, note)
VALUES ((SELECT id FROM students WHERE full_name='田中 太郎'), '2026-02', 30000, '2026-02-28', 'PAID', NULL);

INSERT INTO invoice_items (invoice_id, description, amount, sort_order) VALUES
  (currval('invoices_id_seq'), '中学数学コース受講料', 15000, 1),
  (currval('invoices_id_seq'), '中学英語コース受講料', 15000, 2);

INSERT INTO payments (invoice_id, paid_amount, paid_at, method, note, recorded_by) VALUES
  (currval('invoices_id_seq'), 30000, '2026-02-20', 'BANK_TRANSFER', NULL,
   (SELECT id FROM staff WHERE username='admin'));

-- 田中花子 2月分（PAID）
INSERT INTO invoices (student_id, billing_month, total_amount, due_date, status, note)
VALUES ((SELECT id FROM students WHERE full_name='田中 花子'), '2026-02', 27000, '2026-02-28', 'PAID', NULL);

INSERT INTO invoice_items (invoice_id, description, amount, sort_order) VALUES
  (currval('invoices_id_seq'), '中学英語コース受講料', 15000, 1),
  (currval('invoices_id_seq'), '国語・読解コース受講料', 12000, 2);

INSERT INTO payments (invoice_id, paid_amount, paid_at, method, note, recorded_by) VALUES
  (currval('invoices_id_seq'), 27000, '2026-02-22', 'BANK_TRANSFER', NULL,
   (SELECT id FROM staff WHERE username='admin'));

-- 佐藤次郎 2月分（PAID）
INSERT INTO invoices (student_id, billing_month, total_amount, due_date, status, note)
VALUES ((SELECT id FROM students WHERE full_name='佐藤 次郎'), '2026-02', 36000, '2026-02-28', 'PAID', NULL);

INSERT INTO invoice_items (invoice_id, description, amount, sort_order) VALUES
  (currval('invoices_id_seq'), '高校数学コース受講料', 18000, 1),
  (currval('invoices_id_seq'), '高校英語コース受講料', 18000, 2);

INSERT INTO payments (invoice_id, paid_amount, paid_at, method, note, recorded_by) VALUES
  (currval('invoices_id_seq'), 36000, '2026-02-18', 'CASH', '窓口現金払い',
   (SELECT id FROM staff WHERE username='yamamoto'));

-- 鈴木三郎 2月分（PAID）
INSERT INTO invoices (student_id, billing_month, total_amount, due_date, status, note)
VALUES ((SELECT id FROM students WHERE full_name='鈴木 三郎'), '2026-02', 15000, '2026-02-28', 'PAID', NULL);

INSERT INTO invoice_items (invoice_id, description, amount, sort_order) VALUES
  (currval('invoices_id_seq'), '中学数学コース受講料', 15000, 1);

INSERT INTO payments (invoice_id, paid_amount, paid_at, method, note, recorded_by) VALUES
  (currval('invoices_id_seq'), 15000, '2026-02-25', 'BANK_TRANSFER', NULL,
   (SELECT id FROM staff WHERE username='admin'));

-- 田中太郎 3月分（UNPAID）
INSERT INTO invoices (student_id, billing_month, total_amount, due_date, status, note)
VALUES ((SELECT id FROM students WHERE full_name='田中 太郎'), '2026-03', 30000, '2026-03-31', 'UNPAID', NULL);

INSERT INTO invoice_items (invoice_id, description, amount, sort_order) VALUES
  (currval('invoices_id_seq'), '中学数学コース受講料', 15000, 1),
  (currval('invoices_id_seq'), '中学英語コース受講料', 15000, 2);

-- 田中花子 3月分（UNPAID）
INSERT INTO invoices (student_id, billing_month, total_amount, due_date, status, note)
VALUES ((SELECT id FROM students WHERE full_name='田中 花子'), '2026-03', 27000, '2026-03-31', 'UNPAID', NULL);

INSERT INTO invoice_items (invoice_id, description, amount, sort_order) VALUES
  (currval('invoices_id_seq'), '中学英語コース受講料', 15000, 1),
  (currval('invoices_id_seq'), '国語・読解コース受講料', 12000, 2);

-- 佐藤次郎 3月分（UNPAID）
INSERT INTO invoices (student_id, billing_month, total_amount, due_date, status, note)
VALUES ((SELECT id FROM students WHERE full_name='佐藤 次郎'), '2026-03', 36000, '2026-03-31', 'UNPAID', NULL);

INSERT INTO invoice_items (invoice_id, description, amount, sort_order) VALUES
  (currval('invoices_id_seq'), '高校数学コース受講料', 18000, 1),
  (currval('invoices_id_seq'), '高校英語コース受講料', 18000, 2);

-- 鈴木三郎 3月分（OVERDUE：2月末期限切れを想定）
INSERT INTO invoices (student_id, billing_month, total_amount, due_date, status, note)
VALUES ((SELECT id FROM students WHERE full_name='鈴木 三郎'), '2026-03', 15000, '2026-03-10', 'OVERDUE', '入金期限超過。保護者へ連絡済み。');

INSERT INTO invoice_items (invoice_id, description, amount, sort_order) VALUES
  (currval('invoices_id_seq'), '中学数学コース受講料', 15000, 1);

-- =====================================================
-- お知らせ
-- =====================================================
INSERT INTO announcements (title, content, target, is_published, published_at, expires_at, created_by) VALUES
  ('春期講習のご案内',
   '3月25日（火）〜4月4日（金）の期間、春期講習を実施します。通常授業の復習と新学年の予習を行います。お申し込みは3月22日（日）までにお願いします。',
   'ALL', TRUE, '2026-03-01 09:00:00', '2026-04-04 23:59:59',
   (SELECT id FROM staff WHERE username='admin')),
  ('3月の定期テスト対策授業について',
   '3月中旬から下旬にかけて、定期テスト対策授業を追加実施します。希望される方は担当講師までお声がけください。',
   'ALL', TRUE, '2026-03-10 10:00:00', '2026-03-31 23:59:59',
   (SELECT id FROM staff WHERE username='yamamoto')),
  ('【保護者の方へ】学習進捗報告会のご案内',
   '4月12日（日）14:00〜16:00、保護者向けの学習進捗報告会を実施します。各担当講師より生徒の状況をご報告します。',
   'ALL', FALSE, NULL, NULL,
   (SELECT id FROM staff WHERE username='admin'));
