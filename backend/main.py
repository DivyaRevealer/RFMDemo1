import sys
from fastapi import FastAPI
from database import engine, Base
#from controllers import auth
from controllers import auth, dashboard
from controllers import auth, dashboard, filters, campaign
from fastapi.middleware.cors import CORSMiddleware
from routers.campaign.campaign_router import router as campaign_router
from models.campaign.campaign_model import Base as CampaignBase

print("PYTHON EXECUTABLE:", sys.executable)
print("sys.path:", sys.path)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:3000"] for tighter security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Create database tables
Base.metadata.create_all(bind=engine)
CampaignBase.metadata.create_all(bind=engine)

# Include routes
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(filters.router)
#app.include_router(campaign.router)
app.include_router(campaign_router)

@app.get("/")
def root():
    return {"message": "RFM Tool API with Authentication"}
