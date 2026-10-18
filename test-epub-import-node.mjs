// Direct test of the EPUB import logic without browser
import { loadEpubJsLib, loadJsZip, loadEpubZip, readOpfInfo, collectSpineFromZip, collectTocFromZip, flattenToc, dedupeTocEntries, buildChapterPlans, injectPageAnchors, collectPageAnchors, expandChapterAnchors } from './src/utils/epubImport.ts';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');

async function testEpubImport() {
  console.log('=== Starting EPUB Import Test ===\n');

  const buffer = fs.readFileSync('C:/Users/65966/Downloads/comic/12-Oct/KhinKhinHtoo/ခမည်းကြိုး.epub');
  console.log('EPUB file size:', buffer.length, 'bytes');

  const zip = await loadEpubZip(buffer);
  if (!zip) {
    console.log('Failed to load EPUB as ZIP');
    return;
  }
  console.log('ZIP loaded successfully');

  const opfInfo = await readOpfInfo(zip);
  console.log('OPF info:', opfInfo ? 'Found' : 'Not found');
  if (opfInfo) {
    console.log('  OPF path:', opfInfo.opfPath);
    console.log('  OPF dir:', opfInfo.opfDir);
    console.log('  Spine hrefs:', opfInfo.spineHrefs.length);
  }

  const spineItems = await collectSpineFromZip(zip);
  console.log('Spine items:', spineItems.length);
  spineItems.forEach((item, i) => console.log(`  ${i + 1}. ${item.href}`));

  const tocFlat = await collectTocFromZip(zip);
  console.log('TOC entries:', tocFlat.length);
  tocFlat.forEach((entry, i) => console.log(`  ${i + 1}. ${entry.label} -> ${entry.href}`));

  const tocFlatDedupe = dedupeTocEntries(tocFlat);
  console.log('TOC after dedupe:', tocFlatDedupe.length);

  const spinePages = spineItems
    .filter((item) => !item.href?.includes('cover'))
    .map((item, index) => ({
      title: item.label || item.title || `Page ${index + 1}`,
      href: item.href || '',
    }));

  console.log('Spine pages (non-cover):', spinePages.length);

  const chapterPlans = await buildChapterPlans({
    tocTree: [],
    tocFlat: tocFlatDedupe,
    zip,
    opfDir: opfInfo?.opfDir || '',
    spinePages,
    bookTitle: 'Test Book',
  });

  console.log('\n=== Chapter Plans ===');
  console.log('Total chapters:', chapterPlans.length);
  chapterPlans.forEach((plan, i) => {
    console.log(`Chapter ${i + 1}: ${plan.title}`);
    console.log(`  Pages: ${plan.pages.length}`);
    plan.pages.slice(0, 5).forEach((page, j) => {
      console.log(`    ${j + 1}. ${page.title} (${page.href})`);
    });
    if (plan.pages.length > 5) {
      console.log(`    ... and ${plan.pages.length - 5} more`);
    }
  });

  console.log('\n=== Test Complete ===');
}

testEpubImport().catch(console.error);
