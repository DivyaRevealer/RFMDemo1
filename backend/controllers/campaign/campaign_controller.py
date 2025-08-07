from sqlalchemy.orm import Session
from models.campaign.campaign_model import Campaign
from models.campaign.brand_detail_model import  BrandDetail
from models.campaign.geography_model import Geography
from models.campaign.rfm_detail_model import RFMDetail
from schemas.campaign.campaign_schema import CampaignCreate

from schemas.campaign.campaign_schema import CampaignOptions

def get_campaign_options(db: Session) -> CampaignOptions:
    # 1. RFM details
    r_scores     = [r[0] for r in db.query(RFMDetail.r_score).distinct().order_by(RFMDetail.r_score)]
    f_scores     = [r[0] for r in db.query(RFMDetail.f_score).distinct().order_by(RFMDetail.f_score)]
    m_scores     = [r[0] for r in db.query(RFMDetail.m_score).distinct().order_by(RFMDetail.m_score)]
    segments     = [r[0] for r in db.query(RFMDetail.segment).distinct().order_by(RFMDetail.segment)]

    # 2. Geography: branch → cities, states
    geo_rows     = db.query(Geography.branch, Geography.city, Geography.state).all()
    branches     = sorted({g.branch for g in geo_rows})
    branch_city  = {}
    branch_state = {}
    for b, c, s in geo_rows:
        branch_city.setdefault(b, set()).add(c)
        branch_state.setdefault(b, set()).add(s)
    branch_city_map  = {b: sorted(list(cs)) for b, cs in branch_city.items()}
    branch_state_map = {b: sorted(list(ss)) for b, ss in branch_state.items()}

    # 3. Brand details: section, product, model, item
    bd_rows      = db.query(
                      BrandDetail.section,
                      BrandDetail.product,
                      BrandDetail.model,
                      BrandDetail.item
                   ).all()
    sections = sorted({r.section for r in bd_rows})
    products = sorted({r.product for r in bd_rows})
    models   = sorted({r.model   for r in bd_rows})
    items    = sorted({r.item    for r in bd_rows})

    return CampaignOptions(
      r_scores=r_scores,
      f_scores=f_scores,
      m_scores=m_scores,
      rfm_segments=segments,

      branches=branches,
      branch_city_map=branch_city_map,
      branch_state_map=branch_state_map,

      sections=sections,
      products=products,
      models=models,
      items=items
    )

def create_campaign(db: Session, data: CampaignCreate) -> Campaign:
    print("inside create campaign-----------------")
    db_obj = Campaign(**data.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

