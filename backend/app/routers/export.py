from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse, PlainTextResponse
from sqlalchemy.orm import Session
from .. import models, database, auth
from ..services import export
import io

router = APIRouter(
    tags=["export"]
)

@router.get("/export/{question_set_id}/{format}")
def export_questions(
    question_set_id: int,
    format: str,
    include_answers: bool = Query(False),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    qs = db.query(models.QuestionSet).filter(models.QuestionSet.id == question_set_id, models.QuestionSet.owner_id == current_user.id).first()
    if not qs:
        raise HTTPException(status_code=404, detail="Question Set not found")
        
    if format == "pdf":
        buffer = export.generate_pdf(qs, include_answers)
        return StreamingResponse(buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={qs.title}.pdf"})
    elif format == "docx":
        buffer = export.generate_docx(qs, include_answers)
        return StreamingResponse(buffer, media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", headers={"Content-Disposition": f"attachment; filename={qs.title}.docx"})
    elif format == "txt":
        text = export.generate_text(qs, include_answers)
        return PlainTextResponse(text, headers={"Content-Disposition": f"attachment; filename={qs.title}.txt"})
    else:
        raise HTTPException(status_code=400, detail="Invalid format")
