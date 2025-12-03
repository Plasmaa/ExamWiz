from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv()

from app import models, database
from app.routers import auth, upload, questions, export, attempts

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="ExamWiz API", version="0.1.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(questions.router)
app.include_router(export.router)
app.include_router(attempts.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ExamWiz API"}
