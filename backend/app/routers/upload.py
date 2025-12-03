from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, database, auth
from ..services import ocr

router = APIRouter(
    tags=["upload"]
)

@router.post("/upload/chapter")
async def upload_chapter(
    title: str,
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    content = await file.read()
    try:
        text = ocr.extract_text(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")
    
    chapter = models.Chapter(
        title=title,
        content_text=text,
        owner_id=current_user.id
    )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter

@router.get("/chapters/")
def get_chapters(
    skip: int = 0,
    limit: int = 10,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return db.query(models.Chapter).filter(models.Chapter.owner_id == current_user.id).order_by(models.Chapter.created_at.desc()).offset(skip).limit(limit).all()
