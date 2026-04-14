#!/usr/bin/env python3
"""Repository setup script

Automates Bemi repository initialization:
  1. Install Python dependencies from requirements.txt
  2. Download NLTK packages (punkt, stopwords, wordnet, etc.)
  3. Download spaCy en_core_web_sm model
  4. Initialize sqlitedict database with skills and chunks stores

Usage:
  python setup.py                      # Run complete setup
  python setup.py --skip-install       # Skip pip dependencies
"""

from __future__ import annotations

import argparse
import subprocess
import sys

from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REQUIREMENTS_FILE = ROOT / "requirements.txt"
NLTK_DOWNLOAD_DIR = ROOT / "data" / "nltk"
SPACY_MODEL_TARGET = ROOT / "models"
DEFAULT_DB_PATH = ROOT / "data" / "bemi.db"

NLTK_PACKAGES = [
    "punkt",
    "stopwords",
    "wordnet",
    "averaged_perceptron_tagger",
]


def run_command(command: list[str]) -> None:
    """Execute a shell command and exit on failure."""
    print(f"\n> {' '.join(command)}")
    subprocess.run(command, check=True)


def install_requirements() -> None:
    """Install Python dependencies from requirements.txt."""
    if not REQUIREMENTS_FILE.exists():
        raise FileNotFoundError(
            f"requirements file not found: {REQUIREMENTS_FILE}")

    run_command([sys.executable, "-m", "pip", "install",
                "-r", str(REQUIREMENTS_FILE)])


def download_nltk_data() -> None:
    """Download NLTK packages to local data directory."""
    import nltk

    NLTK_DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    for package in NLTK_PACKAGES:
        print(f"Downloading NLTK package: {package}")
        nltk.download(package, download_dir=str(NLTK_DOWNLOAD_DIR))


def download_spacy_model() -> None:
    """Download spaCy en_core_web_sm model to local models directory."""
    SPACY_MODEL_TARGET.mkdir(parents=True, exist_ok=True)
    run_command(
        [
            sys.executable,
            "-m",
            "spacy",
            "download",
            "en_core_web_sm",
            "--target",
            str(SPACY_MODEL_TARGET),
            "--upgrade"
        ]
    )


def initialize_sqlite_schema(db_path: Path) -> None:
    """Initialize sqlitedict stores and schema metadata.

    Creates two stores (skills and chunks) with:
      - __schema__: field type definitions
      - __next_id__: auto-increment counter starting at 1
    """
    from sqlitedict import SqliteDict

    db_path.parent.mkdir(parents=True, exist_ok=True)

    # Initialize skills store
    with SqliteDict(str(db_path), tablename="skills", autocommit=True) as skills_store:
        skills_store.setdefault(
            "__schema__",
            {
                "id": "INTEGER",
                "name": "TEXT",
                "path": "TEXT",
                "tags": "TEXT",
                "created_at": "DATETIME",
            },
        )
        skills_store.setdefault("__next_id__", 1)

    # Initialize chunks store
    with SqliteDict(str(db_path), tablename="chunks", autocommit=True) as chunks_store:
        chunks_store.setdefault(
            "__schema__",
            {
                "id": "INTEGER",
                "skill_id": "INTEGER",
                "text": "TEXT",
                "has_code": "BOOLEAN",
                "function_name": "TEXT",
                "script_path": "TEXT",
                "embedding_id": "TEXT",
            },
        )
        chunks_store.setdefault("__next_id__", 1)


def _next_id(store: object) -> int:
    """Atomically increment and return the next ID from store metadata."""
    if not hasattr(store, "get") or not hasattr(store, "__setitem__"):
        raise TypeError("store must support get and item assignment")

    next_id = int(store.get("__next_id__", 1))
    store["__next_id__"] = next_id + 1
    return next_id


def create_skill_record(
    db_path: Path,
    name: str,
    path: str,
    tags: str | None = None,
    created_at: str | None = None,
) -> int:
    """Create a new skill record. Returns the skill_id."""
    from sqlitedict import SqliteDict

    if not name or not name.strip():
        raise ValueError("name must be a non-empty string")
    if not path or not path.strip():
        raise ValueError("path must be a non-empty string")

    created_at_value = created_at or datetime.now(timezone.utc).isoformat()

    with SqliteDict(str(db_path), tablename="skills", autocommit=True) as skills_store:
        skill_id = _next_id(skills_store)
        skills_store[str(skill_id)] = {
            "id": skill_id,
            "name": name.strip(),
            "path": path.strip(),
            "tags": tags,
            "created_at": created_at_value,
        }
    return skill_id


def create_chunk_record(
    db_path: Path,
    skill_id: int,
    text: str,
    has_code: int | bool = 0,
    function_name: str | None = None,
    script_path: str | None = None,
    embedding_id: str | None = None,
) -> int:
    """Create a new chunk record linked to a skill. Returns the chunk_id."""
    from sqlitedict import SqliteDict

    if not isinstance(skill_id, int) or skill_id <= 0:
        raise ValueError("skill_id must be a positive integer")
    if not text or not text.strip():
        raise ValueError("text must be a non-empty string")

    has_code_value = int(has_code)
    if has_code_value not in (0, 1):
        raise ValueError("has_code must be 0/1 or False/True")

    with SqliteDict(str(db_path), tablename="skills", autocommit=True) as skills_store:
        if str(skill_id) not in skills_store:
            raise ValueError(
                f"skill_id {skill_id} does not exist in skills store")

    with SqliteDict(str(db_path), tablename="chunks", autocommit=True) as chunks_store:
        chunk_id = _next_id(chunks_store)
        chunks_store[str(chunk_id)] = {
            "id": chunk_id,
            "skill_id": skill_id,
            "text": text.strip(),
            "has_code": has_code_value,
            "function_name": function_name,
            "script_path": script_path,
            "embedding_id": embedding_id,
        }
    return chunk_id


def parse_args() -> argparse.Namespace:
    """Parse and return command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Set up repository dependencies and NLP assets."
    )
    parser.add_argument(
        "--skip-install",
        action="store_true",
        help="Skip installing requirements from requirements.txt.",
    )
    parser.add_argument(
        "--skip-nltk",
        action="store_true",
        help="Skip downloading NLTK data.",
    )
    parser.add_argument(
        "--skip-spacy",
        action="store_true",
        help="Skip downloading the spaCy en_core_web_sm model.",
    )
    parser.add_argument(
        "--skip-db",
        action="store_true",
        help="Skip initializing sqlitedict database stores.",
    )
    return parser.parse_args()


def main() -> None:
    """Orchestrate setup steps based on CLI arguments."""
    args = parse_args()

    try:
        if not args.skip_install:
            print("Installing Python requirements...")
            install_requirements()

        if not args.skip_nltk:
            print("\nDownloading NLTK data...")
            download_nltk_data()

        if not args.skip_spacy:
            print("\nDownloading spaCy model...")
            download_spacy_model()

        if not args.skip_db:
            print(f"\nInitializing sqlitedict stores at {args.db_path}...")
            initialize_sqlite_schema(args.db_path)

        print("\nSetup completed successfully")
    except Exception as exc:  # noqa: BLE001
        print(f"\nSetup failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
