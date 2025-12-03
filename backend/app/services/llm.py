import os
from groq import Groq
import json

# Ensure GROQ_API_KEY is set in environment variables
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

def generate_questions(text: str, num_mcqs: int = 5, num_short: int = 3, num_flashcards: int = 0, difficulty: str = "Medium"):
    prompt = f"""
    You are an expert exam question generator. Based on the provided text, generate the following questions:
    - EXACTLY {num_mcqs} Multiple Choice Questions (MCQs) with 4 options and the correct answer indicated.
    - EXACTLY {num_short} Short Answer Questions (1-2 sentences).
    - EXACTLY {num_flashcards} Flashcards (Front/Back).
    
    Difficulty Level: {difficulty}
    
    Return the output in pure JSON format with the following structure:
    {{
        "mcqs": [
            {{
                "question": "Question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A"
            }}
        ],
        "short_questions": [
            {{
                "question": "Question text",
                "answer": "Model answer"
            }}
        ],
        "flashcards": [
            {{
                "front": "Term or Concept",
                "back": "Definition or Explanation"
            }}
        ]
    }}
    
    Text content:
    {text[:15000]}  # Limit text length to avoid token limits if necessary
    """
    
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama-3.3-70b-versatile", # Updated model
        response_format={"type": "json_object"},
    )
    
    return json.loads(chat_completion.choices[0].message.content)
