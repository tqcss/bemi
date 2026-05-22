# Configuration module for BEMI
from warnings import warn


class dir_path:
	SKILLS_DIR = './skills'
	CHROMA_DIR    = './data/chroma'


#* UNSLOTH MODEL CONFIGURATION
class unsloth_gemma4_model:
	GEMMA_4_MODEL_NAME = 'unsloth/gemma-4-E2B-it' # change to 'unsloth/gemma-4-E4B-it' if you want to use 4B model

	GEMMA_4_PRETRAINED_PARAMS = {
		'model_name': GEMMA_4_MODEL_NAME,
		'dtype': None,
		'max_seq_length': 1024,
		'load_in_4bit': True,
		'full_fine_tuning': False,
	}

	GEMMA_4_LORA_PARAMS = {
		'finetune_vision_layers': False,
		'finetune_language_layers': True,
		'finetune_attention_modules': True,
		'finetune_mlp_modules': True,

		'r': 8,
		'lora_alpha': 8,
		'lora_dropout': 0,
		'bias': 'none',
		'random_state': 3407,
	}


class embedding_model:
	MODEL_NAME = 'embeddinggemma'
	CHUNK_SIZE = 256
	CHUNK_OVERLAP = 32

	TOP_K_SKILLS = 3
	TOP_J_CHUNKS = 3

	def get_confidence_threshold() -> float:
		warn('reminder to adjust retrieval confidence threshold based on evaluation performance')
		return 1.5
	CONFIDENCE_THRESHOLD = get_confidence_threshold()
	# CONFIDENCE_THRESHOLD = 0.40


class intent_classifier:
	MODEL_PATH = './models/intent_classifier.pkl'
	VEC_PATH   = './models/intent_vectorizer.pkl'