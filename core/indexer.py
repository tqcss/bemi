from importlib import metadata

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
		chunk = " ".join(words[start: start + size])
		if chunk.strip():
			chunks.append(chunk)
		start += size - overlap

	return chunks


def index_skill(skill: ParsedSkill) -> None:
	metadata = skill.metadata
	skill_id = metadata.get('skill_id')

	if not skill_id:
		warn(
    		f"Skill {metadata.get('name', 'unknown')} is missing a skill_id. Skipping indexing.")
		return

	# level 1: skill retrieval
	skill_text = preprocess_skill_text(skill)
	skill_embedding = _embedder.embed_query(skill_text)

	skill_col.upsert(
		ids=[skill_id],
		embeddings=[skill_embedding],
		documents=[skill_text],
		metadatas=[{
			'skill_id': skill_id,
			'name': metadata.get('name', ''),
			'requires_execution': str(metadata.get('requires_execution', False)),
			'file_path': skill.file_path
		}]
	)

	# level 2: chunk vectors for pure data skills only
	if not metadata.get('requires_execution', False):
		prose = skill.prose
		chunks = chunk_text(prose)
		ids, embeddings, documents, metadatas = [], [], [], []

		for index, chunk in enumerate(chunks):
			cleaned = preprocess_text(chunk).cleaned

			if not cleaned.strip():
				continue
	
			chunk_id = f'{skill_id}_chunk_{index}'
			ids.append(chunk_id)
			embeddings.append(_embedder.embed_query(cleaned))
			documents.append(chunk)
			metadatas.append({
				'parent_skill_id': skill_id,
				'chunk_index': index
			})

		if ids:
			chunk_col.upsert(
				ids=ids,
				embeddings=embeddings,
				documents=documents,
				metadatas=metadatas
			)


def index_all_skills(skills_dir: str = embedding_config.SKILLS_DIR) -> int:
	skills = parse_all_skills(skills_dir)
	ok = 0

	for skill in skills:
		try:
			index_skill(skill)
			ok += 1
		except Exception as e:
			skill_id = skill.metadata.get('skill_id', skill.file_path)
			warn(f"Failed to index skill {skill_id}: {e}")

	print(f'[indexer] indexed {ok}/{len(skills)} skills to {embedding_config.CHROMA_DIR}')
	return ok


def drop_skill(skill_id: str) -> None:
	# skill_col.delete(ids=[skill_id])
	# chunk_col.delete(ids=[f'{skill_id}_chunk_{i}' for i in range(100)]) # naive way to delete chunks, assumes max 100 chunks per skill

	try:
		skill_col.delete(ids=[skill_id])
	except Exception as e:
		warn(f'[indexer] failed to delete skill {skill_id} from skill_col: {e}')

	try:
		existing_chunks = chunk_col.get(where={'parent_skill_id': skill_id})
		if existing_chunks['ids']:
			chunk_col.delete(ids=existing_chunks['ids'])
	except Exception as e:
		warn(f'[indexer] failed to delete chunks for skill {skill_id} from chunk_col: {e}')
