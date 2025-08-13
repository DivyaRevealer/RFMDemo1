from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session
# from controllers.campaign.campaign_controller import create_campaign
from models import crm_analysis
from models.campaign.campaign_model import Campaign
from controllers.campaign.campaign_controller import (
    create_campaign,
    get_campaign_options,
    list_campaigns,
    get_campaign,
    update_campaign,
    get_campaign_run_details,
)
from schemas.campaign.campaign_schema import (
    CampaignCreate,
    Campaign as CampaignOut,
    CampaignListOut,
    CampaignOptions,
    CampaignRunDetails,
    )
from database import SessionLocal
from typing import List, Optional

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

@router.get("/run/{campaign_id}", response_model=CampaignRunDetails)
def read_campaign_run_details(campaign_id: int, db: Session = Depends(get_db)):
    details = get_campaign_run_details(db, campaign_id)
    if not details:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return details



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

@router.get("/run/list", response_model=List[CampaignListOut])
def list_campaigns_for_run(
    from_date: Optional[date] = Query(None),
    to_date:   Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(Campaign)
    if from_date:
        q = q.filter(Campaign.start_date >= from_date)
    if to_date:
        q = q.filter(Campaign.end_date <= to_date)
    # if neither provided, you can default to "active now"
    if not from_date and not to_date:
        today = date.today()
        q = q.filter(Campaign.start_date <= today, Campaign.end_date >= today)
    return q.order_by(Campaign.start_date.desc()).all()

@router.get("/run/{campaign_id}/details", response_model=CampaignRunDetails)
def campaign_run_details(campaign_id: int, db: Session = Depends(get_db)):
    camp: Campaign = db.query(Campaign).get(campaign_id)
    if not camp:
        raise HTTPException(404, "Campaign not found")

    # Labels for the UI (not used in the count logic)
    rfm_segment_label = None
    if isinstance(camp.rfm_segments, list) and camp.rfm_segments:
        rfm_segment_label = camp.rfm_segments[0]
    elif isinstance(camp.rfm_segments, dict) and "label" in camp.rfm_segments:
        rfm_segment_label = camp.rfm_segments["label"]

    brand_label = None
    if isinstance(camp.purchase_brand, list) and camp.purchase_brand:
        brand_label = camp.purchase_brand[0]
    elif isinstance(camp.purchase_brand, str):
        brand_label = camp.purchase_brand

    # Count distinct customers in crm_sales during the campaign window,
    # optionally restricted by campaign.purchase_brand (JSON array)
    sql_count = text("""
        SELECT COUNT(DISTINCT s.CUST_MOBILENO) AS cnt
        FROM crm_sales s
        JOIN (
          SELECT start_date, end_date, purchase_brand
          FROM campaigns
          WHERE id = :cid
        ) c
          ON s.INVOICE_DATE BETWEEN c.start_date AND c.end_date
        WHERE
          (c.purchase_brand IS NULL OR JSON_LENGTH(c.purchase_brand) = 0
           OR JSON_CONTAINS(c.purchase_brand, JSON_QUOTE(s.BRAND)))
          -- AND (s.TXN_FLAG IS NULL OR s.TXN_FLAG = 'S')  -- uncomment if you want sales-only
    """)

    row = db.execute(sql_count, {"cid": campaign_id}).first()
    shortlisted_count = int(row.cnt) if row and row.cnt is not None else 0

       # Debug print
    print("Campaign Details →")
    print(f"  id                = {camp.id}")
    print(f"  name              = {camp.name}")
    print(f"  rfm_segment_label = {rfm_segment_label or '-'}")
    print(f"  brand_label       = {brand_label or '-'}")
    print(f"  value_threshold   = {float(camp.value_threshold) if camp.value_threshold is not None else None}")
    print(f"  shortlisted_count = {shortlisted_count}")


    return CampaignRunDetails(
        id=camp.id,
        name=camp.name,
        rfm_segment_label=rfm_segment_label or "-",
        brand_label=brand_label or "-",
        value_threshold=float(camp.value_threshold) if camp.value_threshold is not None else None,
        shortlisted_count=shortlisted_count,
    )
