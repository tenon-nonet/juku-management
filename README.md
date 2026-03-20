# 塾顧客管理システム

塾向けの顧客・授業・請求管理システム

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Vite + React + TypeScript + TailwindCSS v4 |
| バックエンド | Spring Boot 3.2.5 (Java 21) + Spring Security + JWT |
| データベース | PostgreSQL 16 |

---

## ローカル環境構築

### 前提条件

- Java 21（`/opt/homebrew/opt/openjdk@21`）
- Maven 3.x
- Node.js 22+
- Docker（PostgreSQL用）

### データベース起動

```bash
docker compose -f docker-compose.local.yml up -d
```

### バックエンド起動

```bash
cd backend
export JAVA_HOME="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### フロントエンド起動

```bash
cd frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

### 初期ログイン

| ユーザー名 | パスワード | 権限 |
|---|---|---|
| admin | admin123 | ADMIN |
| yamamoto | teacher123 | STAFF |
| tanaka_t | teacher123 | STAFF |

### DB接続（psql）

```bash
docker exec -it juku-management-db-1 psql -U juku_user -d juku
```

よく使うコマンド：

```sql
\dt          -- テーブル一覧
\d students  -- テーブル定義
\q           -- 終了
```

### テストデータ投入

```bash
docker exec -i juku-management-db-1 psql -U juku_user -d juku < db/testdata.sql
```

※ 既存データをクリアして再投入します（staff の admin は保持）。

---

## ブランチ戦略

| ブランチ | 用途 |
|---|---|
| `main` | 本番リリース |
| `develop` | 開発統合 |

---

## 本番デプロイ

`.env.production.example` をコピーして `.env` を作成し、値を設定後：

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 実装済み機能

- 生徒・保護者管理（CRUD）
- 授業スケジュール管理・出席記録
- 成績管理（試験結果）
- 請求書・支払い管理
- お知らせ管理
- スタッフ管理
- ダッシュボード（集計表示）
