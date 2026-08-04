import fitz
from pathlib import Path
src = Path(r'C:/JC/Aung/Other/Dream/MagicLibrary/MyanmarGovSchoolTexbook/G1-Myanmarsa-TB.pdf')
out = Path(__file__).with_name('pdf_page1.png')
with fitz.open(src) as doc:
    page = doc[0]
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    pix.save(out)
print('saved', out.resolve())
