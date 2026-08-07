import os
import joblib
import httpx
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import gradio as gr

plt.rcParams["font.sans-serif"] = ["Microsoft JhengHei", "SimHei", "Arial"]
plt.rcParams["axes.unicode_minus"] = False

API_BASE = os.environ.get("API_BASE_URL", "http://127.0.0.1:8000")
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "salary_model.joblib")

EDU_LEVELS = ["高中以下", "大學", "碩士以上"]
CITIES = ["城市A", "城市B", "城市C"]
MODEL_TYPES = ["LinearRegression", "Lasso", "Ridge"]

THEME = gr.themes.Ocean(
    primary_hue=gr.themes.colors.blue,
    secondary_hue=gr.themes.colors.sky,
    neutral_hue=gr.themes.colors.slate,
)

CSS = """
.gradio-container {max-width: 1100px !important; margin: 0 auto !important;}
#hero {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0ea5e9 100%);
    border-radius: 18px; padding: 34px 38px; color: #fff;
    box-shadow: 0 12px 30px rgba(15, 23, 42, .25); margin-bottom: 6px;
}
#hero h1 {font-size: 30px; font-weight: 800; margin: 0 0 6px 0; letter-spacing: 1px;}
#hero p {margin: 0; font-size: 15px; opacity: .92; line-height: 1.6;}
.badge {
    display: inline-block; background: rgba(255,255,255,.16);
    border: 1px solid rgba(255,255,255,.3); border-radius: 999px;
    padding: 3px 14px; font-size: 12px; margin-right: 8px; margin-top: 10px;
}
.salary-card {
    background: linear-gradient(135deg, #eef6ff 0%, #f8fbff 100%);
    border: 1px solid #dbeafe; border-radius: 16px; padding: 26px 30px;
    text-align: center; box-shadow: 0 8px 20px rgba(59,130,246,.12);
}
.salary-card .cap {font-size: 13px; color: #64748b; letter-spacing: 2px;}
.salary-card .val {font-size: 42px; font-weight: 800; color: #0f172a; line-height: 1.2;}
.salary-card .val span {color: #1d4ed8;}
.salary-card .sub {font-size: 15px; color: #475569; margin-top: 8px;}
.salary-card .sub b {color: #16a34a; font-size: 18px;}
.info-grid {display:flex; gap:12px; margin-top:8px; flex-wrap: wrap;}
.info-chip {
    flex:1; min-width:150px; background:#fff; border:1px solid #e2e8f0;
    border-radius:12px; padding:14px 18px; text-align:center;
}
.info-chip .k {font-size:12px; color:#94a3b8;}
.info-chip .v {font-size:20px; font-weight:700; color:#0f172a; margin-top:2px;}
footer {text-align:center; color:#94a3b8; font-size:12px; margin-top:10px;}
footer a {color:#2563eb; text-decoration:none;}
"""


def _call_api(path: str, payload: dict) -> dict:
    resp = httpx.post(f"{API_BASE}{path}", json=payload, timeout=300)
    if resp.status_code != 200:
        try:
            detail = resp.json().get("detail", "未知錯誤")
        except Exception:
            detail = resp.text
        raise RuntimeError(f"API 錯誤 ({resp.status_code}): {detail}")
    return resp.json()


def predict_salary(years_experience: float, education_level: str, city: str):
    try:
        data = _call_api("/predict", {
            "years_experience": float(years_experience),
            "education_level": education_level,
            "city": city,
        })
    except Exception as e:
        return (
            None,
            None,
            f'<div class="salary-card" style="border-color:#fecaca;background:#fef2f2;">'
            f'<div class="val" style="color:#dc2626;">預測失敗</div>'
            f'<div class="sub">{e}</div></div>',
        )
    monthly = data["predicted_salary"]
    annual = data["estimated_annual_salary"]
    card = (
        f'<div class="salary-card">'
        f'<div class="cap">PREDICTED MONTHLY SALARY</div>'
        f'<div class="val">NT$ <span>{monthly:,.1f}</span> 萬</div>'
        f'<div class="sub">預估年薪（14 個月）：<b>NT$ {annual:,.1f} 萬</b></div>'
        f'<div class="sub">年資 {years_experience:g} 年 ｜ 學歷：{education_level} ｜ {city}</div>'
        f'</div>'
    )
    return monthly, annual, card


def _build_coef_plot(feature_coefs: dict):
    df = pd.DataFrame(feature_coefs.items(), columns=["特徵", "權重"]).sort_values("權重")
    fig, ax = plt.subplots(figsize=(7, 3.6))
    colors = ["#3b82f6" if v >= 0 else "#f43f5e" for v in df["權重"]]
    ax.barh(df["特徵"], df["權重"], color=colors, edgecolor="none")
    ax.axvline(0, color="#94a3b8", lw=1, ls="--")
    ax.set_title("特徵權重係數", fontsize=13, pad=10)
    ax.spines[["top", "right"]].set_visible(False)
    ax.set_xlabel("權重")
    fig.tight_layout()
    return fig


def train_model(test_size: float, random_state: int, model_type: str, alpha: float):
    try:
        data = _call_api("/train", {
            "test_size": float(test_size),
            "random_state": int(random_state),
            "model_type": model_type,
            "alpha": float(alpha),
        })
    except Exception as e:
        return None, f"### 訓練失敗\n\n{e}", None, None

    coef_df = pd.DataFrame(
        data["feature_coefs"].items(), columns=["特徵", "權重"]
    ).sort_values("權重", ascending=False)
    fig = _build_coef_plot(data["feature_coefs"])
    msg = (
        f"### 訓練完成\n\n"
        f"- 模型：**{data['model_type']}** (α={data['alpha']:g})\n"
        f"- 測試集 **R² = {data['r2']:.4f}**\n"
        f"- 截距：{data['intercept']:.4f} ｜ 訓練耗時：**{data['train_time']:.3f} 秒**\n\n"
        f"> {data['message']}"
    )
    return data["r2"], msg, coef_df, fig


