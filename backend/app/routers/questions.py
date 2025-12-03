from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from .. import models, database, auth
from ..services import llm
import json

router = APIRouter(
    tags=["questions"]
)

@router.post("/generate/{chapter_id}")
async def generate_questions_for_chapter(
    chapter_id: int,
    num_mcqs: int = 5,
    num_short: int = 3,
    num_flashcards: int = 0,
    is_exam: bool = False,
    difficulty: str = "Medium",
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    chapter = db.query(models.Chapter).filter(models.Chapter.id == chapter_id, models.Chapter.owner_id == current_user.id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    
    try:
        if is_exam:
            num_short = 0
            num_flashcards = 0
            
        generated_data = llm.generate_questions(chapter.content_text, num_mcqs, num_short, num_flashcards, difficulty)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Generation failed: {str(e)}")
    
    # Save Question Set
    time_limit = int(num_mcqs / 2) if is_exam else None
    
    question_set = models.QuestionSet(
        title=f"Exam: {chapter.title}" if is_exam else f"Questions for {chapter.title}",
        owner_id=current_user.id,
        chapter_id=chapter.id,
        is_exam=is_exam,
        time_limit=time_limit
    )
    db.add(question_set)
    db.commit()
    db.refresh(question_set)
    
    # Save Questions
    for mcq in generated_data.get("mcqs", []):
        q = models.Question(
            question_text=mcq["question"],
            question_type="MCQ",
            options=json.dumps(mcq["options"]),
            correct_answer=mcq["correct_answer"],
            difficulty=difficulty,
            question_set_id=question_set.id
        )
        db.add(q)
        
    for short in generated_data.get("short_questions", []):
        q = models.Question(
            question_text=short["question"],
            question_type="SHORT",
            correct_answer=short["answer"],
            difficulty=difficulty,
            question_set_id=question_set.id
        )
        db.add(q)

    for flashcard in generated_data.get("flashcards", []):
        q = models.Question(
            question_text=flashcard["front"],
            question_type="FLASHCARD",
            correct_answer=flashcard["back"],
            difficulty=difficulty,
            question_set_id=question_set.id
        )
        db.add(q)
        
    db.commit()
    return {"message": "Questions generated successfully", "question_set_id": question_set.id}

@router.get("/questionsets/{question_set_id}")
def get_question_set(
    question_set_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    qs = db.query(models.QuestionSet).options(joinedload(models.QuestionSet.questions)).filter(models.QuestionSet.id == question_set_id, models.QuestionSet.owner_id == current_user.id).first()
    if not qs:
        raise HTTPException(status_code=404, detail="Question Set not found")
    return qs

@router.get("/questionsets/")
def get_question_sets(
    skip: int = 0,
    limit: int = 10,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.QuestionSet).filter(models.QuestionSet.owner_id == current_user.id).order_by(models.QuestionSet.created_at.desc()).offset(skip).limit(limit).all()
