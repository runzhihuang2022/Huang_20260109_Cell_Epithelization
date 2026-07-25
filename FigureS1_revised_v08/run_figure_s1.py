"""One-command entry point for rebuilding Figure S1 v08 source panels."""

from pathlib import Path
import runpy


HERE = Path(__file__).resolve().parent
runpy.run_path(str(HERE / "scripts" / "build_figure_s1_v06.py"), run_name="__main__")
runpy.run_path(str(HERE / "scripts" / "build_figure_s1_ef_v08.py"), run_name="__main__")

