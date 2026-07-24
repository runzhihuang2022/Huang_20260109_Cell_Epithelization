import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).resolve().parent / "scripts"))

from build_figure_s2_v03 import build_figure


if __name__ == "__main__":
    build_figure()

