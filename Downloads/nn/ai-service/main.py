from fastapi import FastAPI
from pydantic import BaseModel
import re
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

app = FastAPI()

# ─── Load ENV ───────────────────────────────────────────
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if API_KEY:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel("gemini-pro")
else:
    model = None


# ─── Request Model ─────────────────────────────────────
class InputData(BaseModel):
    text: str


# ─── Helper Functions ──────────────────────────────────

def count_fillers(text):
    fillers = ["um", "uh", "like", "you know", "basically", "actually"]
    return sum(text.lower().count(f) for f in fillers)


def keyword_score(text):
    keywords = [
        "experience", "project", "team", "problem", "solution",
        "learned", "implemented", "designed", "improved"
    ]
    return sum(1 for k in keywords if k in text.lower())


def structure_score(text):
    sentences = re.split(r'[.!?]+', text)
    return min(len(sentences), 5)


def specificity_score(text):
    words = ["because", "for example", "for instance", "when", "where", "used", "built"]
    return sum(1 for w in words if w in text.lower())


def generate_model_answer_fallback():
    return (
        "A strong answer should clearly explain the situation, your role, "
        "your actions, and the result using the STAR method."
    )


# ─── Gemini AI Analysis ─────────────────────────────────

def generate_ai_analysis(text):
    if not model:
        return None

    try:
        prompt = f"""
        You are an expert interview evaluator.

        Evaluate this answer:

        "{text}"

        Return STRICT JSON ONLY (no explanation):

        {{
          "score": number (1-10),
          "feedback": "short feedback",
          "confidence": number (1-10),
          "clarity": number (1-10),
          "structure": number (1-10),
          "specificity": number (1-10),
          "modelAnswer": "ideal structured answer",
          "followUp": "next interview question"
        }}
        """

        response = model.generate_content(prompt)
        return response.text

    except Exception as e:
        print("Gemini Error:", e)
        return None


def parse_ai_response(ai_text):
    try:
        cleaned = ai_text.strip()
        cleaned = cleaned.replace("```json", "").replace("```", "")
        return json.loads(cleaned)
    except Exception as e:
        print("Parse Error:", e)
        return None


# ─── Main Endpoint ─────────────────────────────────────

@app.post("/analyze")
def analyze(data: InputData):
    text = data.text.strip()

    if not text:
        return {
            "score": 0,
            "feedback": "No answer provided.",
            "fillerCount": 0,
            "confidence": 0,
            "clarity": 0,
            "structure": 0,
            "specificity": 0,
            "modelAnswer": generate_model_answer_fallback(),
            "followUp": "Please provide an answer."
        }

    # 🔥 Try Gemini AI
    ai_raw = generate_ai_analysis(text)
    ai_data = parse_ai_response(ai_raw) if ai_raw else None

    # ─── Rule-based fallback calculation ────────────────
    word_count = len(text.split())
    fillers = count_fillers(text)
    keyword_hits = keyword_score(text)
    structure = structure_score(text)
    specificity = specificity_score(text)

    length_score = min(word_count / 10, 5)
    keyword_boost = keyword_hits * 0.8
    structure_boost = structure * 0.5
    specificity_boost = specificity * 0.5
    filler_penalty = fillers * 0.5

    raw_score = length_score + keyword_boost + structure_boost + specificity_boost - filler_penalty
    fallback_score = max(1, min(10, round(raw_score, 1)))

    fallback_response = {
        "score": fallback_score,
        "feedback": "Decent answer. Improve clarity and add more structure.",
        "confidence": max(1, 10 - fillers),
        "clarity": min(10, keyword_hits + structure),
        "structure": min(10, structure * 2),
        "specificity": min(10, specificity * 2),
        "modelAnswer": generate_model_answer_fallback(),
        "followUp": "Can you provide a more structured example?"
    }

    # 🔥 Use AI if valid
    if ai_data:
        return {
            "score": ai_data.get("score", fallback_response["score"]),
            "feedback": ai_data.get("feedback", fallback_response["feedback"]),
            "confidence": ai_data.get("confidence", fallback_response["confidence"]),
            "clarity": ai_data.get("clarity", fallback_response["clarity"]),
            "structure": ai_data.get("structure", fallback_response["structure"]),
            "specificity": ai_data.get("specificity", fallback_response["specificity"]),
            "fillerCount": fillers,
            "modelAnswer": ai_data.get("modelAnswer", fallback_response["modelAnswer"]),
            "followUp": ai_data.get("followUp", fallback_response["followUp"])
        }

    # 🔁 fallback if AI fails
    return {
        **fallback_response,
        "fillerCount": fillers
    }