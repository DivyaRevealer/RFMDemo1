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
from schemas.campaign.campaign_schema import CampaignCreate, CampaignOptions

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

    brands = sorted({
    r.brand
    for r in bd_rows
    if r.brand is not None
})
    # sections = sorted({r.section for r in bd_rows})
    sections = sorted({
    r.section
    for r in bd_rows
    if r.section is not None
})
   # products = sorted({r.product for r in bd_rows})
    products = sorted({
    r.product
    for r in bd_rows
    if r.product is not None
})
    # models   = sorted({r.model   for r in bd_rows})
    # items    = sorted({r.item    for r in bd_rows})
   # models = sorted({r.model for r in bd_rows})
    models = sorted({
    r.model
    for r in bd_rows
    if r.model is not None
})

   # items = sorted({r.item for r in bd_rows})
    items = sorted({
    r.item
    for r in bd_rows
    if r.item is not None
})

    print("branches---- ",branches)

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
      items=items
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