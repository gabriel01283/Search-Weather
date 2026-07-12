from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backEnd.alerts.routes import router as alerts_router
from backEnd.cities.routes import router as cities_router
from backEnd.favorites.routes import router as favorites_router
from backEnd.history.routes import router as history_router
from backEnd.users.routes import router as users_router
from backEnd.weather.routes import router as weather_router


app = FastAPI(
    title="Search Weather API",
    description=(
        "API para consulta climática, usuários, "
        "favoritos, histórico e alertas."
    ),
    version="1.0.0"
)


allowed_origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(users_router)
app.include_router(cities_router)
app.include_router(weather_router)
app.include_router(history_router)
app.include_router(favorites_router)
app.include_router(alerts_router)


@app.get("/", tags=["Status"])
def home():
    return {
        "message": "Search Weather API funcionando."
    }


@app.get("/health", tags=["Status"])
def health_check():
    return {
        "status": "online"
    }