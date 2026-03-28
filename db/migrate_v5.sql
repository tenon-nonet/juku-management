-- v5: システム設定テーブル
CREATE TABLE IF NOT EXISTS system_settings (
    key         VARCHAR(100) PRIMARY KEY,
    value       TEXT         NOT NULL,
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- デフォルト値：ブース数 0 = 未設定
INSERT INTO system_settings (key, value)
VALUES ('max_booths', '0')
ON CONFLICT (key) DO NOTHING;
