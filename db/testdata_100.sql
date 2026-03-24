-- =====================================================
-- 100名規模テストデータ
-- 実行: chcp 65001 && set PGCLIENTENCODING=UTF8 && psql -U juku -d juku -f db/testdata_100.sql
-- ※ 既存テストデータを保持したまま追加します
-- =====================================================

DO $$
DECLARE
  -- 姓・名のリスト
  last_names  TEXT[] := ARRAY['佐藤','鈴木','高橋','田中','渡辺','伊藤','山本','中村','小林','加藤',
                               '吉田','山田','松本','井上','木村','林','清水','山口','池田','橋本',
                               '阿部','石川','山崎','森','松田','中島','岡田','長谷川','石井','後藤'];
  first_m     TEXT[] := ARRAY['翔太','蓮','大翔','湊','陽向','悠斗','颯太','樹','悠真','優斗',
                               '蒼','海斗','陸','大和','柊','瑛太','隼人','凌','碧','陽太'];
  first_f     TEXT[] := ARRAY['陽菜','凛','結菜','莉子','葵','咲','七海','美咲','愛','彩花',
                               '花音','柚希','琴音','萌','菜々','芽衣','一花','詩織','心春','遥'];
  kana_last   TEXT[] := ARRAY['サトウ','スズキ','タカハシ','タナカ','ワタナベ','イトウ','ヤマモト','ナカムラ','コバヤシ','カトウ',
                               'ヨシダ','ヤマダ','マツモト','イノウエ','キムラ','ハヤシ','シミズ','ヤマグチ','イケダ','ハシモト',
                               'アベ','イシカワ','ヤマザキ','モリ','マツダ','ナカジマ','オカダ','ハセガワ','イシイ','ゴトウ'];
  kana_m      TEXT[] := ARRAY['ショウタ','レン','ハルト','ミナト','ヒナタ','ユウト','ソウタ','イツキ','ユウマ','ユウト',
                               'アオ','カイト','リク','ヤマト','ヒイラギ','エイタ','ハヤト','リョウ','アオ','ヨウタ'];
  kana_f      TEXT[] := ARRAY['ヒナ','リン','ユイナ','リコ','アオイ','サキ','ナナミ','ミサキ','アイ','アヤカ',
                               'カノン','ユズキ','コトネ','モエ','ナナ','メイ','イチカ','シオリ','コハル','ハルカ'];

  grades      TEXT[] := ARRAY['小4','小5','小6','中1','中1','中2','中2','中3','中3','高1','高1','高2','高2','高3'];
  schools_j   TEXT[] := ARRAY['新宿中学校','渋谷中学校','目黒中学校','品川中学校','港区立中学校','世田谷中学校','杉並中学校','練馬中学校'];
  schools_h   TEXT[] := ARRAY['都立新宿高校','都立渋谷高校','都立目黒高校','私立明成高校','私立開成高校','都立杉並高校','都立練馬高校'];
  schools_e   TEXT[] := ARRAY['新宿小学校','渋谷小学校','目黒小学校','品川小学校','港区立小学校'];

  v_last      TEXT;
  v_first     TEXT;
  v_kana_l    TEXT;
  v_kana_f    TEXT;
  v_grade     TEXT;
  v_school    TEXT;
  v_gender    INT;  -- 0=male, 1=female
  v_li        INT;
  v_fi        INT;
  v_guardian_id BIGINT;
  v_student_id  BIGINT;
  v_birth_date  DATE;
  v_enrolled    DATE;
  v_status      TEXT;
  v_phone       TEXT;
  i             INT;
  j             INT;

  -- コースID
  cid_chu_math  BIGINT;
  cid_chu_eng   BIGINT;
  cid_chu_jpn   BIGINT;
  cid_hs_math   BIGINT;
  cid_hs_eng    BIGINT;
  cid_sci       BIGINT;
  course_ids    BIGINT[];

  -- スタッフID
  staff_ids   BIGINT[];
  v_staff_id  BIGINT;

  -- 授業・出席
  v_lesson_id   BIGINT;
  lesson_date   DATE;
  v_att_status  TEXT;

  -- 成績
  sid_math BIGINT; sid_eng BIGINT; sid_jpn BIGINT; sid_sci BIGINT;
  eid_teiki BIGINT; eid_mogi BIGINT;

  -- 請求
  v_invoice_id BIGINT;
  v_total      INT;

