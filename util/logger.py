import logging
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), '..', 'bemi.log')),
        logging.StreamHandler()
    ]
)

def get_logger(name: str):
    return logging.getLogger(name)
