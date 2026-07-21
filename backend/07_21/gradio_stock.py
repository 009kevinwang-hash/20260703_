import gradio as gr
import yfinance as yf
import requests
import pandas as pd
from datetime import datetime

PERIOD_MAP = {
    "1 天": {"period": "1d", "interval": "5m"},
    "最近 5 日": {"period": "5d", "interval": "15m"},
    "1 週": {"period": "5d", "interval": "1h"},
    "1 個月": {"period": "1mo", "interval": "1d"},
    "1 年": {"period": "1y", "interval": "1d"},
}

MARKET_MAP = {
    "台灣 (.TW)": ".TW",
    "香港 (.HK)": ".HK",
    "倫敦 (.L)": ".L",
    "美股 (無後綴)": "",
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


def query_stock(symbol: str, market: str, period: str):
    if not symbol.strip():
        return None, "", "請輸入股票代碼"

    symbol = symbol.strip()
    market_suffix = MARKET_MAP.get(market, ".TW")
    query_symbol = f"{symbol}{market_suffix}"

    try:
        ticker = yf.Ticker(query_symbol)
        params = PERIOD_MAP[period]
        df = ticker.history(period=params["period"], interval=params["interval"])

        if df.empty:
            return None, "", f"找不到 {query_symbol} 的資料"

        company_name = ticker.info.get("shortName", "")
        if market_suffix == ".TW":
            tw_name = get_twse_name(symbol)
            if tw_name:
                company_name = tw_name

        display_name = f"{company_name} ({query_symbol})" if company_name else query_symbol

        records = []
        for date, row in df.iterrows():
            diff = round(row["Close"] - row["Open"], 2)
            pct = round((diff / row["Open"]) * 100, 2) if row["Open"] != 0 else 0
            sign = "+" if diff > 0 else ""
            change_str = f"{sign}{diff} ({sign}{pct}%)"

            if market_suffix in (".TW", ".HK"):
                change_color = "red" if diff > 0 else "green" if diff < 0 else "gray"
            else:
                change_color = "green" if diff > 0 else "red" if diff < 0 else "gray"

            records.append({
                "時間": date.strftime("%Y-%m-%d %H:%M"),
                "開盤價": round(row["Open"], 2),
                "最高價": round(row["High"], 2),
                "最低價": round(row["Low"], 2),
                "收盤價": round(row["Close"], 2),
                "漲跌": change_str,
                "漲跌.color": change_color,
                "成交量": f"{int(row['Volume']):,}",
            })

        df_display = pd.DataFrame(records)
        df_display = df_display.drop(columns=["漲跌.color"])

        info = f"**{display_name}** ｜ 共 {len(records)} 筆資料"
        return df_display, info, ""

    except Exception as e:
        return None, "", f"查詢失敗: {e}"


CSS = """
#title { text-align: center; color: #1a5276; }
#query-btn { background: #1a5276 !important; color: white !important; font-size: 16px !important; }
#query-btn:hover { background: #2e86c1 !important; }
#info-text { font-size: 18px; font-weight: bold; color: #1a5276; }
#error-text { color: #c0392b; font-weight: bold; }
"""

with gr.Blocks(
    title="股票查詢系統",
) as demo:
    gr.Markdown("# 股票查詢系統", elem_id="title")
    gr.Markdown("直接查詢 Yahoo Finance 股票歷史資料，支援台股、港股、倫敦及美股。")

    with gr.Row():
        symbol_input = gr.Textbox(label="股票代碼", placeholder="例: 2330, AAPL", scale=3)
        market_input = gr.Dropdown(choices=list(MARKET_MAP.keys()), value="台灣 (.TW)", label="市場", scale=2)
        period_input = gr.Dropdown(choices=list(PERIOD_MAP.keys()), value="1 天", label="時間區間", scale=2)
        query_btn = gr.Button("查詢", elem_id="query-btn", scale=1)

    info_text = gr.Markdown("", elem_id="info-text")
    error_text = gr.Markdown("", elem_id="error-text")
    result_table = gr.Dataframe(headers=["時間", "開盤價", "最高價", "最低價", "收盤價", "漲跌", "成交量"], interactive=False)

    query_btn.click(fn=query_stock, inputs=[symbol_input, market_input, period_input], outputs=[result_table, info_text, error_text])
    symbol_input.submit(fn=query_stock, inputs=[symbol_input, market_input, period_input], outputs=[result_table, info_text, error_text])


if __name__ == "__main__":
    demo.launch(theme=gr.themes.Soft(primary_hue="blue", neutral_hue="slate"), css=CSS)