BEGIN
  -- コースID取得
  SELECT id INTO cid_chu_math FROM courses WHERE name='中学数学コース';
  SELECT id INTO cid_chu_eng  FROM courses WHERE name='中学英語コース';
  SELECT id INTO cid_chu_jpn  FROM courses WHERE name='国語・読解コース';
  SELECT id INTO cid_hs_math  FROM courses WHERE name='高校数学コース';
  SELECT id INTO cid_hs_eng   FROM courses WHERE name='高校英語コース';
  SELECT id INTO cid_sci      FROM courses WHERE name='理科基礎コース';

  -- スタッフID取得
  SELECT ARRAY_AGG(id) INTO staff_ids FROM staff WHERE username IN ('yamamoto','tanaka_t','admin');

  -- 科目・テスト種別ID
  SELECT id INTO sid_math  FROM subjects WHERE name='数学';
  SELECT id INTO sid_eng   FROM subjects WHERE name='英語';
  SELECT id INTO sid_jpn   FROM subjects WHERE name='国語';
  SELECT id INTO sid_sci   FROM subjects WHERE name='理科';
  SELECT id INTO eid_teiki FROM exam_types WHERE name='定期テスト';
  SELECT id INTO eid_mogi  FROM exam_types WHERE name='模擬試験';

  -- 100名生成（既存5名 + 95名追加）
  FOR i IN 1..95 LOOP
    v_li     := (i % 30) + 1;
    v_gender := i % 2;
    IF v_gender = 0 THEN
      v_fi     := (i % 20) + 1;
      v_first  := first_m[v_fi];
      v_kana_f := kana_m[v_fi];
    ELSE
      v_fi     := (i % 20) + 1;
      v_first  := first_f[v_fi];
      v_kana_f := kana_f[v_fi];
    END IF;
    v_last   := last_names[v_li];
    v_kana_l := kana_last[v_li];
    v_grade  := grades[(i % 14) + 1];

    -- 学校
    IF v_grade LIKE '小%' THEN
      v_school := schools_e[(i % 5) + 1];
    ELSIF v_grade LIKE '中%' THEN
      v_school := schools_j[(i % 8) + 1];
    ELSE
      v_school := schools_h[(i % 7) + 1];
    END IF;

    -- 生年月日（学年から逆算）
    CASE v_grade
      WHEN '小4' THEN v_birth_date := make_date(2014 + (i%2), (i%12)+1, (i%28)+1);
      WHEN '小5' THEN v_birth_date := make_date(2013 + (i%2), (i%12)+1, (i%28)+1);
      WHEN '小6' THEN v_birth_date := make_date(2012 + (i%2), (i%12)+1, (i%28)+1);
      WHEN '中1' THEN v_birth_date := make_date(2011 + (i%2), (i%12)+1, (i%28)+1);
      WHEN '中2' THEN v_birth_date := make_date(2010 + (i%2), (i%12)+1, (i%28)+1);
      WHEN '中3' THEN v_birth_date := make_date(2009 + (i%2), (i%12)+1, (i%28)+1);
      WHEN '高1' THEN v_birth_date := make_date(2008 + (i%2), (i%12)+1, (i%28)+1);
      WHEN '高2' THEN v_birth_date := make_date(2007 + (i%2), (i%12)+1, (i%28)+1);
      WHEN '高3' THEN v_birth_date := make_date(2006 + (i%2), (i%12)+1, (i%28)+1);
      ELSE            v_birth_date := make_date(2010,           6,        15);
    END CASE;

    -- 入塾日
    v_enrolled := make_date(2023 + (i%3), (i%12)+1, 1);
    IF v_enrolled > '2026-03-01' THEN v_enrolled := '2025-04-01'; END IF;

    -- ステータス（92%在籍, 5%休塾, 3%退塾）
    IF i % 33 = 0 THEN
      v_status := 'INACTIVE';
    ELSIF i % 20 = 0 THEN
      v_status := 'SUSPENDED';
    ELSE
      v_status := 'ACTIVE';
    END IF;

    -- 電話番号
    v_phone := '0' || (70 + i%30)::TEXT || '-' || LPAD((1000+i*7)::TEXT, 4, '0') || '-' || LPAD((1000+i*13)::TEXT, 4, '0');

    -- 保護者（兄弟姉妹は同一保護者: 10組は2人兄弟）
    IF i % 10 = 5 AND i > 10 THEN
      -- 前の保護者と同一（兄弟）
      SELECT id INTO v_guardian_id FROM guardians ORDER BY id DESC LIMIT 1 OFFSET 1;
    ELSE
      INSERT INTO guardians (full_name, full_name_kana, phone, email, address)
      VALUES (
        v_last || ' ' || (CASE WHEN v_gender=0 THEN '父' ELSE '母' END) || '親',
        v_kana_l || ' ' || (CASE WHEN v_gender=0 THEN 'チチ' ELSE 'ハハ' END),
        v_phone,
        lower(v_last) || i || '@example.com',
        '東京都' || (ARRAY['新宿区','渋谷区','目黒区','品川区','港区','世田谷区','杉並区','練馬区'])[(i%8)+1] || i || '-' || (i%10+1) || '-' || (i%20+1)
      )
      RETURNING id INTO v_guardian_id;
    END IF;

    -- 生徒
    INSERT INTO students (full_name, full_name_kana, birth_date, grade, school_name, guardian_id, status, enrolled_at, left_at)
    VALUES (
      v_last || ' ' || v_first,
      v_kana_l || ' ' || v_kana_f,
      v_birth_date,
      v_grade,
      v_school,
      v_guardian_id,
      v_status,
      v_enrolled,
      CASE WHEN v_status='INACTIVE' THEN '2026-02-28'::DATE ELSE NULL END
    )
    RETURNING id INTO v_student_id;

    -- コース受講登録（学年に応じて1〜2コース）
    IF v_grade LIKE '高%' THEN
      IF i % 3 = 0 THEN
        course_ids := ARRAY[cid_hs_math, cid_hs_eng];
      ELSIF i % 3 = 1 THEN
        course_ids := ARRAY[cid_hs_math];
      ELSE
        course_ids := ARRAY[cid_hs_eng];
      END IF;
    ELSIF v_grade LIKE '中%' THEN
      IF i % 4 = 0 THEN
        course_ids := ARRAY[cid_chu_math, cid_chu_eng];
      ELSIF i % 4 = 1 THEN
        course_ids := ARRAY[cid_chu_math];
      ELSIF i % 4 = 2 THEN
        course_ids := ARRAY[cid_chu_eng, cid_chu_jpn];
      ELSE
        course_ids := ARRAY[cid_chu_math, cid_chu_jpn];
      END IF;
    ELSE
      -- 小学生
      IF i % 2 = 0 THEN
        course_ids := ARRAY[cid_chu_jpn, cid_sci];
      ELSE
        course_ids := ARRAY[cid_chu_math];
      END IF;
    END IF;

    -- ACTIVE/SUSPENDED のみ受講登録
    IF v_status != 'INACTIVE' THEN
      FOR j IN 1..array_length(course_ids, 1) LOOP
        INSERT INTO student_courses (student_id, course_id, started_at)
        VALUES (v_student_id, course_ids[j], v_enrolled)
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;

    -- 成績データ（ACTIVE生徒のみ、数学または英語）
    IF v_status = 'ACTIVE' THEN
      -- 2学期中間
      INSERT INTO exam_results (student_id, subject_id, exam_type_id, exam_name, exam_date, score, max_score, rank, total_students, academic_year, semester)
      VALUES (
        v_student_id,
        CASE WHEN i%2=0 THEN sid_math ELSE sid_eng END,
        eid_teiki,
        '2025年度 2学期中間テスト',
        '2025-10-15',
        40 + (i * 17 % 55),  -- 40〜94点
        100,
        5 + (i * 11 % 115),
        120 + (i%80),
        2025, 2
      );
      -- 2学期期末
      INSERT INTO exam_results (student_id, subject_id, exam_type_id, exam_name, exam_date, score, max_score, rank, total_students, academic_year, semester)
      VALUES (
        v_student_id,
        CASE WHEN i%2=0 THEN sid_math ELSE sid_eng END,
        eid_teiki,
        '2025年度 2学期期末テスト',
        '2025-12-10',
        45 + (i * 19 % 50),  -- 45〜94点（若干上昇傾向）
        100,
        3 + (i * 9 % 117),
        120 + (i%80),
        2025, 2
      );
      -- 模擬試験（中3・高校生のみ）
      IF v_grade IN ('中3','高1','高2','高3') THEN
        INSERT INTO exam_results (student_id, subject_id, exam_type_id, exam_name, exam_date, score, max_score, academic_year, semester)
        VALUES (
          v_student_id,
          CASE WHEN i%2=0 THEN sid_math ELSE sid_eng END,
          eid_mogi,
          '2026年1月 公開模試',
          '2026-01-18',
          50 + (i * 13 % 45),
          100,
          2025, 3
        );
      END IF;
    END IF;

    -- 請求（ACTIVE・SUSPENDED: 2月分PAID, 3月分UNPAID）
    IF v_status IN ('ACTIVE','SUSPENDED') THEN
      v_total := array_length(course_ids, 1) * 15000;

      -- 2月分（支払済）
      INSERT INTO invoices (student_id, billing_month, total_amount, due_date, status)
      VALUES (v_student_id, '2026-02', v_total, '2026-02-28', 'PAID')
      RETURNING id INTO v_invoice_id;
      FOR j IN 1..array_length(course_ids, 1) LOOP
        INSERT INTO invoice_items (invoice_id, description, amount, sort_order)
        VALUES (v_invoice_id, '受講料', 15000, j);
      END LOOP;
      INSERT INTO payments (invoice_id, paid_amount, paid_at, method, recorded_by)
      VALUES (v_invoice_id, v_total, ('2026-02-' || LPAD((10 + i%18)::TEXT, 2, '0'))::DATE,
              CASE WHEN i%3=0 THEN 'CASH' ELSE 'BANK_TRANSFER' END,
              staff_ids[1]);

      -- 3月分（未払い）
      IF v_status = 'ACTIVE' THEN
        INSERT INTO invoices (student_id, billing_month, total_amount, due_date, status)
        VALUES (v_student_id, '2026-03', v_total, '2026-03-31', 'UNPAID')
        RETURNING id INTO v_invoice_id;
        FOR j IN 1..array_length(course_ids, 1) LOOP
          INSERT INTO invoice_items (invoice_id, description, amount, sort_order)
          VALUES (v_invoice_id, '受講料', 15000, j);
        END LOOP;
      END IF;
    END IF;

  END LOOP;

  RAISE NOTICE '生徒95名の追加完了';
