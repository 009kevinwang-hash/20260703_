from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.responses import HTMLResponse
from fastapi.openapi.docs import get_swagger_ui_html
from pydantic import BaseModel, Field
import uvicorn
import yfinance as yf
import requests
from datetime import datetime, timedelta
from typing import Literal

# ---------- Pydantic Models ----------

class StockRecord(BaseModel):
    datetime: str = Field(..., description="時間", examples=["2026-07-21 09:30:00"])
    open: float = Field(..., description="開盤價", examples=[2495.0])
    high: float = Field(..., description="最高價", examples=[2505.0])
    low: float = Field(..., description="最低價", examples=[2475.0])
    close: float = Field(..., description="收盤價", examples=[2505.0])
    volume: int = Field(..., description="成交量", examples=[111091])

class StockResponse(BaseModel):
    symbol: str = Field(..., description="完整股票代碼（含市場後綴）", examples=["2330.TW"])
    name: str = Field("", description="公司名稱", examples=["台積電"])
    period: str = Field(..., description="查詢的時間區間", examples=["1d"])
    count: int = Field(..., description="資料筆數", examples=[78])
    data: list[StockRecord] = Field(..., description="股票歷史資料")

class ErrorResponse(BaseModel):
    detail: str = Field(..., description="錯誤訊息", examples=["找不到 2330.TW 的資料"])

# ---------- FastAPI App ----------

app = FastAPI(
    title="股票查詢 API",
    description="提供全球股票歷史資料查詢，支援台股、港股、倫敦及美股。\n\n"
                "- 台股/港股：紅漲綠跌\n- 美股/其他：綠漲紅跌",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
)

@app.get("/docs", include_in_schema=False)
def swagger_ui():
    return get_swagger_ui_html(openapi_url="/openapi.json", title="股票查詢 API - Swagger")

@app.get("/", response_class=HTMLResponse, include_in_schema=False)
def root():
    return HTML_PAGE

HTML_PAGE = """
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <title>股票查詢</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 30px;
            background: linear-gradient(135deg, #0a1628 0%, #1a2a4a 40%, #0d2137 100%);
            background-attachment: fixed;
            color: #e0e0e0;
            min-height: 100vh;
        }
        body::before {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1920&q=80') center/cover no-repeat;
            opacity: 0.08;
            z-index: -1;
        }
        .container {
            background: rgba(255, 255, 255, 0.92);
            border-radius: 12px;
            padding: 30px;
            color: #333;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        h1 { text-align: center; color: #1a5276; margin-bottom: 25px; }
        .form-group { margin-bottom: 15px; }
        label { display: inline-block; width: 80px; font-weight: bold; }
        input, select { padding: 6px 10px; width: 200px; }
        button { padding: 8px 20px; background: #1a5276; color: white; border: none; cursor: pointer; font-size: 16px; border-radius: 4px; }
        button:hover { background: #2e86c1; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
        th { background: #1a5276; color: white; text-align: center; }
        td:first-child { text-align: left; }
        tr:nth-child(even) { background: #f2f7fb; }
        #error { color: #c0392b; margin-top: 10px; font-weight: bold; }
        #info { color: #1a5276; margin-top: 10px; font-weight: bold; font-size: 16px; }
    </style>
</head>
<body>
    <div class="container">
    <h1>股 票 查 詢 系 統</h1>
    <div class="form-group">
        <label>股票代碼:</label>
        <input type="text" id="symbol" placeholder="例: 2330, AAPL" />
    </div>
    <div class="form-group">
        <label>市場:</label>
        <select id="market">
            <option value=".TW">台灣 (.TW)</option>
            <option value=".HK">香港 (.HK)</option>
            <option value=".L">倫敦 (.L)</option>
            <option value="">美股 (無後綴)</option>
        </select>
    </div>
    <div class="form-group">
        <label>時間區間:</label>
        <select id="period">
            <option value="1d">1 天</option>
            <option value="5d">最近 5 日</option>
            <option value="1w">1 週</option>
            <option value="1m">1 個月</option>
            <option value="1y">1 年</option>
        </select>
    </div>
    <button onclick="fetchData()">查詢</button>
    <div id="error"></div>
    <div id="info"></div>
    <div id="result"></div>

    <script>
    async function fetchData() {
        const symbol = document.getElementById('symbol').value.trim();
        const market = document.getElementById('market').value;
        const period = document.getElementById('period').value;
        const errorDiv = document.getElementById('error');
        const infoDiv = document.getElementById('info');
        const resultDiv = document.getElementById('result');

        errorDiv.textContent = '';
        infoDiv.textContent = '';
        resultDiv.innerHTML = '';

        if (!symbol) { errorDiv.textContent = '請輸入股票代號'; return; }

        try {
            const resp = await fetch(`/stock/${encodeURIComponent(symbol)}?period=${period}&market=${encodeURIComponent(market)}`);
            if (!resp.ok) {
                const err = await resp.json();
                errorDiv.textContent = err.detail || '查詢失敗';
                return;
            }
            const json = await resp.json();
            infoDiv.textContent = `${json.name ? json.name + ' ' : ''}(${json.symbol}) ｜ 共 ${json.count} 筆資料`;

            let html = '<table><tr><th>時間</th><th>開盤價</th><th>最高價</th><th>最低價</th><th>收盤價</th><th>漲跌</th><th>成交量</th></tr>';
            for (const r of json.data) {
                const diff = r.close - r.open;
                const pct = r.open !== 0 ? ((diff / r.open) * 100).toFixed(2) : '0.00';
                let color = '#666';
                if (diff > 0) color = (market === '.TW' || market === '.HK') ? '#dc3545' : '#28a745';
                else if (diff < 0) color = (market === '.TW' || market === '.HK') ? '#28a745' : '#dc3545';
                const sign = diff > 0 ? '+' : '';
                html += `<tr><td>${r.datetime}</td><td>${r.open}</td><td>${r.high}</td><td>${r.low}</td><td>${r.close}</td><td style="color:${color};font-weight:bold">${sign}${diff.toFixed(2)} (${sign}${pct}%)</td><td>${r.volume.toLocaleString()}</td></tr>`;
            }
            html += '</table>';
            resultDiv.innerHTML = html;
        } catch (e) {
            errorDiv.textContent = '網路錯誤: ' + e.message;
        }
    }
    </script>
    </div>
</body>
</html>
"""

