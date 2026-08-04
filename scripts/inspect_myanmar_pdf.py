import fitz
from pathlib import Path
import re
src = Path(r'C:/JC/Aung/Other/Dream/MagicLibrary/MyanmarGovSchoolTexbook/G1-Myanmarsa-TB.pdf')
doc = fitz.open(src)
print('pages', len(doc))
for i in range(min(6, len(doc))):
    page = doc[i]
    text = page.get_text('text')
    print('\n=== PAGE', i+1, '===')
    print('text length', len(text))
    print('sample text:')
    print(repr(text[:1200]))
    print('\n--- end sample ---\n')
