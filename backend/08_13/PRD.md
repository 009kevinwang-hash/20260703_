# PRD：Python 連結 Render PostgreSQL 教學文件

> 本文件是「產品需求文件（PRD）」，用途是**指示其他 AI 模型（執行者）產出一份給學生看的教學文件**。
> 執行者請依照本 PRD 的所有需求，產出 `python連結postgres.md`。
> 內容愈細愈好，本文件內所有「必須 / 要求 / 規範」都代表執行者必須照做。

---

## 1. 文件資訊

| 欄位 | 內容 |
|------|------|
| 專案名稱 | Python 連結 Render PostgreSQL 教學 |
| 目標文件（產出物） | `backend/08_13/python連結postgres.md` |
| 版本 | 1.0 |
| 建立日期 | 2026-08-13 |
| 狀態 | Draft |
| 目標對象 | 學生（大學生 / 初學者） |
| 關鍵技術 | Python、Render PostgreSQL、psycopg、python-dotenv、.env |

---

## 2. 產品概述

### 2.1 背景

學生需要學習如何用 Python 連線到雲端資料庫（本課程使用 **Render 的 PostgreSQL**），進行基本的資料查詢與操作。多數學生不熟悉資料庫連線、不熟悉如何保護資料庫密碼，容易把密碼直接寫死在程式碼裡並上傳到 GitHub，造成資安風險。

### 2.2 目標

產出一份「步驟式、可照做、有練習題」的中文教學文件 `python連結postgres.md`，讓學生：

1. 知道 Python 連線 Render PostgreSQL 的完整步驟。
2. 學會使用 `.env` 檔案保護資料庫密碼，避免密碼外洩。
3. 能實際執行一段 Python 程式，成功對雲端資料庫做「連線 → 查詢 → 寫入 → 關閉」。
4. 知道常見錯誤（連線失敗、認證失敗、SSLCertVerificationError 等）如何排除。

### 2.3 成功條件

- 學生依文件操作，**15 分鐘內**能成功跑通連線與查詢。
- 文件中**絕對不能出現真實密碼**（見 §8.2 資安規範）。
- 學生學會 `.env` + `.gitignore` 的正確做法。

---

## 3. 目標對象分析

| 項目 | 說明 |
|------|------|
| 背景 | 已具備 Python 基礎語法（print、for、函式），安裝過 Python 3.10+ |
| 可能沒學過 | 資料庫概念、SQL、環境變數、套件管理（pip / uv） |
| 使用環境 | Windows 或 macOS 本機、終端機（Terminal / PowerShell） |
| 常見痛點 | 不知道連線字串長什麼樣、不會裝套件、密碼外洩、SSL 憑證錯誤、中文亂碼 |
| 學習動機 | 課程作業 / 期末專題需要存取雲端資料庫 |

---

## 4. 產出物（Deliverables）

### 4.1 主要產出

- **檔案名稱**：`python連結postgres.md`
- **存放位置**：`C:\Users\User\Documents\GitHub\_20260703\backend\08_13\python連結postgres.md`
- **語言**：繁體中文（整個文件必須以繁體中文撰寫）
- **格式**：GitHub Flavored Markdown（程式碼區塊需標註語言，如 ` ```python `）

### 4.2 禁止產出的東西

- 禁止修改專案其他檔案。
- 禁止建立 `.env` 檔案。
- 禁止在教學文件中放入真實密碼。
- 禁止產出 Jupyter notebook 或其他格式，只產出單一 `.md` 檔。

---

## 5. 功能需求（教學文件內容要求）

`python連結postgres.md` 必須包含以下章節，順序如下：

### 5.1 章節一：Render PostgreSQL 是什麼（簡介）

- 用 5 行程式內說明 Render 是什麼、PostgreSQL 是什麼。
- 說明本課程使用的雲端資料庫位置（Render，新加坡機房）。
- 說明「連線字串（Connection String）」的概念：`postgresql://使用者:密碼@主機:埠號/資料庫名稱`。
- 用一個易懂的比喻（例如：連線字串 = 進入圖書館需要「地址 + 門禁卡」）。

### 5.2 章節二：環境準備（必做步驟）

必須依序教學生：

1. 確認已安裝 Python（`python --version`）。
2. 使用 `uv` 建立虛擬環境（本專案規範用 uv，見根目錄 `AGENTS.md`）：
   - `uv venv`
   - 啟用虛擬環境（Windows：`.venv\Scripts\activate`；macOS/Linux：`source .venv/bin/activate`）。
