from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Retorno do backend funcionando
@app.get("/")
def home():
    return{"message": "Backend funcionando"}