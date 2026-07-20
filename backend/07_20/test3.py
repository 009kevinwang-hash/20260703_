#從fastapi這個model再import一個叫FastAPI的class進來
from fastapi import FastAPI
import uvicorn

app = FastAPI()

#前面有加@代表它是使用decorator，記得使用decorator時，下面一定要加一個function，真假不重要，但一定要有return 值 
@app.get("/") #'/'線是根目錄
def read_root():
    return {"Hello": "World Robert"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    return {"item_id": item_id, "q": q}

if __name__ == "__main__":
    uvicorn.run("practice2:app",reload=True)