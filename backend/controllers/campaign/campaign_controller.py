from decimal import Decimal
from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from models.campaign.campaign_model import Campaign
from models.campaign.brand_detail_model import  BrandDetail
from models.campaign.brand_filter_model import CampaignBrandFilter
from models.campaign.geography_model import Geography
from models.campaign.rfm_detail_model import RFMDetail
from schemas.campaign.campaign_schema import CampaignCreate
from models.crm_analysis2 import CRMAnalysis2 as CRMAnalysisModel
from schemas.crm_analysis2 import CRMAnalysis2 as CRMAnalysisSchema
#from schemas.campaign.campaign_schema import CampaignOptions
# from schemas.campaign.campaign_schema import CampaignCreate, CampaignOptions
from schemas.campaign.campaign_schema import (
    CampaignCreate,
    CampaignOptions,
    CampaignRunDetails,
)

def _to_float(x):
    if x is None: 
        return None
    return float(x) if isinstance(x, (int, float, Decimal)) else x

def get_campaign_options(db: Session) -> CampaignOptions:
    # 1. RFM details
    # r_scores     = [r[0] for r in db.query(RFMDetail.r_score).distinct().order_by(RFMDetail.r_score)]
    # f_scores     = [r[0] for r in db.query(RFMDetail.f_score).distinct().order_by(RFMDetail.f_score)]
    # m_scores     = [r[0] for r in db.query(RFMDetail.m_score).distinct().order_by(RFMDetail.m_score)]
    # segments     = [r[0] for r in db.query(RFMDetail.segment).distinct().order_by(RFMDetail.segment)]

     # 1. RFM details – now pulled from crm_analysis
    r_scores = [
        row[0]
        for row in db
            .query(CRMAnalysisModel.R_SCORE)
            .distinct()
            .order_by(CRMAnalysisModel.R_SCORE)
            .all()
    ]
    f_scores = [
        row[0]
        for row in db
            .query(CRMAnalysisModel.F_SCORE)
            .distinct()
            .order_by(CRMAnalysisModel.F_SCORE)
            .all()
    ]
    m_scores = [
        row[0]
        for row in db
            .query(CRMAnalysisModel.M_SCORE)
            .distinct()
            .order_by(CRMAnalysisModel.M_SCORE)
            .all()
    ]
    segments = [
        row[0]
        for row in db
            .query(CRMAnalysisModel.SEGMENT_MAP)
            .distinct()
            .order_by(CRMAnalysisModel.SEGMENT_MAP)
            .all()
    ]

    # 2. Geography: branch → cities, states
    # geo_rows     = db.query(Geography.branch, Geography.city, Geography.state).all()
    # branches     = sorted({g.branch for g in geo_rows})
    # branch_city  = {}
    # branch_state = {}
    # for b, c, s in geo_rows:
    #     branch_city.setdefault(b, set()).add(c)
    #     branch_state.setdefault(b, set()).add(s)
    # branch_city_map  = {b: sorted(list(cs)) for b, cs in branch_city.items()}
    # branch_state_map = {b: sorted(list(ss)) for b, ss in branch_state.items()}

    # 2. Geography: branch → cities, states (from crm_analysis)
    geo_rows = (
        db.query(
            CRMAnalysisModel.LAST_IN_STORE_NAME,
            CRMAnalysisModel.LAST_IN_STORE_CITY,
            CRMAnalysisModel.LAST_IN_STORE_STATE,
        )
        .distinct()
        .all()
    )

    branches = sorted({row[0] for row in geo_rows if row[0]})
    branch_city_map = {
        b: sorted({city for branch, city, _ in geo_rows if branch == b and city})
        for b in branches
    }
    branch_state_map = {
        b: sorted({state for branch, _, state in geo_rows if branch == b and state})
        for b in branches
    }

    # # 3. Brand details: section, product, model, item
    # bd_rows      = db.query(
    #                   BrandDetail.section,
    #                   BrandDetail.product,
    #                   BrandDetail.model,
    #                   BrandDetail.item
    #                ).all()
    # 3. Brand hierarchy: brand → section → product → model → item
    bd_rows = db.query(
        CampaignBrandFilter.brand,
        CampaignBrandFilter.section,
        CampaignBrandFilter.product,
        CampaignBrandFilter.model,
        CampaignBrandFilter.item,
    ).all()
   # brands = sorted({r.brand for r in bd_rows})
    brands   = sorted({r.brand   for r in bd_rows if r.brand   is not None})
    sections = sorted({r.section for r in bd_rows if r.section is not None})
    products = sorted({r.product for r in bd_rows if r.product is not None})
    models   = sorted({r.model   for r in bd_rows if r.model   is not None})
    items    = sorted({r.item    for r in bd_rows if r.item    is not None})

    # ✅ NEW: full hierarchy objects (filter out completely empty rows)
    brand_hierarchy = [
        {
            "brand":   r.brand,
            "section": r.section,
            "product": r.product,
            "model":   r.model,
            "item":    r.item,
        }
        for r in bd_rows
        if any([r.brand, r.section, r.product, r.model, r.item])
    ]
   
    print("brand_hierarchy------------",brand_hierarchy)
    return CampaignOptions(
      r_scores=r_scores,
      f_scores=f_scores,
      m_scores=m_scores,
      rfm_segments=segments,

      branches=branches,
      branch_city_map=branch_city_map,
      branch_state_map=branch_state_map,
      

      brands=brands,
      sections=sections,
      products=products,
      models=models,
      items=items,
      brand_hierarchy=brand_hierarchy,
    )

