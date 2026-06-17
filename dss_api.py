from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
from src.resqme.pipelines.dss.dss_engine import run_dss

app = FastAPI(title="ResQme DSS API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DSS_PATH = PROJECT_ROOT / "src" / "resqme" / "data" / "dss" / "dss.xlsx"


class DssRequest(BaseModel):
    text: str


class AlternativeCondition(BaseModel):
    condition: str
    confidence: float


class DssResponse(BaseModel):
    input_text: str
    top_condition: Optional[str]
    confidence: float
    urgency_level: str
    status: str
    needs_clarification: bool
    clarifying_question: Optional[str]
    instructions: List[str]
    safety_message: str
    matched_symptoms: List[str]
    alternative_conditions: List[AlternativeCondition]


@app.get("/")
def health_check():
    return {"status": "ok", "service": "ResQme DSS API"}

@app.post("/analyze-text", response_model=DssResponse)
def analyze_event(request: DssRequest):
    text = request.text.strip()

    if not text:
        return DssResponse(
            input_text=text,
            top_condition=None,
            confidence=0.0,
            urgency_level="unknown",
            status="fallback",
            needs_clarification=False,
            clarifying_question=None,
            instructions=[
                "התקשרו מיד למד״א 101.",
                "הישארו ליד האדם אם הסביבה בטוחה.",
                "אל תזיזו את האדם אלא אם קיימת סכנה מיידית."
            ],
            safety_message="המערכת לא הצליחה להבין את האירוע בצורה ברורה.",
            matched_symptoms=[],
            alternative_conditions=[]
        )

    dss_result = run_dss(text)

    confidence_map = {
        "high": 0.9,
        "medium": 0.6,
        "low": 0.35
    }

    numeric_confidence = confidence_map.get(str(dss_result.confidence).lower(), 0.0)

    if numeric_confidence >= 0.75:
        status = "classified"
        needs_clarification = False
        clarifying_question = None
    elif numeric_confidence >= 0.45:
        status = "clarification"
        needs_clarification = True
        clarifying_question = "האם האדם נושם בצורה תקינה?"
    else:
        status = "fallback"
        needs_clarification = False
        clarifying_question = None

    matched_symptoms = []
    for match in dss_result.matched_phrases[:10]:
        matched_symptoms.append(match.clinical_meaning)

    alternative_conditions = []
    sorted_scores = sorted(
        dss_result.scores.items(),
        key=lambda item: item[1],
        reverse=True
    )

    for condition_code, score in sorted_scores[1:4]:
        alternative_conditions.append(
            AlternativeCondition(
                condition=condition_code,
                confidence=max(0.0, min(float(score) / 10.0, 1.0))
            )
        )

    return DssResponse(
        input_text=dss_result.input_text,
        top_condition=dss_result.decision_name,
        confidence=numeric_confidence,
        urgency_level="critical" if dss_result.confidence == "high" else "unknown",
        status=status,
        needs_clarification=needs_clarification,
        clarifying_question=clarifying_question,
        instructions=dss_result.instructions,
        safety_message=dss_result.forbidden_action or "Follow only the displayed instructions.",
        matched_symptoms=list(dict.fromkeys(matched_symptoms)),
        alternative_conditions=alternative_conditions
    )


    # Temporary mock response.
    # Later we will replace this block with the real DSS engine call.
    return DssResponse(
        input_text=text,
        top_condition="cardiac_arrest",
        confidence=0.87,
        urgency_level="critical",
        status="classified",
        needs_clarification=False,
        clarifying_question=None,
        instructions=[
            "Check if the person responds.",
            "Call emergency services immediately.",
            "If the person is not breathing normally, start chest compressions."
        ],
        safety_message="Follow only the displayed instructions.",
        matched_symptoms=[
            "collapse",
            "unresponsive"
        ],
        alternative_conditions=[
            AlternativeCondition(condition="fainting", confidence=0.32)
        ]
    )