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

## 実装予定機能
- GoogleマップAPIを使用して、周辺の学校情報を表示する
- 小中高大学、学校名で抽出できるようにする、塾所在地から周辺何メートルを抽出、などできるように、学校情報を入力して管理することもできる
- 時間割管理機能の充実、画面で自在に時間割を組み替えられるようにする、条件に合わない場合は警告が表示される、
- 自動時間割作成機能 生徒時間割と講師のシフトとを擦り合わせて、自動作成することができるように
- 生徒情報の充実、希望講師　講師情報の充実、担当生徒一覧　
- 次年度の教室状況表示機能、卒業生、引退講師予定などをもとに、次年度の確保必要生徒と確保必要講師数表示
- 生徒志望校入力で、対象の志望校情報を表示
- 当日時間割、週間時間割、月間時間割、年間時間割、生徒ごと、講師ごと、教室ごと
- 生徒成績、希望条件に合わせた志望校の提案機能
- 志望校用の学習ロードマップ提案機能
- 受験期カレンダー、生徒ごとに作成、志望校受験日、イベント等をどっかのAPIを叩いて取得して表示、、、とか？
- 営業記録管理、営業目標、目標生徒単価、目標生徒数、目標授業コマ数を入力して、グラフ化、当月、四半期、年間の目標を表示
- 見込み顧客ステータス管理 
- 