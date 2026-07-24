import gradio as gr

# history 參數會從 gr.State(value=[]) 傳入
def store_message(message: str, history: list[str]):
    output = {
        "目前訊息": message,
        "歷史訊息 (倒序展示)": history[::-1]
    }
    history.append(message)
    # 同時回傳 UI 顯示內容與更新後的 history 狀態
    return output, history

demo = gr.Interface(
    fn=store_message,
    # inputs 與 outputs 的最後一個元素必須是 gr.State
    inputs=[
        gr.Textbox(label="請輸入您的訊息", placeholder="在此輸入文字..."), 
        gr.State(value=[])
    ],
    outputs=[
        gr.JSON(label="訊息日誌"), 
        gr.State()
    ],
    title="💬 個人歷史訊息記錄器",
    description="您在此分頁輸入的每一筆訊息都會被暫存在會話狀態中，其他連線的使用者不會看到您的資料。"
)

demo.launch()