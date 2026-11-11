from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class SuggestedAction(BaseModel):
    label: str
    href: str

class CompanionChatRequest(BaseModel):
    message: str
    category: Optional[str] = "all"
    target_role: Optional[str] = None

class CompanionChatResponse(BaseModel):
    reply: str
    sources: List[str]
    suggested_action: Optional[SuggestedAction] = None
    suggested_prompts: List[str] = []
    learner_context_used: Optional[Dict[str, Any]] = None
