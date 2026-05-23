import os
import json
import uuid
import subprocess
import tempfile
import sys
from typing import Dict, Any

from config import DEFAULT_TIMEOUT
from util.dclass import ExecutionResult


def execute(code: str, params: Dict[str, Any], timeout: int = DEFAULT_TIMEOUT) -> ExecutionResult:
    if not code.strip():
        return ExecutionResult(
            status="error",
            output="Error: no code block found in this skill."
        )

    params_line = f"params = {json.dumps(params, default=str)}\n"
    full_code = params_line + code + "\n\nprint(run(**params))\n"

    tmp_path = os.path.join(tempfile.gettempdir(), f"bemi_{uuid.uuid4().hex}.py")
    try:
        with open(tmp_path, "w", encoding="utf-8") as f:
            f.write(full_code)

        result = subprocess.run(
            [sys.executable, tmp_path],
            capture_output=True,
            text=True,
            timeout=timeout,
        )

        if result.returncode == 0:
            return ExecutionResult(
                status="success",
                output=result.stdout.strip()
            )
        else:
            return ExecutionResult(
                status="error",
                output=result.stderr.strip() or "Unknown error (non-zero exit code)."
            )

    except subprocess.TimeoutExpired:
        return ExecutionResult(
            status="error",
            output=f"Error: execution timed out after {timeout} seconds."
        )
    except Exception as e:
        return ExecutionResult(
            status="error",
            output=f"Error: {str(e)}"
        )
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


def format_execution_result(result: ExecutionResult) -> str:
    if result.status == "success":
        return result.output or "(no output)"
    return result.output
