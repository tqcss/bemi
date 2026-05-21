from typing import Any, Dict, List

from config import embedding_model as embedding_config
from util.preprocessor import preprocess_text
from util.dclass import RetrievalResults, RetrievedSkill
from core.indexer import skill_col, chunk_col, _embedder


def _build_retrieval_query(query: str, history: str = '') -> str:
	recent_text = ' '.join(
		message.content for message in history[-4:]
		if hasattr(message, 'content')
	)

	return f'{recent_text} {query}'.strip()


def retrieve(
	query: str,
	history: List[str] = [],
	top_k: int = embedding_config.TOP_K_SKILLS
) -> RetrievalResults:
	enriched = _build_retrieval_query(query, history)
	cleaned = preprocess_text(enriched).cleaned

	if not cleaned.strip():
		return RetrievalResults()

	count = skill_col.count()
	if count == 0:
		return RetrievalResults(fallback=True)

	q_embed = _embedder.embed_query(cleaned)

	# skill level retrieval
	raw = skill_col.query(
		query_embeddings=[q_embed],
		n_results=(min(top_k, count)),
		include=['documents', 'metadatas', 'distances']
	)

	results = []
	for doc, meta, dist in zip(
		raw['documents'][0],
		raw['metadatas'][0],
		raw['distances'][0]
	):
		if dist > embedding_config.CONFIDENCE_THRESHOLD:
			continue # below confidence threshold, skip

		entry = RetrievedSkill(
			metadata=meta,
			prose=doc,
			chunks=[],
			distance=dist
		)

		# chunk level retrieval for pure data skills only
		exec_meta = meta.get('execution', {})
		# If it's a string (old format), check it; if it's a dict (new format), check 'enabled'
		if isinstance(exec_meta, str):
			requires_exec = exec_meta == 'True'
		else:
			requires_exec = exec_meta.get('enabled', False) if isinstance(exec_meta, dict) else False

		if not requires_exec:
			chunk_results = chunk_col.query(
				query_embeddings=[q_embed],
				n_results=embedding_config.TOP_J_CHUNKS,
				where={'parent_skill_id': meta['skill_id']},
				include=['documents', 'distances']
			)
			entry.chunks = chunk_results['documents'][0]

		results.append(entry)

	# sort by distance ascending
	results.sort(key=lambda x: x.distance)

	return RetrievalResults(
		skills=results,
		fallback=(len(results) == 0)
	)



def get_skill_context(result_entry: RetrievedSkill) -> str:
	chunks = result_entry.chunks
	if chunks:
		print('has chunks')
		return '\n---\n'.join(chunks)
	
	print('no chunks')
	return result_entry.prose


# testing
if __name__ == '__main__':
	query = "average of 10 and 20"
	results = retrieve(query)
	print(results)