END $$;

-- =====================================================
-- 今週・来週の授業コマを大量追加（週5日 × 各コース1〜2コマ）
-- =====================================================
DO $$
DECLARE
  cid_chu_math BIGINT; cid_chu_eng BIGINT; cid_chu_jpn BIGINT;
  cid_hs_math  BIGINT; cid_hs_eng  BIGINT; cid_sci     BIGINT;
  staff_yama   BIGINT; staff_tana  BIGINT; staff_admin BIGINT;
  base_date    DATE := '2026-03-23'; -- 今週月曜
  d            INT;
  slot         INT;
  lesson_dt    TIMESTAMP;
BEGIN
  SELECT id INTO cid_chu_math FROM courses WHERE name='中学数学コース';
  SELECT id INTO cid_chu_eng  FROM courses WHERE name='中学英語コース';
  SELECT id INTO cid_chu_jpn  FROM courses WHERE name='国語・読解コース';
  SELECT id INTO cid_hs_math  FROM courses WHERE name='高校数学コース';
  SELECT id INTO cid_hs_eng   FROM courses WHERE name='高校英語コース';
  SELECT id INTO cid_sci      FROM courses WHERE name='理科基礎コース';
  SELECT id INTO staff_yama  FROM staff WHERE username='yamamoto';
  SELECT id INTO staff_tana  FROM staff WHERE username='tanaka_t';
  SELECT id INTO staff_admin FROM staff WHERE username='admin';

  -- 今週残り + 来週 (月〜土の2週分)
  FOR d IN 0..11 LOOP
    IF (d % 6) < 5 THEN  -- 月〜金（0-4, 6-10）
      -- 16時: 中学数学
      lesson_dt := (base_date + d) + INTERVAL '16 hours';
      INSERT INTO lessons (course_id, teacher_id, classroom, scheduled_at, duration_min, status)
      VALUES (cid_chu_math, staff_yama, 'A教室', lesson_dt, 90,
              CASE WHEN lesson_dt < NOW() THEN 'DONE' ELSE 'SCHEDULED' END)
      ON CONFLICT DO NOTHING;

      -- 17:30: 中学英語
      lesson_dt := (base_date + d) + INTERVAL '17 hours 30 minutes';
      INSERT INTO lessons (course_id, teacher_id, classroom, scheduled_at, duration_min, status)
      VALUES (cid_chu_eng, staff_tana, 'B教室', lesson_dt, 90,
              CASE WHEN lesson_dt < NOW() THEN 'DONE' ELSE 'SCHEDULED' END)
      ON CONFLICT DO NOTHING;

      -- 19時: 高校数学（月・水・金のみ）
      IF (d % 6) IN (0,2,4) THEN
        lesson_dt := (base_date + d) + INTERVAL '19 hours';
        INSERT INTO lessons (course_id, teacher_id, classroom, scheduled_at, duration_min, status)
        VALUES (cid_hs_math, staff_yama, 'A教室', lesson_dt, 90,
                CASE WHEN lesson_dt < NOW() THEN 'DONE' ELSE 'SCHEDULED' END)
        ON CONFLICT DO NOTHING;
      END IF;

      -- 19時: 高校英語（火・木のみ）
      IF (d % 6) IN (1,3) THEN
        lesson_dt := (base_date + d) + INTERVAL '19 hours';
        INSERT INTO lessons (course_id, teacher_id, classroom, scheduled_at, duration_min, status)
        VALUES (cid_hs_eng, staff_tana, 'B教室', lesson_dt, 90,
                CASE WHEN lesson_dt < NOW() THEN 'DONE' ELSE 'SCHEDULED' END)
        ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE '授業コマ追加完了';