3. 安裝必要套件：
   - `uv pip install psycopg[binary]`（PostgreSQL 驅動，`[binary]` 可免編譯）
   - `uv pip install python-dotenv`（讀取 `.env` 檔案）
   - 或一次安裝：`uv pip install "psycopg[binary]" python-dotenv`
4. 說明每個套件的用途。

### 5.3 章節三：使用 .env 保護密碼（核心重點，需最詳盡）

這是本文件的**最重要章節**，必須清楚教導：

1. **為什麼不能把密碼寫死在程式碼裡**：
   - 舉例說明後果：程式碼推到 GitHub 後密碼被公開、帳號被盜、資料被刪。
   - 說明「憑證不進版控」原則（Credentials never in version control）。
2. **建立 `.env` 檔案**：
   - 在專案根目錄建立檔名為 `.env` 的檔案。
   - 內容格式範例：
     ```
     DATABASE_URL=postgresql://你的使用者:你的密碼@你的主機:5432/你的資料庫
     ```
   - 教學生「不要用記事本改名」，建議用 VS Code 直接新增檔案。
3. **建立 `.env.example` 範本**（只有欄位名稱、沒有真實值）：
   ```
   DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE
   ```
   - 說明 `.env.example` 可以上傳 GitHub，` .env` 不可以。
4. **設定 `.gitignore` 擋住 `.env`**：
   - 在 `.gitignore` 加入 `.env` 一行。
   - 教學生確認方法：`git status` 看不到 `.env`。
   - 提醒：如果之前已經把 `.env` 推上去過，必須用 `git rm --cached .env` 移出追蹤（文件要提供此指令）。
5. **在 Python 中使用 `python-dotenv` 讀取**：
   - 示範 `from dotenv import load_dotenv` + `load_dotenv()`。
   - 示範 `os.getenv("DATABASE_URL")`。
   - 完整範例程式碼（連線 + 讀取環境變數 + 查詢）。
6. **資安檢查清單**（安全小提醒）：
   - `.env` 一定要在 `.gitignore` 內。
   - 不要截圖分享 `.env` 內容。
   - 不要把 `.env` 放在可以公開下載的資料夾。
   - 萬一密碼外洩，到 Render 後台「Reset credentials」重新產生。

### 5.4 章節四：用 Python 連線 Render PostgreSQL

必須提供**可直接複製執行**的完整範例，並逐步解釋。要求：

1. **使用 `psycopg`（psycopg3）連線**，提供兩種寫法：
   - 基本寫法：`psycopg.connect(conninfo)` → `conn.cursor()` → `execute` → `fetchall` → `close`。
   - 建議寫法：使用 `with psycopg.connect(...) as conn:`（context manager，自動關閉連線與交易）。
2. 說明 `conninfo` 直接吃 `DATABASE_URL` 即可，psycopg 會自動解析。
3. 示範至少 4 種操作，每種都要有註解與輸出範例：
   - 查詢全部（`SELECT *`）
   - 帶條件的查詢（`WHERE` + 參數化查詢 `%s`，強調**禁止用 f-string 拼 SQL**，避免 SQL Injection）
   - 寫入資料（`INSERT` + `commit`）
   - 更新與刪除（`UPDATE` / `DELETE` + `commit`）
4. 說明**交易（transaction）與 commit 的關係**（psycopg3 中 `with` 區塊成功會自動 commit，例外會 rollback）。
5. 提供把連線包成 `get_connection()` 函式的重構範例。

### 5.5 章節五：完整可執行範例（主菜）

提供一個「單一檔案、直接可跑」的完整範例（例如 `db_demo.py`）：

- 開頭 `load_dotenv()`。
- 從環境變數讀取 `DATABASE_URL`。
- 連線後依序執行「建立資料表（若不存在）→ 插入資料 → 查詢資料 → 顯示結果」。
- 全程使用 `with` 管理連線。
- 若沒設定 `DATABASE_URL` 就印出友善提示並結束。

### 5.6 章節六：常見錯誤與排除（FAQ）

至少涵蓋以下 5 個情境，每個都要有「錯誤訊息長相 + 原因 + 解法」：

1. `connection refused` 或 `could not connect`：主機/埠號錯、白名單沒放行。
2. `password authentication failed for user`：密碼錯或使用者錯。
3. `SSLCertVerificationError` / `ssl connection required`：Render 需要 SSL，加上 `sslmode=require`。
4. `ModuleNotFoundError: No module named 'psycopg'`：沒安裝套件或沒啟動虛擬環境。
5. `NameError / AttributeError` 找不到 `DATABASE_URL`：`.env` 沒建立、路徑不對、沒呼叫 `load_dotenv()`。