PERIOD_MAP = {
    "1d": {"period": "1d", "interval": "5m"},
    "5d": {"period": "5d", "interval": "15m"},
    "1w": {"period": "5d", "interval": "1h"},
    "1m": {"period": "1mo", "interval": "1d"},
    "1y": {"period": "1y", "interval": "1d"},
}

def get_twse_name(symbol: str) -> str:
    try:
        today = datetime.now()
        r = requests.get(
            "https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY",
            params={"response": "json", "date": today.strftime("%Y%m%d"), "stockNo": symbol},
            timeout=5,
        )
        title = r.json().get("title", "")
        parts = title.split()
        idx = parts.index(symbol) + 1 if symbol in parts else -1
        if 0 < idx < len(parts):
            return parts[idx]
    except Exception:
        pass
    return ""

@app.get(
    "/stock/{symbol}",
    response_model=StockResponse,
    responses={
        400: {"model": ErrorResponse, "description": "不支援的時間區間"},
        404: {"model": ErrorResponse, "description": "找不到該股票資料"},
        500: {"model": ErrorResponse, "description": "伺服器內部錯誤"},
    },
    tags=["股票查詢"],
    summary="查詢股票歷史資料",
    description="根據股票代碼、市場及時間區間，回傳歷史 OHLCV 資料。",
)
def get_stock(
    symbol: str = Path(..., description="股票代碼，如 2330、AAPL", examples=["2330"]),
    period: Literal["1d", "5d", "1w", "1m", "1y"] = Query("1d", description="時間區間：1d=1天, 5d=5日, 1w=1週, 1m=1個月, 1y=1年"),
    market: Literal[".TW", ".HK", ".L", ""] = Query(".TW", description="市場後綴：.TW=台灣, .HK=香港, .L=倫敦, 空字串=美股"),
):
    try:
        query_symbol = f"{symbol}{market}"

        ticker = yf.Ticker(query_symbol)
        params = PERIOD_MAP[period]
        df = ticker.history(period=params["period"], interval=params["interval"])

        if df.empty:
            raise HTTPException(status_code=404, detail=f"找不到 {query_symbol} 的資料")

        company_name = ticker.info.get("shortName", "")
        if market == ".TW":
            tw_name = get_twse_name(symbol)
            if tw_name:
                company_name = tw_name

        records = []
        for date, row in df.iterrows():
            records.append({
                "datetime": date.strftime("%Y-%m-%d %H:%M:%S"),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "close": round(row["Close"], 2),
                "volume": int(row["Volume"]),
            })

        return {"symbol": query_symbol, "name": company_name, "period": period, "count": len(records), "data": records}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("practice4:app", reload=True)
