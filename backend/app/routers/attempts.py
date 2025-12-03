from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from .. import models, database, auth
from pydantic import BaseModel
from typing import Dict, Any
import json

router = APIRouter(
    prefix="/attempts",
    tags=["attempts"]
)

class AttemptCreate(BaseModel):
    question_set_id: int
    score: int
    total_questions: int
    answers: Dict[str, Any]

@router.post("/")
def create_attempt(
    attempt: AttemptCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_attempt = models.ExamAttempt(
        user_id=current_user.id,
        question_set_id=attempt.question_set_id,
        score=attempt.score,
        total_questions=attempt.total_questions,
        answers=json.dumps(attempt.answers)
    )
    db.add(db_attempt)
    db.commit()
    db.refresh(db_attempt)
    return db_attempt

@router.get("/user/")
def get_user_attempts(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.ExamAttempt).filter(models.ExamAttempt.user_id == current_user.id).order_by(models.ExamAttempt.completed_at.desc()).all()

@router.get("/{attempt_id}")
def get_attempt(
    attempt_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    attempt = db.query(models.ExamAttempt).options(joinedload(models.ExamAttempt.question_set).joinedload(models.QuestionSet.questions)).filter(models.ExamAttempt.id == attempt_id).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this attempt")
    return attempt
