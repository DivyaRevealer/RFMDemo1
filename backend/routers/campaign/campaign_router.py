from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from controllers.campaign.campaign_controller import create_campaign
from schemas.campaign.campaign_schema import CampaignCreate, Campaign as CampaignOut
from controllers.campaign.campaign_controller import get_campaign_options
from schemas.campaign.campaign_schema import CampaignOptions
from database import SessionLocal

router = APIRouter(prefix="/campaign", tags=["campaign"])

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/options", response_model=CampaignOptions)
def read_campaign_options(db: Session = Depends(get_db)):
    return get_campaign_options(db)

@router.post("/createCampaign", response_model=CampaignOut)
def create_campaign_route(
    campaign: CampaignCreate,
    db: Session = Depends(get_db)
):
    try:
        return create_campaign(db, campaign)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
