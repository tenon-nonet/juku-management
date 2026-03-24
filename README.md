# 塾管理システム（コキャカン）

個別指導塾向けのオールインワン管理システム。顧客管理・授業管理・成績管理・営業管理をカバーします。

---

## プラン構成

| プラン | 機能 |
|---|---|
| **ベーシック** | 顧客管理、請求管理、お知らせ |
| **アドバンスド** | ＋成績管理、時間割管理、メッセージ、生徒/保護者ポータル |
| **プロフェッショナル** | ＋営業管理、売上分析、その他全機能 |

各機能はフラグで個別ON/OFF可能（管理画面 → 設定 → 機能管理）。

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | Vite + React 19 + TypeScript + TailwindCSS v4 |
| バックエンド | Spring Boot 3.2.5 (Java 21) + Spring Security + JWT + JPA |
| データベース | PostgreSQL 16 |
| モバイル | Capacitor（iOS/Android対応予定） |

---

## ローカル環境構築

### 前提条件

- Java 21（`java -version` で確認）
- Maven 3.x
- Node.js 22+
- Docker（PostgreSQL用）

### データベース起動

```bash
docker compose -f docker-compose.local.yml up -d
```

### v2マイグレーション実行（初回のみ）

```bash
docker exec -i juku-management-db-1 psql -U juku_user -d juku < db/migrate_v2.sql
```

### バックエンド起動

**Windows:**
```cmd
cd backend
mvn spring-boot:run
```

**Mac/Linux:**
```bash
cd backend
mvn spring-boot:run
```

※ デフォルトで `http://localhost:8080` で起動します。

### フロントエンド起動

```bash
cd frontend
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

---

## 初期ログイン

| ユーザー名 | パスワード | ロール |
|---|---|---|
| admin | admin123 | PRINCIPAL（教室長）|
| yamamoto | teacher123 | STAFF |
| tanaka_t | teacher123 | STAFF |

---

## DB操作

### psql接続

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

## ロール一覧

| ロール | 権限 |
|---|---|
| `PRINCIPAL` | 教室長。全権限 |
| `ADMIN` | 管理者。全権限（PRINCIPALと同等） |
| `TEACHER` | 講師。担当生徒・授業の管理 |
| `OFFICE_STAFF` | 事務。請求・顧客情報 |
| `STAFF` | 一般スタッフ（後方互換） |
| `STUDENT` | 生徒ポータルへのアクセス |
| `GUARDIAN` | 保護者ポータルへのアクセス |

---

## 実装済み機能

### 顧客管理（ベーシック）
- [x] 生徒管理（CRUD・在籍状況・担当講師割り当て）
- [x] 保護者管理（CRUD・紐付け）
- [x] スタッフ管理（ロール・担当科目・詳細ページ）
- [x] 請求書・支払い管理
- [x] お知らせ管理（対象者指定・公開制御）

### 授業管理（アドバンスド）
- [x] 授業スケジュール管理（個別指導対応）
- [x] 出欠記録
- [x] コース・科目マスタ管理

### 成績管理（アドバンスド）
- [x] テスト成績記録（科目・学期・年度対応）
- [x] CSVインポート（一括取り込み）
- [x] CSVエクスポート
- [x] 成績推移グラフ（Recharts）
- [x] 同校生徒の得点分布グラフ
- [x] 志望校マスタ管理
- [x] 合格実績管理

### ポータル・連絡機能（アドバンスド）
- [x] 生徒ポータル（マイページ・時間割・成績確認）
- [x] 保護者ポータル（お子様情報・時間割確認）
- [x] メッセージ機能（教室↔保護者/生徒のチャット）

### システム
- [x] JWT認証（ADMIN/STAFF/STUDENT/GUARDIAN対応）
- [x] 機能フラグ（プラン別ON/OFF・管理画面で切り替え）
- [x] ダーク/ライトモード切り替え
- [x] モバイル対応UI（ハンバーガーメニュー・レスポンシブ）
- [x] ダッシュボード

---

## 実装予定機能

### 時間割管理強化（アドバンスド）
- [ ] 週間・月間・年間時間割ビュー
- [ ] 生徒別・講師別・教室別の時間割表示
- [ ] 画面操作で時間割を組み替え（ドラッグ&ドロップ）
- [ ] スケジュール競合の検知・警告
- [ ] 条件に基づく自動時間割生成（生徒希望×講師シフト）

### 成績分析・志望校機能（アドバンスド）
- [ ] 複数教室間の成績比較（管理者権限で集計データのみ共有）
- [ ] 過去の合格実績に基づく志望校提案
- [ ] 志望校別学習ロードマップ提案
- [ ] 受験カレンダー（試験日・イベント管理）

### 生徒・講師情報充実（アドバンスド）
- [ ] 希望講師の指定
- [ ] 講師の担当生徒一覧・コマ数可視化
- [ ] 次年度計画（卒業生・引退講師をもとに確保必要数の表示）

### 営業管理（プロフェッショナル）
- [ ] 見込み顧客ステータス管理
- [ ] 営業目標（目標生徒単価・目標生徒数・目標コマ数）
- [ ] 売上グラフ（月次・四半期・年次）
- [ ] 当月/四半期/年間の目標達成率表示

### 地域・学校情報（プロフェッショナル）
- [ ] Google Maps連携（塾周辺の学校表示）
- [ ] 学校情報管理（住所・学区・偏差値等）

### モバイルアプリ（Capacitor）
- [ ] iOS/Androidアプリとして App Store / Play Store 公開
- [ ] プッシュ通知（授業リマインド・お知らせ）

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
