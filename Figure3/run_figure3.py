from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
SCRIPTS = ROOT / "scripts"


def main() -> None:
    for name in (
        "extract_experimental_panels.py",
        "generate_figure_s3_computational.py",
        "assemble_figure3.py",
        "assemble_figure_s3.py",
    ):
        subprocess.run([sys.executable, str(SCRIPTS / name)], check=True)


if __name__ == "__main__":
    main()
