from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backEnd.cities.routes import router as cities_router
from backEnd.users.routes import router as users_router


app = FastAPI(
    title="Search Weather API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(cities_router)


@app.get("/")
def home():
    return {
        "message": "Backend funcionando"
    }