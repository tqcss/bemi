import re
import frontmatter

from typing import List
from pathlib import Path
from warnings import warn
from dclass import ParsedSkill


def parse_skill(file_path: str) -> ParsedSkill:
	with open(file_path, 'r', encoding='utf-8') as f:
		post = frontmatter.load(f)

	content = post.content

	# extract code blocks before stripping
	code_pattern = r'```(\w*)\n(.*?)```'
	raw_blocks = re.findall(code_pattern, content, re.DOTALL)
	code_blocks = [
		{'language': lang.strip() or 'text', 'code': code.strip()}
		for lang, code in raw_blocks
	]

	# strip code blocks from prose
	prose = re.sub(r'```.*?```', ' ', content, flags=re.DOTALL)

    # strip markdown headers
	prose = re.sub(r'^#{1,6}\s.*$', '', prose, flags=re.MULTILINE)

    # strip table rows
	prose = re.sub(r'\|.*\|', ' ', prose)

    # collapse whitespace
	prose = re.sub(r'\s+', ' ', prose).strip()

	# parse parameters section
	param_pattern = re.compile(
	r"-\s+(\w+)\s+\(([^)]+)\)\s+\[([^\]]+)\]:\s+(.+?)(?=\n-|\n\n|\Z)",
	re.DOTALL,
	)

	params = []
	for match in param_pattern.finditer(content):
		name, ptype, req_str, desc = match.groups()
		default_match = re.search(
			r'default:\s*["\']?([^"\',\]\n]+)["\']?', req_str
	)

		params.append({
	'name': name.strip(),
	'type': ptype.strip(),
	'required': 'required' in req_str.lower(),
	'default': default_match.group(1).strip() if default_match else None,
	'description': re.sub(r'\s+', ' ', desc).strip(),
	})

	# parse examples section
	example_pattern = re.compile(
	r'User:\s*(.+?)\n(?:Context:\s*(.+?)\n)?Response:\s*(.+?)(?=\n\nUser:|\Z)',
	re.DOTALL,
	)
	examples = [{
	'user':     user.strip(),
	'context':  (context or '').strip(),
	'response': response.strip(),
	} for user, context, response in example_pattern.findall(content) ]

	prose_pattern = re.compile(
		r'\s*Overview\s*\n(.*?)(?=\n\s*(?:Parameters?|Code|Examples?)\b|\Z)',
		re.DOTALL
	)
	prose_match = prose_pattern.search(content)

	if prose_match:
		# prose starts from the overview section and cuts off at Parameters/Code/Examples
		prose = prose_match.group(1).strip()
		
		# overview is just the first paragraph of that prose block
		overview = prose.split('\n\n')[0].strip()
	else:
		# FALLBACK: If Overview header is missing entirely
		# Extract everything from the very start of the file up to those sections
		fallback_pattern = re.compile(
			r'^(.*?)(?=\n##\s*(?:Parameters?|Code|Examples?)\b|\Z)',
			re.DOTALL | re.IGNORECASE
		)
		fallback_match = fallback_pattern.search(content)
		
		prose = fallback_match.group(1).strip() if fallback_match else content.strip()
		overview = prose.split('\n\n')[0].strip() if prose else ''


	return ParsedSkill(
		metadata=dict(post.metadata),
		overview=overview,
		prose=prose,
		code_blocks=code_blocks,
		params=params,
		examples=examples,
		file_path=str(file_path)
	)


def parse_all_skills(skills_dir: str) -> List[ParsedSkill]:
	paths = sorted(Path(skills_dir).glob("*.md"))
	skills = []

	for path in paths:
		try:
			skills.append(parse_skill(str(path)))
		except Exception as e:
			warn(f'failed to parse {path}, ignoring skill: {e}')
	
	return skills


def get_skill_run_code(skill: ParsedSkill) -> str:
	for block in skill.code_blocks:
		#! HARDCODED to python skills, as system currently only supports python
		if block['language'].lower() in ('python', 'py', ''):
			return block['code']
		
	return skill.code_blocks[0]['code'] if skill.code_blocks else ''
