from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    chapters = relationship("Chapter", back_populates="owner")
    question_sets = relationship("QuestionSet", back_populates="owner")

class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="chapters")
    question_sets = relationship("QuestionSet", back_populates="chapter")

class QuestionSet(Base):
    __tablename__ = "question_sets"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))
    chapter_id = Column(Integer, ForeignKey("chapters.id"))
    time_limit = Column(Integer, nullable=True) # In minutes
    is_exam = Column(Boolean, default=False)

    owner = relationship("User", back_populates="question_sets")
    chapter = relationship("Chapter", back_populates="question_sets")
    questions = relationship("Question", back_populates="question_set")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text)
    question_type = Column(String) # MCQ, SHORT, LONG
    options = Column(Text, nullable=True) # JSON string for MCQs
    correct_answer = Column(Text)
    difficulty = Column(String) # EASY, MEDIUM, HARD
    question_set_id = Column(Integer, ForeignKey("question_sets.id"))

    question_set = relationship("QuestionSet", back_populates="questions")