### 5.7 章節七：練習題

提供 3 題由淺入深的練習：

1. 修改連線程式，印出資料庫「伺服器版本」與「目前時間」。
2. 新增一張「學生」資料表，插入 3 筆自己的資料並查詢出來。
3. 將連線字串改成錯誤密碼，觀察錯誤訊息，再用 `.env` 改回正確密碼，確認能連上。

每題都要附「提示」與「答案（放在程式碼折疊區，用 HTML `<details>`）」。

### 5.8 章節八：參考資料

- Render PostgreSQL 官方文件連結。
- psycopg 官方文件連結。
- `python-dotenv` 官方文件連結。

---

## 6. 非功能需求

| 需求 | 規範 |
|------|------|
| 語言 | 全文繁體中文，程式碼註解也用中文 |
| 可重現性 | 每個指令都要完整（含指令本身與預期輸出），學生照抄就能跑 |
| 範例真實性 | 範例連線字串必須是「佔位符」，如 `USERNAME / PASSWORD / HOST / DATABASE`，**不得出現真實密碼** |
| 篇幅 | 建議 300～500 行程式碼等級的教學量，避免過短 |
| 語氣 | 親切、一步步引導，對初學者友善 |
| 章節錨點 | 章節標題用 `##`，讓 GitHub 自動產生目錄 |

---

## 7. 驗收標準（DoD — Definition of Done）

`python連結postgres.md` 完成時，必須**逐項通過**以下檢查：

- [ ] 檔案存在於 `backend/08_13/python連結postgres.md`。
- [ ] 全文為繁體中文。
- [ ] 沒有出現任何真實密碼（搜尋連線字串中的真實 `BoZH...` 開頭密碼，不得出現在教學文件中）。
- [ ] 包含 §5.1～§5.8 全部八個章節。
- [ ] §5.3 有完整 `.env` + `.env.example` + `.gitignore` + `git rm --cached` 教學。
- [ ] §5.4 至少包含查詢、條件查詢、寫入、更新/刪除四種操作，且使用參數化查詢。
- [ ] §5.5 的完整範例可直接複製成 `.py` 執行（語法正確、套件皆在 §5.2 列出）。
- [ ] §5.6 至少 5 個常見錯誤。
- [ ] §5.7 有 3 題練習題，附答案與 `<details>` 折疊。

---

## 8. 給執行模型的指示（執行者請注意）

### 8.1 產出流程

1. 先閱讀本 PRD 全文。
2. 參考 `C:\Users\User\Documents\GitHub\_20260703\AGENTS.md`（確認 uv 使用規範、回覆用繁體中文）。
3. 在 `backend/08_13/` 直接建立 `python連結postgres.md`。
4. 完成後對照 §7 驗收清單逐項自檢。

### 8.2 資安規範（最高優先，違反即失敗）

- **真實密碼不得寫入任何產出文件。**
- 教學文件中所有連線字串一律使用佔位符。
- 若學生需要真實連線資訊，文件應寫「請向老師索取 `.env`」或「依老師提供的連線字串填入自己電腦的 `.env`」。
- 執行者不得自行建立或修改任何 `.env` 檔案。

### 8.3 環境事實（供參考，不需寫進教學文件）

- 本專案虛擬環境統一使用 **uv**（見根目錄 `AGENTS.md`）。
- 課程用 Render PostgreSQL 連線格式範例（僅參考格式，勿直接複製真實值）：
  - 主機型態：`dpg-xxxx-xxx.singapore-postgres.render.com`
  - 埠號：`5432`
  - 連線字串格式：`postgresql://使用者:密碼@主機:5432/資料庫名稱`
- 若教學文件需要提供可實際連線的練習資料庫，可在 §5.7 練習題中請學生使用「老師提供的連線字串」。

---

## 9. 附錄

### 9.1 名詞對照表（寫入教學文件時用）

| 英文 | 中文翻譯建議 |
|------|------|
| Connection String / DATABASE_URL | 連線字串 |
| Environment Variable | 環境變數 |
| Secret / Credential | 機密 / 憑證 |
| psycopg | psycopg（PostgreSQL 的 Python 驅動程式） |
| commit | 提交（把寫入真正存進資料庫） |
| query | 查詢 |
| parameterized query | 參數化查詢 |

### 9.2 變更紀錄

| 版本 | 日期 | 說明 |
|------|------|------|
| 1.0 | 2026-08-13 | 初版建立 |
