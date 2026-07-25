"""Assemble the three evidence-bearing animal slides into one A4-width figure.

The source slides remain vector PDFs so editable labels and line art are
preserved. No experimental result is inferred beyond the supplied deck.
"""

from pathlib import Path
import fitz
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source_animals.pdf"
OUT = ROOT / "figures"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    src = fitz.open(SOURCE)
    if len(src) != 3:
        raise ValueError(f"Expected 3 source slides, found {len(src)}")
    width = 7.08 * 72
    height = 11.45 * 72
    margin = 10
    gap = 6
    row_h = (height - 2 * margin - 2 * gap) / 3
    doc = fitz.open()
    page = doc.new_page(width=width, height=height)
    for i in range(3):
        source_page = src[i]
        pix = source_page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False)
        rgb = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, 3)
        nonwhite = np.any(rgb < 248, axis=2)
        yy, xx = np.where(nonwhite)
        if not len(xx):
            clip = source_page.rect
        else:
            pad = 5
            clip = fitz.Rect(
                max(0, xx.min() - pad), max(0, yy.min() - pad),
                min(pix.width, xx.max() + pad), min(pix.height, yy.max() + pad),
            )
        y0 = margin + i * (row_h + gap)
        rect = fitz.Rect(margin, y0, width - margin, y0 + row_h)
        page.show_pdf_page(rect, src, i, keep_proportion=True, overlay=True, clip=clip)
    pdf = OUT / "FigureS5_animal_revised_v01.pdf"
    doc.save(pdf, garbage=4, deflate=True)
    doc.close()
    src.close()

    check = fitz.open(pdf)
    pix = check[0].get_pixmap(matrix=fitz.Matrix(600 / 72, 600 / 72), alpha=False)
    pix.save(OUT / "FigureS5_animal_revised_v01_600dpi.png")
    check.close()


if __name__ == "__main__":
    main()