def create_campaign(db: Session, data: CampaignCreate) -> Campaign:
    print("inside create campaign-----------------")
    db_obj = Campaign(**data.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def list_campaigns(db: Session):
    """Return all campaigns."""
    return db.query(Campaign).order_by(Campaign.id.desc()).all()

def get_campaign(db: Session, campaign_id: int):
    """Fetch a single campaign by ID."""
    return db.query(Campaign).filter(Campaign.id == campaign_id).first()

def update_campaign(db: Session, campaign_id: int, data: CampaignCreate):
    """Update an existing campaign."""
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        return None
    for field, value in data.dict().items():
        setattr(campaign, field, value)
    db.commit()
    db.refresh(campaign)
    return campaign

def get_campaign_run_details(db: Session, campaign_id: int) -> CampaignRunDetails | None:
    """Return run-time details for a campaign."""
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
        # id=camp.id,
        # name=camp.name,
        # rfm_segment_label=rfm_segment_label or "-",
        # brand_label=brand_label or "-",
        # value_threshold=float(camp.value_threshold) if camp.value_threshold is not None else None,
        # shortlisted_count=shortlisted_count,
        id=camp.id,
        name=camp.name,

        # new pass-through fields
        start_date=camp.start_date,
        end_date=camp.end_date,
        recency_op=camp.recency_op,
        recency_min=camp.recency_min,
        recency_max=camp.recency_max,
        frequency_op=camp.frequency_op,
        frequency_min=camp.frequency_min,
        frequency_max=camp.frequency_max,
        monetary_op=camp.monetary_op,
        monetary_min=_to_float(camp.monetary_min),
        monetary_max=_to_float(camp.monetary_max),
        r_score=camp.r_score,
        f_score=camp.f_score,
        m_score=camp.m_score,
        rfm_segments=camp.rfm_segments,
        branch=camp.branch,
        city=camp.city,
        state=camp.state,
        birthday_start=camp.birthday_start,
        birthday_end=camp.birthday_end,
        anniversary_start=camp.anniversary_start,
        anniversary_end=camp.anniversary_end,
        purchase_type=camp.purchase_type,
        purchase_brand=camp.purchase_brand,
        section=camp.section,
        product=camp.product,
        model=camp.model,
        item=camp.item,
        value_threshold=_to_float(camp.value_threshold),
        created_at=camp.created_at,
        updated_at=camp.updated_at,

        # already existing UI fields
        rfm_segment_label=rfm_segment_label or "-",
        brand_label=brand_label or "-",
        shortlisted_count=shortlisted_count,
    )

