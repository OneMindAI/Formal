from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class DocumentModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str  # LaTeX content
    template_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    tags: List[str] = []
    is_public: bool = False
    metadata: Dict[str, Any] = {}

class TemplateModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    content: str  # LaTeX template content
    category: str  # academic, business, presentation, etc.
    preview_image: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_builtin: bool = True
    metadata: Dict[str, Any] = {}

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    message: str
    response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    context: Dict[str, Any] = {}

class DocumentCreate(BaseModel):
    title: str
    content: str = ""
    template_id: Optional[str] = None
    tags: List[str] = []

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    document_id: str
    message: str
    context: Optional[Dict[str, Any]] = None