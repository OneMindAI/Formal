from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv
import logging
from typing import List, Optional

from models import DocumentModel, TemplateModel, ChatMessage, DocumentCreate, DocumentUpdate, ChatRequest
from database import connect_to_mongo, close_mongo_connection, get_collection

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    await initialize_templates()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="Formal - LaTeX Editor API",
    description="Backend API for Formal LaTeX Editor with AI Integration",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize built-in templates
async def initialize_templates():
    """Initialize the database with built-in LaTeX templates"""
    templates_collection = await get_collection("templates")
    
    # Check if templates already exist
    existing_count = await templates_collection.count_documents({"is_builtin": True})
    if existing_count > 0:
        logger.info(f"Found {existing_count} existing built-in templates")
        return
    
    builtin_templates = [
        {
            "id": "template_article",
            "name": "Academic Article",
            "description": "Standard academic article format with abstract, sections, and bibliography",
            "category": "academic",
            "is_builtin": True,
            "content": """\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{geometry}
\\geometry{margin=1in}

\\title{Your Title Here}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
Your abstract goes here. This should be a brief summary of your work.
\\end{abstract}

\\section{Introduction}
Your introduction content goes here.

\\section{Methodology}
Describe your methodology here.

\\section{Results}
Present your results here.

\\section{Conclusion}
Your conclusions go here.

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}"""
        },
        {
            "id": "template_report",
            "name": "Business Report",
            "description": "Professional business report template with executive summary",
            "category": "business",
            "is_builtin": True,
            "content": """\\documentclass[12pt]{report}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{graphicx}
\\usepackage{fancyhdr}
\\geometry{margin=1in}

\\pagestyle{fancy}
\\fancyhf{}
\\rhead{\\thepage}
\\lhead{Business Report}

\\title{Business Report Title}
\\author{Company Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\chapter{Executive Summary}
Provide a high-level overview of the report findings and recommendations.

\\chapter{Introduction}
Introduce the purpose and scope of this report.

\\chapter{Analysis}
Present your detailed analysis here.

\\chapter{Recommendations}
Provide actionable recommendations based on your analysis.

\\chapter{Conclusion}
Summarize the key points and next steps.

\\end{document}"""
        },
        {
            "id": "template_presentation",
            "name": "Presentation Slides",
            "description": "LaTeX Beamer presentation template",
            "category": "presentation",
            "is_builtin": True,
            "content": """\\documentclass{beamer}
\\usetheme{Madrid}
\\usecolortheme{default}

\\title{Your Presentation Title}
\\author{Your Name}
\\institute{Your Institution}
\\date{\\today}

\\begin{document}

\\frame{\\titlepage}

\\begin{frame}
\\frametitle{Outline}
\\tableofcontents
\\end{frame}

\\section{Introduction}
\\begin{frame}
\\frametitle{Introduction}
\\begin{itemize}
    \\item First point
    \\item Second point
    \\item Third point
\\end{itemize}
\\end{frame}

\\section{Main Content}
\\begin{frame}
\\frametitle{Main Point}
Your main content goes here.
\\end{frame}

\\section{Conclusion}
\\begin{frame}
\\frametitle{Conclusion}
\\begin{itemize}
    \\item Summary point 1
    \\item Summary point 2
    \\item Thank you!
\\end{itemize}
\\end{frame}

\\end{document}"""
        },
        {
            "id": "template_math",
            "name": "Mathematical Document",
            "description": "Template for mathematical proofs and theorems",
            "category": "academic",
            "is_builtin": True,
            "content": """\\documentclass[12pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsthm}
\\usepackage{amssymb}
\\usepackage{geometry}
\\geometry{margin=1in}

\\newtheorem{theorem}{Theorem}
\\newtheorem{lemma}{Lemma}
\\newtheorem{corollary}{Corollary}
\\newtheorem{definition}{Definition}

\\title{Mathematical Document}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
This document demonstrates mathematical typesetting in LaTeX.

\\begin{definition}
A function $f: \\mathbb{R} \\to \\mathbb{R}$ is continuous at $x = a$ if...
\\end{definition}

\\begin{theorem}
For any continuous function $f$ on $[a,b]$, we have:
\\begin{equation}
\\int_a^b f(x) dx = F(b) - F(a)
\\end{equation}
where $F$ is an antiderivative of $f$.
\\end{theorem}

\\begin{proof}
The proof follows from the Fundamental Theorem of Calculus...
\\end{proof}

\\section{Examples}
\\begin{align}
\\frac{d}{dx}\\left(\\sin(x)\\right) &= \\cos(x) \\\\
\\frac{d}{dx}\\left(e^x\\right) &= e^x \\\\
\\frac{d}{dx}\\left(\\ln(x)\\right) &= \\frac{1}{x}
\\end{align}

\\end{document}"""
        },
        {
            "id": "template_letter",
            "name": "Formal Letter",
            "description": "Professional letter template",
            "category": "business",
            "is_builtin": True,
            "content": """\\documentclass[12pt]{letter}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}

\\signature{Your Name}
\\address{Your Address \\\\ City, State ZIP \\\\ Email: your.email@example.com}

\\begin{document}

\\begin{letter}{Recipient Name \\\\ Recipient Address \\\\ City, State ZIP}

\\opening{Dear [Recipient Name],}

This is the body of your letter. Write your message here with proper paragraphs and formatting.

Second paragraph continues your message with additional details or information you want to convey.

\\closing{Sincerely,}

\\end{letter}

\\end{document}"""
        }
    ]
    
    # Insert templates
    for template in builtin_templates:
        try:
            await templates_collection.insert_one(template)
            logger.info(f"Inserted template: {template['name']}")
        except Exception as e:
            logger.error(f"Failed to insert template {template['name']}: {e}")
    
    logger.info("Built-in templates initialization completed")

# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Formal LaTeX Editor API is running"}

# Document endpoints
@app.post("/api/documents", response_model=DocumentModel)
async def create_document(document: DocumentCreate):
    """Create a new LaTeX document"""
    try:
        documents_collection = await get_collection("documents")
        
        new_document = DocumentModel(**document.dict())
        await documents_collection.insert_one(new_document.dict())
        
        return new_document
    except Exception as e:
        logger.error(f"Error creating document: {e}")
        raise HTTPException(status_code=500, detail="Failed to create document")

@app.get("/api/documents", response_model=List[DocumentModel])
async def get_documents(skip: int = 0, limit: int = 20):
    """Get all documents with pagination"""
    try:
        documents_collection = await get_collection("documents")
        
        cursor = documents_collection.find().skip(skip).limit(limit).sort("created_at", -1)
        documents = await cursor.to_list(length=limit)
        
        return [DocumentModel(**doc) for doc in documents]
    except Exception as e:
        logger.error(f"Error fetching documents: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch documents")

@app.get("/api/documents/{document_id}", response_model=DocumentModel)
async def get_document(document_id: str):
    """Get a specific document by ID"""
    try:
        documents_collection = await get_collection("documents")
        
        document = await documents_collection.find_one({"id": document_id})
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return DocumentModel(**document)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching document {document_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch document")

@app.put("/api/documents/{document_id}", response_model=DocumentModel)
async def update_document(document_id: str, update_data: DocumentUpdate):
    """Update a document"""
    try:
        documents_collection = await get_collection("documents")
        
        # Prepare update data
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        result = await documents_collection.update_one(
            {"id": document_id},
            {"$set": update_dict}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Return updated document
        updated_document = await documents_collection.find_one({"id": document_id})
        return DocumentModel(**updated_document)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating document {document_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update document")

@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document"""
    try:
        documents_collection = await get_collection("documents")
        
        result = await documents_collection.delete_one({"id": document_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return {"message": "Document deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document {document_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete document")

# Template endpoints
@app.get("/api/templates", response_model=List[TemplateModel])
async def get_templates(category: Optional[str] = None):
    """Get all templates, optionally filtered by category"""
    try:
        templates_collection = await get_collection("templates")
        
        query = {}
        if category:
            query["category"] = category
        
        cursor = templates_collection.find(query).sort("name", 1)
        templates = await cursor.to_list(length=None)
        
        return [TemplateModel(**template) for template in templates]
    except Exception as e:
        logger.error(f"Error fetching templates: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch templates")

@app.get("/api/templates/{template_id}", response_model=TemplateModel)
async def get_template(template_id: str):
    """Get a specific template by ID"""
    try:
        templates_collection = await get_collection("templates")
        
        template = await templates_collection.find_one({"id": template_id})
        if not template:
            raise HTTPException(status_code=404, detail="Template not found")
        
        return TemplateModel(**template)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching template {template_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch template")

# Chat endpoints (placeholder for AI integration)
@app.post("/api/chat")
async def chat_with_ai(chat_request: ChatRequest):
    """Handle AI chat requests - placeholder for future AI integration"""
    try:
        # For now, return a placeholder response
        # This will be enhanced with actual AI integration in Phase 4
        response = {
            "message": "AI integration coming soon! This is a placeholder response.",
            "suggestions": [
                "Try adding some mathematical equations with \\begin{equation}",
                "Consider using \\section{} to organize your content",
                "Use \\textbf{} for bold text and \\textit{} for italic text"
            ]
        }
        
        # Store chat message for future reference
        chat_collection = await get_collection("chat_messages")
        chat_message = ChatMessage(
            document_id=chat_request.document_id,
            message=chat_request.message,
            response=str(response),
            context=chat_request.context or {}
        )
        
        await chat_collection.insert_one(chat_message.dict())
        
        return response
    except Exception as e:
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail="Chat service temporarily unavailable")

@app.get("/api/categories")
async def get_template_categories():
    """Get all available template categories"""
    return {
        "categories": [
            {"id": "academic", "name": "Academic", "description": "Academic papers, theses, and research documents"},
            {"id": "business", "name": "Business", "description": "Reports, letters, and business documents"},
            {"id": "presentation", "name": "Presentation", "description": "Slides and presentation materials"},
            {"id": "personal", "name": "Personal", "description": "Personal documents and notes"}
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)