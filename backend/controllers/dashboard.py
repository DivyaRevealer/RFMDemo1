from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.crm_analysis import CRMAnalysis as CRMAnalysisModel
from schemas.crm_analysis import CRMAnalysis as CRMAnalysisSchema

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/", response_model=List[CRMAnalysisSchema])
def get_dashboard_data(db: Session = Depends(get_db)):
    """Fetch all dashboard records from the CRM analysis table."""
    return db.query(CRMAnalysisModel).all()