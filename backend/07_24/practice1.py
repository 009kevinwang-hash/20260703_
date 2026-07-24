import gradio as gr
#建立Interface實體
def greet( name, intensity):
    return "Hello ," + name + "!" * int(intensity)
    

demo = gr.Interface(
    fn=greet,
    inputs = ["text","slider"],
    outputs = ["text"],
    examples = [["田大牛",2], ["田XX",1], ["陳大明",1]]

)

demo.launch()