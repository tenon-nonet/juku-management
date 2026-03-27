-- migrate_v4.sql: タスク管理・来年度計画テーブル追加

CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'TODO',
    due_date DATE,
    assignee_id BIGINT REFERENCES staff(id) ON DELETE SET NULL,
    created_by BIGINT REFERENCES staff(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS next_year_plans (
    target_year INT PRIMARY KEY,
    plan_json JSONB NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
