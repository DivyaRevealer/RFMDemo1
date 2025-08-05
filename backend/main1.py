from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import io
from rfm import calculate_rfm
from fastapi.responses import FileResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

rfm_data = pd.DataFrame()

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global rfm_data
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents), parse_dates=["InvoiceDate"])
    rfm_data = calculate_rfm(df)
    return {"message": "File processed successfully", "rows": len(rfm_data)}

@app.get("/rfm")
async def get_rfm():
    return JSONResponse(content=rfm_data.to_dict(orient="records"))

@app.get("/export")
async def export_excel():
    output_path = "rfm_export.xlsx"
    rfm_data.to_excel(output_path, index=False)
    return FileResponse(path=output_path, filename="rfm_segments.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

@app.post("/campaign/{segment}")
async def trigger_campaign(segment: str):
    # In real: send WhatsApp/Email via API
    return {"status": f"Campaign triggered for segment: {segment}"}

@app.get("/export")
async def export_excel():
    output_path = "rfm_export.xlsx"
    rfm_data.to_excel(output_path, index=False)
    return FileResponse(path=output_path, filename="rfm_segments.xlsx")
