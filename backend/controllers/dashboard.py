from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from fastapi import Query

from database import get_db
from models.crm_analysis import CRMAnalysis as CRMAnalysisModel
from schemas.crm_analysis import CRMAnalysis as CRMAnalysisSchema

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/", response_model=List[CRMAnalysisSchema])
# def get_dashboard_data(db: Session = Depends(get_db)):
#     """Fetch all dashboard records from the CRM analysis table."""
#     return db.query(CRMAnalysisModel).all()

def get_dashboard_data(
    start_date: date | None = Query(None, description="Start of transaction date range"),
    end_date:   date | None = Query(None, description="End of transaction date range"),
    phone: str | None = None,
    name: str | None = None,
    r_score: int | None = None,
    f_score: int | None = None,
    m_score: int | None = None,
    db: Session = Depends(get_db),
):
    """Fetch dashboard records filtered by optional query parameters."""

    query = db.query(CRMAnalysisModel)
     # date filters (use whichever date field makes sense – e.g. FIRST_IN_DATE)
    if start_date:
        query = query.filter(CRMAnalysisModel.FIRST_IN_DATE >= start_date)
    if end_date:
        query = query.filter(CRMAnalysisModel.FIRST_IN_DATE <= end_date)
    if phone:
        query = query.filter(CRMAnalysisModel.CUST_MOBILENO == phone)
    if name:
        query = query.filter(CRMAnalysisModel.CUSTOMER_NAME == name)
    if r_score is not None:
        query = query.filter(CRMAnalysisModel.R_SCORE == r_score)
    if f_score is not None:
        query = query.filter(CRMAnalysisModel.F_SCORE == f_score)
    if m_score is not None:
        query = query.filter(CRMAnalysisModel.M_SCORE == m_score)
    
    sql = query.statement.compile(
        compile_kwargs={"literal_binds": True}
    )
    print(str(sql))   # ← this will print something like below

    return query.all()