def load_model_info():
    if not os.path.exists(MODEL_PATH):
        return (
            "尚未訓練模型",
            None,
            None,
            '已儲存的模型不存在，請先在「模型訓練」分頁訓練一次。',
        )
    m = joblib.load(MODEL_PATH)
    coef_df = pd.DataFrame(
        m["feature_coefs"].items(), columns=["特徵", "權重"]
    ).sort_values("權重", ascending=False)
    fig = _build_coef_plot(m["feature_coefs"])
    chips = (
        f'<div class="info-grid">'
        f'<div class="info-chip"><div class="k">模型類型</div>'
        f'<div class="v">{m.get("model_type", "-")}</div></div>'
        f'<div class="info-chip"><div class="k">測試集 R²</div>'
        f'<div class="v">{m.get("r2", "-"):.4f}</div></div>'
        f'<div class="info-chip"><div class="k">特徵個數</div>'
        f'<div class="v">{len(m.get("feature_names", []))}</div></div>'
        f'<div class="info-chip"><div class="k">α</div>'
        f'<div class="v">{m.get("alpha", "-"):g}</div></div>'
        f'</div>'
    )
    return m.get("model_type", "-"), m.get("r2"), fig, chips


def build_ui() -> gr.Blocks:
    with gr.Blocks(title="薪資預測系統") as demo:
        gr.HTML(
            f"""
            <div id="hero">
                <h1>薪資預測系統</h1>
                <p>整合 FastAPI 後端 API 與 Gradio 前端介面，
                支援多元線性迴歸 / Lasso / Ridge 三種演算法，即時線上訓練與預測。</p>
                <span class="badge">FastAPI</span>
                <span class="badge">Gradio</span>
                <span class="badge">scikit-learn</span>
            </div>
            """
        )

        with gr.Tabs():
            with gr.Tab("薪資預測"):
                with gr.Row():
                    with gr.Column(scale=1):
                        years_slider = gr.Slider(
                            minimum=0, maximum=50, step=0.1, value=5,
                            label="工作年資 (年)",
                        )
                        edu_radio = gr.Radio(EDU_LEVELS, value="大學", label="最高學歷")
                        city_radio = gr.Radio(CITIES, value="城市A", label="工作城市")
                        predict_btn = gr.Button("開始預測", variant="primary", size="lg")
                    with gr.Column(scale=1):
                        monthly_out = gr.Number(label="預測月薪（萬元）", precision=2)
                        annual_out = gr.Number(label="預估年薪（萬元，14 個月）", precision=2)
                        card_out = gr.HTML(
                            '<div class="salary-card">'
                            '<div class="cap">PREDICTED MONTHLY SALARY</div>'
                            '<div class="val" style="color:#94a3b8;">—</div>'
                            '<div class="sub">輸入條件後點擊「開始預測」</div></div>'
                        )
                predict_btn.click(
                    predict_salary,
                    inputs=[years_slider, edu_radio, city_radio],
                    outputs=[monthly_out, annual_out, card_out],
                )

            with gr.Tab("模型訓練"):
                with gr.Row():
                    with gr.Column(scale=1):
                        test_size_slider = gr.Slider(
                            minimum=0.1, maximum=0.5, step=0.05, value=0.2,
                            label="測試集比例 (test_size)",
                        )
                        random_state_num = gr.Number(value=76, precision=0, label="隨機種子")
                        model_type_dd = gr.Dropdown(
                            MODEL_TYPES, value="LinearRegression", label="模型演算法",
                        )
                        alpha_slider = gr.Slider(
                            minimum=0.001, maximum=100, step=0.1, value=1.0,
                            label="正則化強度 α (Lasso / Ridge)",
                            info="LinearRegression 不影響",
                        )
                        train_btn = gr.Button("開始訓練", variant="primary", size="lg")
                    with gr.Column(scale=1):
                        r2_out = gr.Number(label="測試集 R²", precision=4)
                        train_msg = gr.Markdown("尚未訓練")
                        coef_table = gr.Dataframe(
                            headers=["特徵", "權重"], label="特徵權重",
                            interactive=False, wrap=True,
                        )
                        coef_plot = gr.Plot()
                train_btn.click(
                    train_model,
                    inputs=[test_size_slider, random_state_num, model_type_dd, alpha_slider],
                    outputs=[r2_out, train_msg, coef_table, coef_plot],
                )

            with gr.Tab("模型資訊"):
                with gr.Row():
                    with gr.Column():
                        info_chips = gr.HTML('<div class="info-grid"></div>')
                        info_model_type = gr.Textbox(label="目前模型類型", interactive=False)
                        info_r2 = gr.Number(label="目前測試集 R²", precision=4)
                    with gr.Column():
                        info_plot = gr.Plot()
                        info_table = gr.Dataframe(
                            headers=["特徵", "權重"], label="特徵權重",
                            interactive=False, wrap=True,
                        )
                        refresh_btn = gr.Button("重新整理", size="sm")
                demo.load(load_model_info, outputs=[info_model_type, info_r2, info_plot, info_chips])
                refresh_btn.click(
                    load_model_info,
                    outputs=[info_model_type, info_r2, info_plot, info_chips],
                )

        gr.HTML('<footer>薪資預測系統 ｜ API 文件：<a href="/docs" target="_blank">/docs (Swagger)</a></footer>')

    return demo
