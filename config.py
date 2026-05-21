# Configuration module for BEMI


SKILLS_DIR = './skills'
CHROMA_DIR    = './data/chroma'


#* UNSLOTH MODEL CONFIGURATION
class unsloth_model:
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


class embedding:
	MODEL_NAME = 'embeddinggemma'
	CHUNK_SIZE = 256
	CHUNK_OVERLAP = 32
