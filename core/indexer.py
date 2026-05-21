import chromadb

from typing import List
from warnings import warn
from langchain_ollama import OllamaEmbeddings

from config import embedding as embedding_config
from util.dclass import ParsedSkill
from util.skill_parser import parse_all_skills
from util.preprocessor import preprocess_text, preprocess_skill_text


_embedder = OllamaEmbeddings(embedding_config.EMBED_MODEL)
_client = chromadb.PersistentClient(path=embedding_config.CHROMA_DIR)

skill_col = _client.get_or_create_collection('skill_level')
chunk_col = _client.get_or_create_collection('chunk_level')


def chunk_text(
    text: str,
    size: int = embedding_config.CHUNK_SIZE,
    overlap: int = embedding_config.CHUNK_OVERLAP
) -> List[str]:
    words = text.split()
    chunks, start = [], 0
    
    while start < len(words):
        chunk = " ".join(words[start : start + size])
        if chunk.strip():
            chunks.append(chunk)
        start += size - overlap
        
    return chunks


def index_skill(skill: ParsedSkill) -> None:
    pass
