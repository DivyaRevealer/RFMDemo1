from datetime import date, datetime
from typing import List, Optional, Dict
from pydantic import BaseModel

class CampaignBase(BaseModel):
    name:             str
    start_date:       date
    end_date:         date
    recency_op:       str
    recency_min:      Optional[int]= None
    recency_max:      Optional[int]= None
    frequency_op:     str
    frequency_min:    Optional[int]= None
    frequency_max:    Optional[int]= None
    monetary_op:      str
    monetary_min:     Optional[float]= None
    monetary_max:     Optional[float]= None
    r_score:          Optional[List[int]]= None
    f_score:          Optional[List[int]]= None
    m_score:          Optional[List[int]]= None
    rfm_segments:     Optional[List[str]] = None
    branch:           Optional[List[str]]= None
    city:             Optional[List[str]]= None
    state:            Optional[List[str]]= None
    birthday_start:     Optional[date]= None
    birthday_end:       Optional[date]= None
    anniversary_start:  Optional[date]= None
    anniversary_end:    Optional[date]= None
    purchase_type: Optional[str] 
    purchase_brand:  Optional[List[str]]= None
    section:          Optional[List[str]]= None
    product:          Optional[List[str]]= None
    model:            Optional[List[str]]= None
    item:             Optional[List[str]]= None
    value_threshold:  Optional[float]= None
    class Config:
        from_attributes = True

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id:               int
    created_at:       datetime
    updated_at:       datetime

    class Config:
        from_attributes = True

class CampaignOptions(BaseModel):
    r_scores:         List[int]
    f_scores:         List[int]
    m_scores:         List[int]
    rfm_segments:     List[str]

    branches:         List[str]
    branch_city_map:  Dict[str, List[str]]
    branch_state_map: Dict[str, List[str]]

    brands:         List[str]
    sections:         List[str]
    products:         List[str]
    models:           List[str]
    items:            List[str]
    brand_hierarchy:  List[Dict[str, Optional[str]]]

    class Config:
        from_attributes = True

    class CampaignRunDetails(BaseModel):
        id: int
        name: str
        rfm_segment_label: str
        brand_label: str
        value_threshold: Optional[float] = None
        shortlisted_count: int
    class Config:
        from_attributes = True
