import json
import os
import shutil
from pathlib import Path
from flask import Flask, jsonify, request, abort

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
SKILLS_CORPUS_DIR = BASE_DIR / 'skills' / '.corpus'
SKILLS_CORPUS_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_FOLDER_CHARS = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_')


def validate_folder_name(folder_name: str) -> str:
    trimmed = folder_name.strip()
    if not trimmed:
        abort(400, 'Folder name is required')
    if any(ch not in ALLOWED_FOLDER_CHARS for ch in trimmed):
        abort(400, 'Folder name may only contain letters, numbers, hyphens, and underscores')
    return trimmed


def get_folder_path(folder_name: str) -> Path:
    folder = SKILLS_CORPUS_DIR / folder_name
    try:
        folder_resolved = folder.resolve()
    except RuntimeError:
        abort(400, 'Invalid folder name')
    if SKILLS_CORPUS_DIR not in folder_resolved.parents and folder_resolved != SKILLS_CORPUS_DIR:
        abort(400, 'Invalid folder path')
    return folder


def list_skill_folders():
    results = []
    for entry in sorted(SKILLS_CORPUS_DIR.iterdir()):
        if not entry.is_dir():
            continue
        skill_file = entry / 'SKILL.md'
        if not skill_file.exists():
            continue

        skill_content = skill_file.read_text(encoding='utf-8', errors='ignore')
        scripts_dir = entry / 'scripts'
        scripts = []
        if scripts_dir.exists() and scripts_dir.is_dir():
            for script_file in sorted(scripts_dir.iterdir()):
                if not script_file.is_file():
                    continue
                scripts.append({
                    'id': script_file.name,
                    'name': script_file.name,
                    'extension': script_file.suffix.lstrip('.'),
                    'content': script_file.read_text(encoding='utf-8', errors='ignore')
                })

        results.append({
            'id': entry.name,
            'folderName': entry.name,
            'skillMd': {
                'name': 'SKILL.md',
                'content': skill_content
            },
            'scripts': scripts
        })
    return results


@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


@app.route('/')
def hello_world():
    return '<h1>Hello, World!</h1>'


@app.route('/api/skills', methods=['GET'])
def api_skills():
    return jsonify({'skills': list_skill_folders()})


@app.route('/api/skills/import', methods=['POST'])
def api_import_skill():
    data = request.get_json(silent=True) or {}
    folder_name = validate_folder_name(data.get('folderName', ''))
    skill_md_content = data.get('skillMdContent', '')
    if not skill_md_content:
        abort(400, 'SKILL.md content is required')

    folder_path = get_folder_path(folder_name)
    if folder_path.exists():
        abort(400, 'Skill folder already exists')
    folder_path.mkdir(parents=True, exist_ok=False)
    (folder_path / 'SKILL.md').write_text(skill_md_content, encoding='utf-8')
    return jsonify({'success': True, 'folderName': folder_name})


@app.route('/api/skills/<folder_name>/scripts', methods=['POST'])
def api_add_script(folder_name):
    folder_name = validate_folder_name(folder_name)
    folder_path = get_folder_path(folder_name)
    if not folder_path.exists():
        abort(404, 'Skill folder not found')

    if 'file' not in request.files:
        abort(400, 'File is required')
    file = request.files['file']
    if file.filename == '':
        abort(400, 'File is required')

    scripts_dir = folder_path / 'scripts'
    scripts_dir.mkdir(parents=True, exist_ok=True)
    target_file = scripts_dir / file.filename
    file.save(str(target_file))
    return jsonify({'success': True, 'name': file.filename})


@app.route('/api/skills/<folder_name>', methods=['DELETE'])
def api_delete_skill(folder_name):
    folder_name = validate_folder_name(folder_name)
    folder_path = get_folder_path(folder_name)
    if not folder_path.exists():
        abort(404, 'Skill folder not found')
    shutil.rmtree(folder_path)
    return jsonify({'success': True})


@app.route('/api/skills/<folder_name>/scripts/<script_name>', methods=['DELETE'])
def api_delete_script(folder_name, script_name):
    folder_name = validate_folder_name(folder_name)
    if '/' in script_name or '\\' in script_name:
        abort(400, 'Invalid script name')
    folder_path = get_folder_path(folder_name)
    scripts_dir = folder_path / 'scripts'
    target_file = scripts_dir / script_name
    if not target_file.exists() or not target_file.is_file():
        abort(404, 'Script not found')
    target_file.unlink()
    return jsonify({'success': True})
