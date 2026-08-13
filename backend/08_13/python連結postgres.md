# Python 連結 Render PostgreSQL 教學

> 這是一份給學生的步驟式教學文件，教你用 Python 連上部署在 **Render** 的雲端 PostgreSQL 資料庫，學會查詢與寫入資料，並懂得用 `.env` 妥善保護資料庫密碼。
>
> 只要照著做，**15 分鐘內**就能跑通第一支連線程式。

---

## 目錄

1. [Render PostgreSQL 是什麼](#1-render-postgresql-是什麼)
   - [1.1 從 Render 後台取得「外部連線字串」](#11-從-render-後台取得外部連線字串)
2. [環境準備（必做步驟）](#2-環境準備必做步驟)
3. [使用 .env 保護密碼（核心重點）](#3-使用-env-保護密碼核心重點)
4. [用 Python 連線 Render PostgreSQL](#4-用-python-連線-render-postgresql)
5. [完整可執行範例（主菜）](#5-完整可執行範例主菜)
6. [常見錯誤與排除（FAQ）](#6-常見錯誤與排除faq)
7. [練習題](#7-練習題)
8. [參考資料](#8-參考資料)
9. [名詞對照表](#9-名詞對照表)

---

## 1. Render PostgreSQL 是什麼

- **Render** 是一個雲端平台，可代管你的網站、API 與資料庫，省去自己買伺服器、架機器、維護環境的麻煩。
- **PostgreSQL** 是一套功能強大、免費開源的資料庫系統，以「表格」儲存資料，並支援 SQL 查詢語言。
- **Render PostgreSQL** 就是「別人幫你架設好的 PostgreSQL」：只要申請方案，就能取得一組連線資訊，隨時隨地從世界各地連上使用。
- 本課程使用的資料庫就放在 Render 的**新加坡機房**，因此連線字串中的主機名稱會以 `singapore-postgres.render.com` 結尾。
- **連線字串（Connection String）**：一串把「連到哪裡、我是誰、密碼是什麼」全部打包在一起的文字，格式如下：

```
postgresql://使用者:密碼@主機:5432/資料庫名稱
```

把它拆開看：

| 片段 | 意思 |
|------|------|
| `postgresql://` | 通訊協定，告訴程式「我要連接的是 PostgreSQL」 |
| `使用者` | 資料庫帳號（通常是 `postgres` 或一串隨機字元） |
| `密碼` | 你的資料庫密碼 |
| `主機` | 資料庫的主機位置（IP 或網域名稱） |
| `5432` | 通訊埠，PostgreSQL 的預設埠號為 5432 |
| `資料庫名稱` | 要連的資料庫名字 |

**比喻**：把資料庫想成一間圖書館，連線字串就是「圖書館地址＋門禁卡」。沒有地址，你找不到地方；沒有門禁卡，你進不了門。只要把這張「地址＋門禁卡」交給 Python，它就能替你開門、進去找資料。

### 1.1 從 Render 後台取得「外部連線字串」

> 連線字串到底要去哪裡拿？Render 後台早就把「圖書館地址＋門禁卡」準備好了，你只需要**複製**，不要自己打字（打錯一個字就全部連不上）。

請照下列步驟操作：

1. 用瀏覽器登入 [Render 控制台](https://dashboard.render.com/)。
2. 在左側選單點 **Databases**，再點進你的 PostgreSQL 資料庫服務。
3. 在頁面上方找到並點擊 **Connect** 按鈕，會展開連線資訊面板。
4. 面板裡有兩個長得很像的欄位，千萬別拿錯：
   - **Internal Database URL**：給「住在 Render 內部的程式」用的網址，**從你家的電腦連不上**。
   - **External Database URL**：給「從外面連進去」用的網址，**要複製的就是這一個**。
5. 點 **External Database URL** 右邊的複製圖示，把它貼到 `.env` 的 `DATABASE_URL=` 後面（做法見 [§3.2](#32-建立-env-檔案)）。

注意事項：

- Render 給的 `External Database URL` 通常已經自帶 `?sslmode=require`，意思是「強制使用 SSL 加密連線」，**直接照抄即可，不要刪掉**。
- 這串網址含有你的**真實密碼**，只可以放進 `.env`。絕對不要貼到 GitHub、聊天室、作業共用的共筆文件等任何別人看得到的地方。
- 若你目前的 IP 不在白名單內，即使複製對了也會連不上，請到該資料庫的 **Access** 分頁加入你的 IP（詳見 [§6 FAQ #1](#1-connection-refused-或-could-not-connect)）。

---

## 2. 環境準備（必做步驟）

請先開啟終端機（Windows 使用 **PowerShell**，macOS 使用 **Terminal**），再依序執行下列步驟。

### 2.1 確認已安裝 Python

```bash
python --version
```

預期輸出類似（只要有 `Python 3.10` 以上就可以）：

```
Python 3.12.4
```

如果出現「找不到指令」的提示，請先安裝 Python 3.10 以上版本，安裝時務必勾選 **Add Python to PATH**。

### 2.2 用 `uv` 建立虛擬環境

本課程統一使用 **uv** 來管理虛擬環境。先進入你的專案資料夾（此處以 `db-demo` 為例，你可以使用自己的資料夾名稱）：

```bash
mkdir db-demo
cd db-demo
```

建立虛擬環境：

```bash
uv venv
```

預期輸出類似：

```
Creating virtual environment at: .venv
```

接著專案裡會多出一個 `.venv` 資料夾，之後安裝的套件都會放在裡面，與電腦上既有的 Python 環境完全隔離。

### 2.3 啟用虛擬環境

**Windows（PowerShell）**：

```powershell
.venv\Scripts\activate
```

**macOS / Linux（Terminal）**：

```bash
source .venv/bin/activate
```

啟用成功後，終端機的提示字元前方會出現 `(.venv)`，代表你已進入虛擬環境。

### 2.4 安裝必要套件

一次安裝兩個套件：

```bash
uv pip install "psycopg[binary]" python-dotenv
```

> 小提醒：`psycopg[binary]` 兩側的引號不能省略，否則某些 shell 會誤解方括號的意義。

預期輸出類似：

```
Resolved 2 packages in ...
Installed 2 packages: psycopg, python-dotenv
```

### 2.5 這兩個套件是做什麼的？

| 套件 | 用途 |
|------|------|
| `psycopg` | **PostgreSQL 的 Python 驅動程式**。Python 本身不懂 SQL，必須靠它才能執行資料庫指令。加上 `[binary]` 表示直接下載已編譯好的版本，**無須自行編譯**，安裝最省事。 |
| `python-dotenv` | 負責讀取 `.env` 檔案。你可以把密碼存放在 `.env` 中，再以一行 `load_dotenv()` 把內容載入環境變數。 |

安裝完成，環境就準備好了。接下來要進入整份文件最重要的章節。

---

## 3. 使用 .env 保護密碼（核心重點）

> 這一章是整份文件的重中之重，請放慢速度仔細閱讀。

### 3.1 為什麼不能把密碼寫死在程式碼裡

先看一個「錯誤示範」——這也是最容易讓學生踩雷的寫法：

```python
import psycopg

# ❌ 嚴重錯誤示範：真實密碼直接寫在程式碼裡
conn = psycopg.connect("postgresql://postgres:PASSWORD@HOST:5432/db_demo")
```

這樣寫會發生什麼事？

1. 你為了繳交作業，把這支程式 `git push` 到 GitHub。
2. 如果專案是公開的（或作業連結被轉貼），**任何人都能看見這串連線資訊**。
3. 有心人士拿到密碼後，就能登入你的資料庫，**竊取資料、刪除資料，甚至弄壞整個資料庫**。
4. 就算當天就刪掉程式碼，密碼只要曾公開在網路上，就可能被搜尋引擎或爬蟲留存，等於永久外洩。

請牢記這條鐵則：**憑證不進版控（Credentials never in version control）**——密碼、金鑰、Token 等機密，一律不該出現在會被上傳 GitHub 的檔案中。

正確做法是：把密碼存放在「不會被上傳」的 `.env` 檔案中，等程式執行時再讀取使用。

### 3.2 建立 `.env` 檔案

在專案根目錄（也就是與 `.venv` 同一層的地方）新增一個名為 `.env` 的檔案。

> ⚠️ **請不要用記事本「另存新檔」後手動改名成 `.env`**，在 Windows 上很容易不小心存成 `.env.txt`。建議直接使用 VS Code：新增檔案 → 儲存時檔名輸入 `.env`，VS Code 就會正確建立。

`.env` 的內容如下（**請將 `你的使用者`、`你的密碼`、`你的主機`、`你的資料庫` 替換成真實資訊**。還不知道這些值從哪裡來？請直接參考 [§1.1 從 Render 後台複製 `External Database URL`](#11-從-render-後台取得外部連線字串)，或者向老師索取）：

```
DATABASE_URL=postgresql://你的使用者:你的密碼@你的主機:5432/你的資料庫
```

每列一個變數，格式為 `變數名稱=值`，兩側不要留空白。`DATABASE_URL` 就是那一整串「連線字串」，只需放在一個變數中即可。

> 如果老師提供的連線字串末尾已有 `?sslmode=require`，直接照抄即可；沒有的話，後面章節也會教你如何加上去。

### 3.3 建立 `.env.example` 範本

接著建立 `.env.example` 檔案，內容**只保留欄位名稱，不含任何真實值**：

```
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE
```

`.env.example` 扮演「範本＋說明文件」的角色，讓檢視你專案的人知道「需要設定哪些環境變數」。它是**可以**上傳 GitHub 的。

重點整理：

| 檔案 | 內容 | 可以上傳 GitHub？ |
|------|------|-------------------|
| `.env` | 真實密碼 | ❌ **絕對不行** |
| `.env.example` | 只有佔位符 | ✅ 可以 |

### 3.4 設定 `.gitignore` 擋住 `.env`

`.gitignore` 是告知 git「哪些檔案不需要追蹤」的清單。請在專案根目錄建立 `.gitignore`（若已有此檔則直接補上），並加入這一行：

```
.env
```

接著用 `git status` 確認 `.env` 不會被追蹤：

```bash
git status
```

預期的輸出中**不應出現**與 `.env` 相關的內容，例如只會看到：

```
On branch main

No commits yet
```

或者只列出其他檔案，但沒有 `.env`。

> ⚠️ **如果你先前已經把 `.env` 推上過 GitHub**，只加 `.gitignore` 還不夠，必須再將 `.env` 從 git 的追蹤清單中移除（檔案本身不會被刪除，只是不再被追蹤）：

```bash
git rm --cached .env
```

執行完再用 `git status` 確認 `.env` 已不在追蹤清單中，接著照常 commit 一次即可。

### 3.5 在 Python 中讀取 `.env`

利用 `python-dotenv` 將 `.env` 的內容載入環境變數，再用 `os.getenv()` 讀取。

```python
import os
from dotenv import load_dotenv

# 讀取同資料夾下的 .env 檔（預設就是找當前目錄的 .env）
load_dotenv()

# 取出 DATABASE_URL；若沒設定的話回傳 None
database_url = os.getenv("DATABASE_URL")

print(database_url)  # 會印出 .env 裡的連線字串
```

> 小提醒：這裡印出連線字串只是為了教學示範。**實際開發時絕對不要 `print` 連線字串或密碼**，以免你截圖分享時把密碼一併洩漏出去。

若 `os.getenv("DATABASE_URL")` 回傳 `None`，代表 `.env` 未建立、路徑不對，或忘了呼叫 `load_dotenv()`。可參考 [§6 常見錯誤 #5](#5-nameerror--attributeerror-找不到-database_url)。

### 3.6 資安檢查清單（安全小提醒）

在把任何東西上傳 GitHub 之前，請逐一確認這張清單：

- [ ] `.env` 有在 `.gitignore` 裡嗎？
- [ ] `git status` 看不到 `.env` 嗎？
- [ ] 我沒有截圖或貼文分享 `.env` 的內容吧？
- [ ] `.env` 沒有放在會被公開下載的資料夾（例如網站的公開目錄）吧？
- [ ] 我沒有在程式裡 `print` 連線字串或密碼吧？

萬一密碼還是外洩了，**先別慌**：到 Render 後台找到你的 PostgreSQL 服務，點選 **Reset credentials**，Render 會重新產生一組新的帳號密碼，舊的立即失效。再把新值更新到自己的 `.env` 即可。

---

## 4. 用 Python 連線 Render PostgreSQL

### 4.1 基本寫法（一步步來）

先認識最基本的連線流程：**連線 → 建立游標 → 執行指令 → 取得結果 → 關閉**。

```python
import os
import psycopg
from dotenv import load_dotenv

# 1. 讀取 .env
load_dotenv()
conninfo = os.getenv("DATABASE_URL")

# 2. 連線（psycopg 會自動解析 DATABASE_URL 這串網址）
conn = psycopg.connect(conninfo)

# 3. 建立游標（cursor），之後都用它來執行 SQL
cur = conn.cursor()

# 4. 執行 SQL 並取得結果
cur.execute("SELECT version();")
result = cur.fetchall()
print(result)

# 5. 關閉游標與連線（有開就要關）
cur.close()
conn.close()
```

預期輸出類似：

```
[('PostgreSQL 16.1 on x86_64-pc-linux-gnu, compiled by ...',)]
```

**重點**：直接把 `DATABASE_URL` 交給 `conninfo` 即可，psycopg 會自動解析網址格式，不需要手動拆解主機、埠號、使用者等欄位。

### 4.2 建議寫法（用 `with` 管理連線）

手動呼叫 `close()` 不僅麻煩，程式一旦發生錯誤還可能漏關。建議改用 **context manager（`with` 語法）**，區塊結束時會**自動關閉連線與交易**：

```python
import os
import psycopg
from dotenv import load_dotenv

load_dotenv()
conninfo = os.getenv("DATABASE_URL")

with psycopg.connect(conninfo) as conn:      # with 結束自動關連線 + commit
    with conn.cursor() as cur:               # with 結束自動關游標
        cur.execute("SELECT version();")
        print(cur.fetchall())
```

後面的範例都使用這個寫法。

> **`with` 的妙處**：`with psycopg.connect(...) as conn:` 區塊**正常跑完會自動 commit**（把變更存進資料庫）；**發生例外會自動 rollback**（把變更全部還原）。因此無須手動呼叫 commit，也不必擔心資料寫到一半出錯。詳情見 [§4.5](#45-交易transaction與-commit-的關係)。

### 4.3 四種基本操作

以下範例預設你已寫好 `load_dotenv()` 並取得 `DATABASE_URL`。為方便說明，這裡假設已存在一張 `products` 資料表，內容如下：

| id | name | price |
|----|------|-------|
| 1 | 鉛筆 | 15 |
| 2 | 筆記本 | 45 |
| 3 | 橡皮擦 | 10 |

#### 操作一：查詢全部（`SELECT *`）

```python
with psycopg.connect(conninfo) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM products;")
        rows = cur.fetchall()       # fetchall() 取回全部資料列
        for row in rows:
            print(row)
```

預期輸出：

```
(1, '鉛筆', 15)
(2, '筆記本', 45)
(3, '橡皮擦', 10)
```

#### 操作二：帶條件的查詢（`WHERE` + 參數化查詢）

學生最常犯的錯誤，就是用 f-string 拼接 SQL。來看看兩種寫法的差別：

```python
# ❌ 禁止！用 f-string 拼 SQL，會被 SQL Injection 攻擊
name = "鉛筆' OR '1'='1"
cur.execute(f"SELECT * FROM products WHERE name = '{name}';")

# ✅ 正確！用 %s 佔位符，參數另外用 tuple 傳
name = "鉛筆"
cur.execute("SELECT * FROM products WHERE name = %s;", (name,))
rows = cur.fetchall()
for row in rows:
    print(row)
```

**為什麼禁止 f-string？** 因為使用者輸入的內容可能被刻意寫成 SQL 指令（例如上面的 `' OR '1'='1'`），直接拼進查詢字串，會讓攻擊者得以「查看不該看到的資料」。改用 `%s` 佔位符後，psycopg 會替你把參數安全地跳脫處理，這種寫法就是**參數化查詢（parameterized query）**。

> 小技巧：就算數值不是來自使用者輸入，也養成一律使用 `%s` 的習慣，就永遠不會踩雷。

預期輸出：

```
(1, '鉛筆', 15)
```

#### 操作三：寫入資料（`INSERT` + commit）

寫入會改變資料庫內容，必須 `commit` 之後才會真正生效：

```python
with psycopg.connect(conninfo) as conn:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO products (name, price) VALUES (%s, %s);",
            ("原子筆", 25),
        )
        # 在 with 區塊裡，正常結束會自動 commit
        print("新增完成！")

# 驗證：另外開一個連線查詢
with psycopg.connect(conninfo) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM products;")
        for row in cur.fetchall():
            print(row)
```

預期輸出：

```
新增完成！
(1, '鉛筆', 15)
(2, '筆記本', 45)
(3, '橡皮擦', 10)
(4, '原子筆', 25)
```

#### 操作四：更新與刪除（`UPDATE` / `DELETE` + commit）

```python
with psycopg.connect(conninfo) as conn:
    with conn.cursor() as cur:
        # 更新：把 id=1 的價格改成 18
        cur.execute("UPDATE products SET price = %s WHERE id = %s;", (18, 1))
        # 刪除：把 id=4 的資料刪掉
        cur.execute("DELETE FROM products WHERE id = %s;", (4,))
        # with 結束自動 commit
        print("更新與刪除完成！")

with psycopg.connect(conninfo) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM products ORDER BY id;")
        for row in cur.fetchall():
            print(row)
```

預期輸出：

```
更新與刪除完成！
(1, '鉛筆', 18)
(2, '筆記本', 45)
(3, '橡皮擦', 10)
```

### 4.4 交易（Transaction）與 commit 的關係

PostgreSQL 有一個重要機制叫**交易（transaction）**：你執行的 `INSERT` / `UPDATE` / `DELETE` 起初都只停留在「暫存區」，**必須 `commit` 之後才會真正寫入資料庫**；一旦 `rollback`（或未 commit 就關閉連線），這些變更就會全部被捨棄。

在 psycopg3 中，`with psycopg.connect(...) as conn:` 已替你處理好這些規則：

- 區塊**正常執行完畢** → 自動 `commit`，變更成功保存。
- 區塊**拋出例外** → 自動 `rollback`，變更全部還原，資料庫維持原狀。

下面的例子刻意讓第二段 SQL 出錯，前面的 `INSERT` 也會被一併還原：

```python
try:
    with psycopg.connect(conninfo) as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO products (name, price) VALUES (%s, %s);", ("膠帶", 20))
            cur.execute("INSERT INTO products (name, price) VALUES (%s, %s);", ("絕對會失敗", 100, 999))  # 參數個數不符，會報錯
except Exception as e:
    print("出錯，前面的 INSERT 會被 rollback：", e)

# 確認：膠帶沒有被存進去
with psycopg.connect(conninfo) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT name FROM products WHERE name = '膠帶';")
        print(cur.fetchall())  # 預期輸出 []，代表沒有資料
```

預期輸出如下（第一行的錯誤訊息可能略有不同，重點是 `[]`）：

```
出錯，前面的 INSERT 會被 rollback：number of parameters ...
[]
```

這就是「要嘛全部成功，要嘛全部都不發生」的保證。

### 4.5 把連線包成 `get_connection()` 函式

每次連線都得重複 `load_dotenv()`、讀取 `DATABASE_URL`、再 `connect`，既冗長又容易出錯。將它包成一個函式會乾淨許多：

```python
import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    """回傳一個已連線的 psycopg 連線物件。"""
    conninfo = os.getenv("DATABASE_URL")
    if not conninfo:
        raise RuntimeError("找不到 DATABASE_URL，請檢查 .env 是否已建立。")
    return psycopg.connect(conninfo)
```

使用方式：

```python
with get_connection() as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT current_database();")
        print(cur.fetchall())
```

---

## 5. 完整可執行範例（主菜）

請將下列內容複製並存成 `db_demo.py`（放在與 `.env` 相同的資料夾），再執行：

```bash
python db_demo.py
```

```python
# db_demo.py — 連線 Render PostgreSQL 的完整示範
import os
import psycopg
from dotenv import load_dotenv

# 1. 讀取 .env，讓 os.getenv 找得到 DATABASE_URL
load_dotenv()

def get_connection():
    """建立連線；若沒設定 DATABASE_URL 就印出友善提示並結束。"""
    conninfo = os.getenv("DATABASE_URL")
    if not conninfo:
        print("找不到 DATABASE_URL！")
        print("請確認：")
        print("  1. 專案根目錄有 .env 檔案")
        print("  2. .env 內有一行：DATABASE_URL=postgresql://使用者:密碼@主機:5432/資料庫")
        print("  3. 沒有的話請向老師索取連線字串")
        raise SystemExit(1)          # 直接結束程式，不繼續往下跑
    return psycopg.connect(conninfo)

# 2. 連線後依序：建表 → 插入 → 查詢 → 顯示
with get_connection() as conn:
    with conn.cursor() as cur:
        # 2-1. 建立資料表（若不存在才建）
        cur.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id    SERIAL PRIMARY KEY,
                name  TEXT NOT NULL,
                price INTEGER NOT NULL
            );
        """)

        # 2-2. 插入資料（參數化查詢，禁止拼字串）
        cur.execute("INSERT INTO products (name, price) VALUES (%s, %s);", ("鉛筆", 15))
        cur.execute("INSERT INTO products (name, price) VALUES (%s, %s);", ("筆記本", 45))
        cur.execute("INSERT INTO products (name, price) VALUES (%s, %s);", ("橡皮擦", 10))

        # 2-3. 查詢全部資料
        cur.execute("SELECT id, name, price FROM products ORDER BY id;")
        rows = cur.fetchall()

        # 2-4. 顯示結果
        print("資料表 products 內容：")
        print(f"{'id':<4}{'name':<10}{'price':>6}")
        print("-" * 20)
        for row in rows:
            print(f"{row[0]:<4}{row[1]:<10}{row[2]:>6}")

# 3. with 結束，連線自動關閉、交易自動 commit
print("程式執行完畢，連線已自動關閉。")
```

預期輸出：

```
資料表 products 內容：
id  name       price
--------------------
1   鉛筆           15
2   筆記本         45
3   橡皮擦         10
程式執行完畢，連線已自動關閉。
```

> 這支程式可以重複執行：`CREATE TABLE IF NOT EXISTS` 能避免建表時重複報錯；而重複插入時 id 會持續累加，這是正常現象。

---

## 6. 常見錯誤與排除（FAQ）

### 1. `connection refused` 或 `could not connect`

**錯誤訊息長這樣**：

```
Connection refused. Check that the hostname and port are correct...
could not connect to host "xxx": Connection refused
```

**原因**：

- 主機網址打錯或漏打。
- 埠號不是 5432。
- 資料庫未啟動，或白名單（IP allow list）未放行你目前的 IP。

**解法**：

1. 回到 Render 後台複製連線字串（記得要拿 **`External Database URL`**，不是 `Internal Database URL`），貼到 `.env`，**務必用複製，不要手動打字**。不知道在哪裡找，請照 [§1.1](#11-從-render-後台取得外部連線字串) 操作。
2. 確認網址裡的埠號是 `5432`。
3. 到 Render 後台的 PostgreSQL 頁面，檢查 **Access** 設定：將目前的 IP 加入白名單（或先暫時開放所有 IP，確認可連線後再收緊）。

### 2. `password authentication failed for user`

**錯誤訊息長這樣**：

```
password authentication failed for user "postgres"
```

**原因**：連線字串中的使用者名稱或密碼有誤（最常見的是密碼打錯）。

**解法**：

1. 開啟 `.env`，重新比對 `使用者:密碼` 兩段是否與老師提供的或 Render 後台顯示的資訊一致。
2. 務必留意 `@` 符號、英文字母大小寫，以及是否混入空格——密碼常常因為「複製時多帶到空白」而驗證失敗。
3. 若密碼真的忘了，可到 Render 後台 **Reset credentials** 重新產生。

### 3. `SSLCertVerificationError` / `ssl connection required`

**錯誤訊息長這樣**：

```
server does not support SSL, but SSL was required
connection was lost: sslmode=require was specified, but the server does not support SSL
```

（另一種是連不上、SSL 憑證驗證失敗的訊息。）

**原因**：Render 的 PostgreSQL **要求必須使用 SSL 加密連線**，而你的連線字串沒有帶上 SSL 參數。

**解法**：在連線字串最後面加上 `?sslmode=require`，例如：

```
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

修改 `.env` 後重新執行程式即可。如果老師提供的連線字串已包含此參數，直接照抄就好。

### 4. `ModuleNotFoundError: No module named 'psycopg'`

**錯誤訊息長這樣**：

```
ModuleNotFoundError: No module named 'psycopg'
```

**原因**：套件尚未安裝，或**忘了啟動虛擬環境**。

**解法**：

1. 確認終端機提示字元前方有 `(.venv)`；如果沒有，Windows 請執行 `.venv\Scripts\activate`（macOS 請執行 `source .venv/bin/activate`）。
2. 重新安裝：`uv pip install "psycopg[binary]" python-dotenv`。
3. 再以 `uv pip list` 檢查套件是否確實安裝、清單中有沒有 `psycopg`。

### 5. `NameError / AttributeError` 找不到 `DATABASE_URL`

**錯誤訊息長這樣**：

```
TypeError: 'NoneType' object is not callable
NameError: name 'os' is not defined
psycopg.ProgrammingError: missing "=" after "postgresql" in connection info string
```

（通常是 `os.getenv("DATABASE_URL")` 回傳了 `None`，後續使用時才報錯。）

**原因**：`.env` 未建立、檔案位置不對，或沒有呼叫 `load_dotenv()`。

**解法**：

1. 確認專案根目錄存在 `.env`（可用 `ls` 或檔案總管查看，檔名必須真的是 `.env`，而不是 `.env.txt`）。
2. 確認 `.env` 與你的 `.py` 位於同一資料夾，因為 `load_dotenv()` 預設會讀取當前資料夾的 `.env`。
3. 確認 `.py` 開頭附近有 `from dotenv import load_dotenv` 與 `load_dotenv()`。
4. 也可以明確指定路徑：`load_dotenv(".env")`。
5. 最後可用 `print(os.getenv("DATABASE_URL"))` 自行確認是否為 `None`（檢查完請記得移除這行）。

---

## 7. 練習題

> 三題由淺入深，請先自己動手試試，再看折疊區內的答案（點開 `<details>` 即可查看）。

### 練習 1：印出伺服器版本與目前時間

修改連線程式，在連線成功後印出資料庫的「伺服器版本」與「目前時間」。

- **提示**：用 `SELECT version();` 取得版本，用 `SELECT NOW();` 取得目前時間，兩句都寫在同一支程式裡。
- **答案**：

<details>
<summary>點我展開解答（練習 1）</summary>

```python
import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
    with conn.cursor() as cur:
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print("伺服器版本：", version[0])

        cur.execute("SELECT NOW();")
        now = cur.fetchone()
        print("目前時間：", now[0])
```

</details>

### 練習 2：新增「學生」資料表並插入資料

新增一張 `students` 資料表（欄位：`id`、`name`、`department`），插入 3 筆你自己的資料，再查詢出來印在畫面上。

- **提示**：可參考 [§5 完整範例](#5-完整可執行範例主菜) 的建表方式，使用 `CREATE TABLE IF NOT EXISTS`。插入資料時務必使用 `%s` 參數化查詢。
- **答案**：

<details>
<summary>點我展開解答（練習 2）</summary>

```python
import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

with psycopg.connect(os.getenv("DATABASE_URL")) as conn:
    with conn.cursor() as cur:
        # 建表
        cur.execute("""
            CREATE TABLE IF NOT EXISTS students (
                id         SERIAL PRIMARY KEY,
                name       TEXT NOT NULL,
                department TEXT NOT NULL
            );
        """)

        # 插入 3 筆（換成你自己的資料）
        cur.execute("INSERT INTO students (name, department) VALUES (%s, %s);", ("王小明", "資訊工程系"))
        cur.execute("INSERT INTO students (name, department) VALUES (%s, %s);", ("林小美", "企業管理系"))
        cur.execute("INSERT INTO students (name, department) VALUES (%s, %s);", ("張小華", "資料科學系"))

        # 查詢並印出
        cur.execute("SELECT id, name, department FROM students ORDER BY id;")
        for row in cur.fetchall():
            print(row)
```

</details>

### 練習 3：故意打錯密碼，觀察錯誤

將 `.env` 中的密碼改成錯誤的，執行連線程式觀察錯誤訊息；再把密碼改回正確的，確認能重新連上。

- **提示**：修改 `.env` 後，執行 [§4.1](#41-基本寫法一步步來) 的連線程式，觀察錯誤訊息長什麼樣子，再對照 [§6 FAQ #2](#2-password-authentication-failed-for-user)。最後記得把密碼改回來，並確認 `.env` 仍在 `.gitignore` 中。
- **答案**：

<details>
<summary>點我展開解答（練習 3）</summary>

**步驟**：

1. 用 VS Code 開啟 `.env`，把密碼那段改成錯誤的（例如 `DATABASE_URL=postgresql://postgres:WRONG_PASSWORD@你的主機:5432/你的資料庫`）。
2. 執行你的連線程式，預期會看到：

   ```
   password authentication failed for user "postgres"
   ```

3. 這代表**連線已成功找到主機**，只是身分驗證沒有通過——問題幾乎可以鎖定在使用者或密碼。
4. 把 `.env` 的密碼改回正確的，再執行一次，預期就能正常連上。
5. 最後用 `git status` 確認 `.env` 沒有出現在追蹤清單（它已被 `.gitignore` 排除）。

> 這個練習讓你「親眼看過」錯誤長什麼樣，日後再遇到，你就知道要第一時間檢查 `.env` 的使用者與密碼。

</details>

---

## 8. 參考資料

- [Render PostgreSQL 官方文件](https://render.com/docs/databases-and-persistence)：建立與管理資料庫，並取得連線字串、設定白名單。
- [psycopg 官方文件](https://www.psycopg.org/psycopg3/)：psycopg3 的完整 API、交易行為與參數化查詢說明。
- [python-dotenv 官方文件](https://saurabh-kumar.com/python-dotenv/)：`load_dotenv`、`os.getenv` 的詳細用法與設定選項。

---

## 9. 名詞對照表

| 英文 | 中文翻譯建議 |
|------|------|
| Connection String / DATABASE_URL | 連線字串 |
| Environment Variable | 環境變數 |
| Secret / Credential | 機密 / 憑證 |
| psycopg | psycopg（PostgreSQL 的 Python 驅動程式） |
| commit | 提交（把寫入真正存進資料庫） |
| query | 查詢 |
| parameterized query | 參數化查詢 |
