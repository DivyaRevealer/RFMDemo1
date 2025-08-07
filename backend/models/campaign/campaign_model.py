from sqlalchemy import Column, Integer, Date, DateTime, DECIMAL, JSON,String, func
from database import Base

class Campaign(Base):
    __tablename__ = "campaigns"

    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String(255), nullable=False)
    start_date       = Column(Date,   nullable=False)
    end_date         = Column(Date,   nullable=False)

    recency_op       = Column(JSON,   nullable=False)
    recency_min      = Column(Integer)
    recency_max      = Column(Integer)

    frequency_op     = Column(JSON,   nullable=False)
    frequency_min    = Column(Integer)
    frequency_max    = Column(Integer)

    monetary_op      = Column(JSON,   nullable=False)
    monetary_min     = Column(DECIMAL(18,2))
    monetary_max     = Column(DECIMAL(18,2))

    r_score          = Column(JSON)
    f_score          = Column(JSON)
    m_score          = Column(JSON)
    rfm_segments     = Column(JSON,   nullable=False)

    branch           = Column(JSON)
    city             = Column(JSON)
    state            = Column(JSON)

    birthday_date    = Column(Date)
    anniversary_date = Column(Date)

    purchase_type    = Column(JSON,   nullable=False)
    purchase_brand  = Column(JSON)
    section          = Column(JSON)
    product          = Column(JSON)

    model            = Column(JSON)
    item             = Column(JSON)
    value_threshold  = Column(DECIMAL(18,2))

    created_at       = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at       = Column(DateTime,
                              server_default=func.now(),
                              onupdate=func.now(),
                              nullable=False)
