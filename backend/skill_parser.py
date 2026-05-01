from typing import List, Dict, Union
from dataclasses import dataclass
from sys import argv

import yaml
import re


@dataclass
class SkillDocument:
  metadata: Dict[str, Union[str, bool]]
  prose: str
  instructions: List[str]
  code_blocks: List[str]
  script_refs: List[str]


def extract_front_matter(content: str) -> Dict[str, Union[str, bool]]:
  try:
    front_matter = yaml.safe_load(content.split('---')[1])

    if not isinstance(front_matter, dict):
      raise ValueError("Front-matter is not a valid YAML dictionary.")
    return front_matter
  
  except Exception as e:
    raise ValueError(f"Error parsing front-matter: {e}")
  

def extract_code_blocks(content: str) -> List[str]:
  code_blocks = re.findall(r'```python(.*?)```', content, re.DOTALL)
  return [block.strip() for block in code_blocks] 


def extract_script_refs(content: str) -> List[str]:
  script_refs = re.findall(r'scripts/([\w_]+\.py)\s*→\s*([\w_]+)', content)
  return [f"{path} → {func}" for path, func in script_refs]


def extract_instructions(content: str) -> List[str]:
  instruction_pattern = r'(?i)(?:if|when|whenever|instruct|tell the user to)\s+[^.]+\.'
  instructions = re.findall(instruction_pattern, content)
  return [instr.strip() for instr in instructions]


def extract_prose(content: str) -> str:
  # remove front-matter
  content = re.sub(r'^---.*?---', '', content, flags=re.DOTALL)
  
  # remove code blocks
  content = re.sub(r'```python.*?```', '', content, flags=re.DOTALL)
  
  # remove markdown syntax (links, bold, italic)
  content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', content) # links
  content = re.sub(r'\*\*([^*]+)\*\*', r'\1', content) # bold
  content = re.sub(r'\*([^*]+)\*', r'\1', content) # italic
  
  return content.strip()


def parse_skill_document(content: str) -> SkillDocument:
  metadata = extract_front_matter(content)
  code_blocks = extract_code_blocks(content)
  script_refs = extract_script_refs(content)
  instructions = extract_instructions(content)
  prose = extract_prose(content)

  return SkillDocument(
    metadata=metadata,
    prose=prose,
    instructions=instructions,
    code_blocks=code_blocks,
    script_refs=script_refs
  )


if __name__ == "__main__":
  # test the parser with a sample skill document

  if len(argv) != 2:
    print("Usage: python skill_parser.py <path_to_skill_document>")
    exit(1)

  path = f'{argv[1]}/SKILL.md'
  with open(path, 'r') as file:
    content = file.read()

  skill_doc = parse_skill_document(content)

  print("Metadata:")
  for key, value in skill_doc.metadata.items():
    print(f"  {key}: {value}")

  print("\nProse:")
  print(skill_doc.prose)

  print("\nInstructions:")
  for instr in skill_doc.instructions:
    print(f"  - {instr}")

  print("\nCode Blocks:")
  for block in skill_doc.code_blocks:
    print(f"  - {block[:30]}...")  # print first 30 chars for brevity

  print("\nScript References:")
  for ref in skill_doc.script_refs:
    print(f"  - {ref}")
