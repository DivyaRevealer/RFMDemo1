import os
import re
import requests
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env
# load_dotenv()



#router = APIRouter(tags=["templates"])
router = APIRouter(prefix="/campaign/templates", tags=["templates"])

#@router.post("/templates")
@router.post("/create-template")
async def create_template(req: Request):
    payload = await req.json()
    #api_key = "skI7lyZ0g0qj4dHDvwJ5k"
    #channel = payload.pop("channel", os.getenv("CHANNEL_NUMBER", "917996666220"))
    #channel = "917996666220"
    API_KEY = os.getenv("API_KEY")
    CHANNEL_NUMBER = os.getenv("CHANNEL_NUMBER")     
    url = f"https://cloudapi.wbbox.in/api/v1.0/create-templates/{CHANNEL_NUMBER}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        print("response------ ",response)
        
    except requests.HTTPError as e:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()
    #return "success"


@router.post("/sync-template")
async def sync_template(req: Request):
    payload = await req.json()
    print("payload------------ ",payload.get("name"))
    #api_key = "skI7lyZ0g0qj4dHDvwJ5k"
    #channel = payload.pop("channel", os.getenv("CHANNEL_NUMBER", "917996666220"))
    #channel = "917996666220"
    API_KEY = os.getenv("API_KEY")
    CHANNEL_NUMBER = os.getenv("CHANNEL_NUMBER")     
    url = f"https://cloudapi.wbbox.in/api/v1.0/sync-templates/{CHANNEL_NUMBER}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        
        template_name = payload.get("name")
        if not template_name:
            raise HTTPException(status_code=400, detail="Template name missing")

        sync_url = f"https://cloudapi.wbbox.in/api/v1.0/sync-templates/{template_name}"
        sync_resp = requests.get(sync_url, headers={"Authorization": f"Bearer {API_KEY}"})
        sync_resp.raise_for_status()

        return {
            "success": True,
            "sync_status": sync_resp.json(),
        }
    except requests.HTTPError as e:
        raise HTTPException(status_code=sync_resp.status_code, detail=sync_resp.text)
    #return response.json()

@router.get("/getAlltemplates")
async def list_templates():
    
    #api_key = "skI7lyZ0g0qj4dHDvwJ5k"
    
    API_KEY = os.getenv("API_KEY")
    CHANNEL_NUMBER = os.getenv("CHANNEL_NUMBER")        
    print("API_KEY---------------- ",API_KEY)
    url = "https://cloudapi.wbbox.in/api/v1.0/templates"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
    except requests.HTTPError as e:
        
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()


@router.post("/sendWatsAppText")
async def sendWatsAppText(req: Request):
    data = await req.json()
    numbers_str = data.get("phone_numbers", "")
    template_name = data.get("template_name")

    # requestParams = await req.json()
    # #api_key = "skI7lyZ0g0qj4dHDvwJ5k"
    
    # API_KEY = os.getenv("API_KEY")
    # CHANNEL_NUMBER = os.getenv("CHANNEL_NUMBER")        
    # print("API_KEY---------------- ",API_KEY)
    # url = f"https://cloudapi.wbbox.in/api/v1.0/send-template/{CHANNEL_NUMBER}"
    
   # headers = {"Authorization": f"Bearer {API_KEY}"}

    if not numbers_str or not template_name:
        raise HTTPException(status_code=400, detail="phone_numbers and template_name are required")

    API_KEY = os.getenv("API_KEY")
    CHANNEL_NUMBER = os.getenv("CHANNEL_NUMBER")
    url = f"https://cloudapi.wbbox.in/api/v1.0/messages/send-template/{CHANNEL_NUMBER}"

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "apikey": "{API_KEY}",
        "Content-Type": "application/json",
    }

    
     # Clean and join the numbers into a single comma-separated string
    cleaned_numbers = [re.sub(r"\D", "", n) for n in numbers_str.split(",")]
    recipients = ",".join(filter(None, cleaned_numbers))

    if not recipients:
        raise HTTPException(status_code=400, detail="No valid phone numbers provided")

    payload = {
        "messaging_product": "whatsapp",
        "to": recipients,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {"code": "en"},
        },
        "components": []
    }
    try:
        resp = requests.post(url, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()
    except requests.HTTPError:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    
@router.post("/create-text-template")
async def create_text_template(req: Request):
    """Proxy endpoint dedicated for text templates."""
    return await create_template(req)


@router.post("/create-image-template")
async def create_image_template(
    name: str = Form(...),
    language: str = Form(...),
    category: str = Form(...),
    header: str = Form(""),
    body: str = Form(...),
    footer: str = Form(""),
    file: UploadFile = File(...),
):
    contents = await file.read()
    if len(contents) > 4 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image must be less than 4MB")
    payload = {
        "name": name,
        "language": language,
        "category": category,
        "components": [
            {"type": "HEADER", "format": "IMAGE"},
            {"type": "BODY", "text": body},
            {"type": "FOOTER", "text": footer},
        ],
    }
    API_KEY = os.getenv("API_KEY")
    CHANNEL_NUMBER = os.getenv("CHANNEL_NUMBER")
    url = f"https://cloudapi.wbbox.in/api/v1.0/create-templates/{CHANNEL_NUMBER}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
    except requests.HTTPError as e:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()


@router.post("/create-video-template")
async def create_video_template(
    name: str = Form(...),
    language: str = Form(...),
    category: str = Form(...),
    header: str = Form(""),
    body: str = Form(...),
    footer: str = Form(""),
    file: UploadFile = File(...),
):
    contents = await file.read()
    if len(contents) > 9 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Video must be less than 9MB")
    payload = {
        "name": name,
        "language": language,
        "category": category,
        "components": [
            {"type": "HEADER", "format": "VIDEO"},
            {"type": "BODY", "text": body},
            {"type": "FOOTER", "text": footer},
        ],
    }
    API_KEY = os.getenv("API_KEY")
    CHANNEL_NUMBER = os.getenv("CHANNEL_NUMBER")
    url = f"https://cloudapi.wbbox.in/api/v1.0/create-templates/{CHANNEL_NUMBER}"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
    except requests.HTTPError as e:
        raise HTTPException(status_code=response.status_code, detail=response.text)
    return response.json()
