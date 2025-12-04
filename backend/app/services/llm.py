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
    
    CRITICAL INSTRUCTION: You MUST generate EXACTLY the number of questions requested above. Do not generate more or fewer.
    
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
    
    models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama-3.2-3b-preview"]
    
    all_mcqs = []
    all_short = []
    all_flashcards = []
    
    BATCH_SIZE = 10
    
    # Loop until we have enough questions or fail to make progress
    max_retries = 15 # Safety limit to prevent infinite loops (e.g. if we need 100, 10 batches + buffer)
    retries = 0
    
    while (len(all_mcqs) < num_mcqs or len(all_short) < num_short or len(all_flashcards) < num_flashcards) and retries < max_retries:
        retries += 1
        
        # Calculate how many needed for this batch
        req_mcqs = min(num_mcqs - len(all_mcqs), BATCH_SIZE)
        req_short = min(num_short - len(all_short), BATCH_SIZE)
        req_flash = min(num_flashcards - len(all_flashcards), BATCH_SIZE)
        
        # If we don't need anything, break (should be covered by while condition, but safety)
        if req_mcqs <= 0 and req_short <= 0 and req_flash <= 0:
            break
            
        print(f"DEBUG: Batch {retries} - Requesting: MCQs={req_mcqs}, Short={req_short}, Flash={req_flash}")
        
        batch_prompt = f"""
        You are an expert exam question generator. Based on the provided text, generate the following questions:
        - EXACTLY {req_mcqs} Multiple Choice Questions (MCQs) with 4 options and the correct answer indicated.
        - EXACTLY {req_short} Short Answer Questions (1-2 sentences).
        - EXACTLY {req_flash} Flashcards (Front/Back).
        
        CRITICAL INSTRUCTION: You MUST generate EXACTLY the number of questions requested above. Do not generate more or fewer.
        
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
        
        batch_success = False
        for model in models:
            try:
                print(f"DEBUG: Trying model {model} for batch {retries}...")
                chat_completion = client.chat.completions.create(
                    messages=[
                        {
                            "role": "user",
                            "content": batch_prompt,
                        }
                    ],
                    model=model,
                    response_format={"type": "json_object"},
                )
                result = json.loads(chat_completion.choices[0].message.content)
                
                # Append results
                if "mcqs" in result:
                    all_mcqs.extend(result["mcqs"])
                if "short_questions" in result:
                    all_short.extend(result["short_questions"])
                if "flashcards" in result:
                    all_flashcards.extend(result["flashcards"])
                
                batch_success = True
                break # Move to next batch if successful
            except Exception as e:
                print(f"WARNING: Model {model} failed for batch {retries}: {e}")
                continue
        
        if not batch_success:
            print("ERROR: All models failed for this batch. Stopping generation.")
            break
            
    # Construct final result
    final_result = {
        "mcqs": all_mcqs[:num_mcqs],
        "short_questions": all_short[:num_short],
        "flashcards": all_flashcards[:num_flashcards]
    }
    
    return final_result
