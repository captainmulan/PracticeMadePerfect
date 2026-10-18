import { buildEpubImportPreview } from './src/utils/epubImport.ts';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

async function test() {
  const fileBuffer = fs.readFileSync('C:/Users/65966/Downloads/comic/12-Oct/KhinKhinHtoo/ခမည်းကြိုး.epub');
  const file = new File([fileBuffer], 'ခမည်းကြိုး.epub', { type: 'application/epub+zip' });

  console.log('Starting EPUB import test...');
  const preview = await buildEpubImportPreview(file, 0, [], {
    preferredFolder: 'test',
  });

  console.log('Preview result:');
  console.log('Chapters:', preview.chapterCount);
  console.log('Pages:', preview.pageCount);
  console.log('Chapter details:', preview.chapters?.map(c => ({
    title: c.title,
    pages: c.pages.length
  })));
}

test().catch(console.error);
