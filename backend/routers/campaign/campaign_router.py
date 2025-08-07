from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
# from controllers.campaign.campaign_controller import create_campaign
from controllers.campaign.campaign_controller import (
    create_campaign,
    get_campaign_options,
    list_campaigns,
    get_campaign,
    update_campaign,
)
from schemas.campaign.campaign_schema import CampaignCreate, Campaign as CampaignOut
# from controllers.campaign.campaign_controller import get_campaign_options
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


@router.get("/", response_model=list[CampaignOut])
def read_campaigns(db: Session = Depends(get_db)):
    return list_campaigns(db)


@router.get("/{campaign_id}", response_model=CampaignOut)
def read_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = get_campaign(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.put("/{campaign_id}", response_model=CampaignOut)
def update_campaign_route(
    campaign_id: int,
    campaign: CampaignCreate,
    db: Session = Depends(get_db),
):
    updated = update_campaign(db, campaign_id, campaign)
    if not updated:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return updated
