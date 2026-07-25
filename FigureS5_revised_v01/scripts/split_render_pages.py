from pathlib import Path
import sys

import fitz


def main() -> None:
    package = Path(sys.argv[1]).resolve()
    source = package / "figures" / "FigureS5_animal_revised_v01_3page.pdf"
    out_dir = package / "figures" / "pages"
    out_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(source)
    panel_ranges = ("A-F", "G-J", "K-P")
    for index, panel_range in enumerate(panel_ranges):
        single = fitz.open()
        single.insert_pdf(doc, from_page=index, to_page=index)
        stem = f"FigureS5_{panel_range}_animal"
        pdf_path = out_dir / f"{stem}.pdf"
        single.save(pdf_path, garbage=4, deflate=True)
        single.close()

        page = doc[index]
        pix = page.get_pixmap(matrix=fitz.Matrix(600 / 72, 600 / 72), alpha=False)
        pix.save(out_dir / f"{stem}_600dpi.png")

    doc.close()


if __name__ == "__main__":
    main()
