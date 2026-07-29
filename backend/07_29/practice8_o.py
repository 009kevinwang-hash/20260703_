#使用.then,可以使用一種以上的

import gradio as gr
import random
import time


with gr.Blocks() as demo:
    chatbox = gr.Chatbot(label="對話視窗")
    msg = gr.Textbox(label="請輸入您的訊息 (按 Enter 發送)")
    clear = gr.Button("清空對話記錄")

    def user_action(user_message, history):
        history.append({"role": "user", "content": user_message})
        return "", history

    def bot_action(history):
        time.sleep(1.5)
        history.append({"role": "assistant", "content": random.choice(["你好！", "請繼續說", "有意思"])})
        return history

    msg.submit(
        fn=user_action, inputs=[msg, chatbox], outputs=[msg, chatbox], queue=False
    ).then(
        fn=bot_action,
        inputs=chatbox,
        outputs=chatbox,
    )

if __name__ == "__main__":
    demo.launch()
