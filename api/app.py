import uvicorn
import os
import shutil
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from main import run, _ensure_indexed
from core.indexer import index_all_skills
from config import dir_path

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

class ImportRequest(BaseModel):
    folderName: str
    skillMdContent: str

@app.post("/chat")
async def chat(request: QueryRequest):
    response = run(request.query, stream=False)
    return {"response": response}

@app.get("/api/skills")
async def get_skills():
    skills = []
    skills_path = Path(dir_path.SKILLS_DIR)
    if not skills_path.exists():
        return {"skills": []}

    for folder in skills_path.iterdir():
        if folder.is_dir() and not folder.name.startswith('.'):
            skill_md = folder / "SKILL.md"
            if skill_md.exists():
                with open(skill_md, "r", encoding="utf-8") as f:
                    content = f.read()
                skills.append({
                    "id": folder.name,
                    "folderName": folder.name,
                    "skillMd": {"content": content, "name": "SKILL.md"},
                    "scripts": [] # Could be expanded to list scripts
                })
    return {"skills": skills}

@app.post("/api/skills/import")
async def import_skill(request: ImportRequest):
    skills_path = Path(dir_path.SKILLS_DIR)
    new_skill_dir = skills_path / request.folderName
    
    if new_skill_dir.exists():
        raise HTTPException(status_code=400, detail="Skill folder already exists")
    
    new_skill_dir.mkdir(parents=True, exist_ok=True)
    with open(new_skill_dir / "SKILL.md", "w", encoding="utf-8") as f:
        f.write(request.skillMdContent)
    
    index_all_skills(dir_path.SKILLS_DIR)
    return {"message": "Skill imported and indexed successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