END $$;

-- =====================================================
-- 今週の授業に出席記録を追加（完了済み授業のみ）
-- =====================================================
DO $$
DECLARE
  lesson_rec RECORD;
  student_rec RECORD;
  att_status TEXT;
  counter INT := 0;
BEGIN
  FOR lesson_rec IN
    SELECT l.id, l.course_id FROM lessons l
    WHERE l.status = 'DONE'
    AND l.scheduled_at >= '2026-03-23'
    AND NOT EXISTS (SELECT 1 FROM attendances a WHERE a.lesson_id = l.id LIMIT 1)
  LOOP
    FOR student_rec IN
      SELECT sc.student_id FROM student_courses sc
      WHERE sc.course_id = lesson_rec.course_id
        AND sc.ended_at IS NULL
      LIMIT 8  -- 1授業最大8名
    LOOP
      -- 出席率80%: 15%欠席, 5%遅刻
      IF (counter % 20) IN (0,1,2) THEN
        att_status := 'ABSENT';
      ELSIF (counter % 20) = 3 THEN
        att_status := 'LATE';
      ELSE
        att_status := 'PRESENT';
      END IF;
      INSERT INTO attendances (lesson_id, student_id, status, checked_at)
      VALUES (lesson_rec.id, student_rec.student_id, att_status,
              CASE WHEN att_status='ABSENT' THEN NULL
                   WHEN att_status='LATE'   THEN (SELECT scheduled_at + INTERVAL '20 minutes' FROM lessons WHERE id=lesson_rec.id)
                   ELSE                          (SELECT scheduled_at + INTERVAL '2 minutes'  FROM lessons WHERE id=lesson_rec.id)
              END)
      ON CONFLICT DO NOTHING;
      counter := counter + 1;
    END LOOP;
  END LOOP;
  RAISE NOTICE '出席記録追加完了';
END $$;

SELECT
  (SELECT COUNT(*) FROM students WHERE status='ACTIVE')    AS 在籍生徒数,
  (SELECT COUNT(*) FROM students WHERE status='SUSPENDED') AS 休塾生徒数,
  (SELECT COUNT(*) FROM students WHERE status='INACTIVE')  AS 退塾生徒数,
  (SELECT COUNT(*) FROM lessons  WHERE status='SCHEDULED') AS 予定授業数,
  (SELECT COUNT(*) FROM lessons  WHERE status='DONE')      AS 完了授業数,
  (SELECT COUNT(*) FROM invoices WHERE status='UNPAID')    AS 未払い請求数,
  (SELECT COUNT(*) FROM exam_results)                      AS 成績件数;
