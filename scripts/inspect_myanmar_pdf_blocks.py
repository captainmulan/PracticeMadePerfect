import fitz
from pathlib import Path
src = Path(r'C:/JC/Aung/Other/Dream/MagicLibrary/MyanmarGovSchoolTexbook/G1-Myanmarsa-TB.pdf')
doc = fitz.open(src)
print('pages', len(doc))
for i in range(1,5):
    page = doc[i-1]
    text = page.get_text('text')
    d = page.get_text('dict')
    print('PAGE', i)
    print(' text len', len(text))
    print(' block count', len(d['blocks']))
    image_count = sum(1 for b in d['blocks'] if b['type'] == 1)
    text_block_count = sum(1 for b in d['blocks'] if b['type'] == 0)
    print(' image blocks', image_count, 'text blocks', text_block_count)
    for bi, b in enumerate(d['blocks'][:5], 1):
        print(' block', bi, 'type', b['type'], 'lines', len(b.get('lines', [])))
        if b['type'] == 0 and b.get('lines'):
            for li, line in enumerate(b['lines'][:2], 1):
                print('   line', li, 'span count', len(line['spans']))
                for sp in line['spans'][:2]:
                    print('      span', repr(sp['text']))
        if b['type'] == 1:
            print('   image rect', b['bbox'])
    images = page.get_images(full=True)
    print(' page image count', len(images))
    if images:
        for j, img in enumerate(images[:3], 1):
            print('   image', j, img[:5], '...')
    print('-'*60)
