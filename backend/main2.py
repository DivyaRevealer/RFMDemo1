from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import pandas as pd
import io
import requests
import smtplib
from email.message import EmailMessage
from rfm import calculate_rfm

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
    # Simulate adding contact info
    df["Phone"] = df["CustomerID"].apply(lambda x: f"+91123456789{x % 10}")
    df["Email"] = df["CustomerID"].apply(lambda x: f"user{x}@example.com")
    rfm_data = calculate_rfm(df)
    rfm_data = rfm_data.merge(df[["CustomerID", "Phone", "Email"]].drop_duplicates(), on="CustomerID", how="left")
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
    if rfm_data.empty:
        return {"error": "No RFM data available. Please upload data first."}

    users = rfm_data[rfm_data['Segment'] == segment]
    sent = []

    for _, row in users.iterrows():
        phone = row['Phone']
        email = row['Email']
        name = row['CustomerID']

        # --- Simulated WhatsApp ---
        wa_message = f"Hi {name}, you're in our {segment} group! Enjoy a special offer just for you."
        print(f"[WhatsApp] To: {phone} | Msg: {wa_message}")
        # Uncomment and replace with real API call
        # requests.post("https://api.whatsapp.com/send", data={"to": phone, "message": wa_message})

        # --- Simulated Email ---
        try:
            msg = EmailMessage()
            msg.set_content(wa_message)
            msg["Subject"] = f"Offer for {segment} segment"
            msg["From"] = "noreply@example.com"
            msg["To"] = email
            # Uncomment for real SMTP
            # with smtplib.SMTP("localhost") as server:
            #     server.send_message(msg)
            print(f"[Email] To: {email} | Msg: {wa_message}")
        except Exception as e:
            print(f"Email error: {e}")

        sent.append(str(name))

    return {"status": f"Campaign sent to {len(sent)} {segment} customers"}
