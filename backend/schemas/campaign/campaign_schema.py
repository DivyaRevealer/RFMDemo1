from datetime import date
from typing import List, Optional, Dict
from pydantic import BaseModel

class CampaignBase(BaseModel):
    start_date:       date
    end_date:         date
    recency_op:       str
    recency_min:      Optional[int]
    recency_max:      Optional[int]
    frequency_op:     str
    frequency_min:    Optional[int]
    frequency_max:    Optional[int]
    monetary_op:      str
    monetary_min:     Optional[float]
    monetary_max:     Optional[float]
    r_score:          Optional[List[int]]
    f_score:          Optional[List[int]]
    m_score:          Optional[List[int]]
    rfm_segments:     List[str]
    branch:           Optional[List[str]]
    city:             Optional[List[str]]
    state:            Optional[List[str]]
    birthday_date:    Optional[date]
    anniversary_date: Optional[date]
    purchase_type:    List[str]
    purchase_brand:  Optional[List[str]]
    section:          Optional[List[str]]
    product:          Optional[List[str]]
    model:            Optional[List[str]]
    item:             Optional[List[str]]
    value_threshold:  Optional[float]

class CampaignCreate(CampaignBase):
    pass

class Campaign(CampaignBase):
    id:               int
    created_at:       date
    updated_at:       date

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

    sections:         List[str]
    products:         List[str]
    models:           List[str]
    items:            List[str]

    class Config:
        from_attributes = True
