const fs = require('fs');
const JSZip = require('jszip');

async function testInjection() {
  const buffer = fs.readFileSync('C:/Users/65966/Downloads/comic/12-Oct/KhinKhinHtoo/ခမည်းကြိုး.epub');
  const zip = await JSZip.loadAsync(buffer);

  console.log('=== Files in EPUB ===');
  Object.keys(zip.files).forEach(name => {
    if (!zip.files[name].dir) console.log(name);
  });

  const part1 = zip.file('OEBPS/part0001.xhtml');
  if (part1) {
    const html = await part1.async('string');
    console.log('\n=== HTML Stats ===');
    console.log('Length:', html.length);
    console.log('First 500 chars:', html.substring(0, 500));

    // Test the injection logic
    console.log('\n=== Testing Injection ===');
    const PAGE_ANCHOR_PATTERN = /(?:^|[\s"'<])(?:id|name)\s*=\s*["']([^"']+)["']/gi;
    const PAGE_ANCHOR_MARKER = /^(?:p\d+|pgepubid[\w.-]*|page[-_]?\d+|pmp-p\d+)$/i;

    function collectPageAnchors(html) {
      const anchors = [];
      PAGE_ANCHOR_PATTERN.lastIndex = 0;
      let match;
      while ((match = PAGE_ANCHOR_PATTERN.exec(html))) {
        const id = match[1].trim();
        if (!id || !PAGE_ANCHOR_MARKER.test(id) || anchors.includes(id)) continue;
        anchors.push(id);
      }
      return anchors;
    }

    const existingAnchors = collectPageAnchors(html);
    console.log('Existing anchors:', existingAnchors.length);

    if (existingAnchors.length < 2) {
      console.log('Injecting anchors...');
      const minChars = 300;
      const targetChars = 600;
      const maxChars = 1200;
      const minParagraphs = 1;

      let result = "";
      let lastIndex = 0;
      let charCount = 0;
      let paragraphCount = 0;
      let pageNumber = 1;

      const bodyMatch = /<body[^>]*>/i.exec(html);
      if (bodyMatch) {
        const insertPos = bodyMatch.index + bodyMatch[0].length;
        result += html.slice(0, insertPos);
        result += `<a id="pmp-p${pageNumber}" name="pmp-p${pageNumber}"></a>`;
        lastIndex = insertPos;
        pageNumber += 1;
      } else {
        result += `<a id="pmp-p${pageNumber}" name="pmp-p${pageNumber}"></a>`;
        pageNumber += 1;
      }

      const tagPattern = /<(p|div|h[1-6]|section|article|blockquote|li|img|span)\b/gi;
      let match;

      while ((match = tagPattern.exec(html))) {
        if (match.index < lastIndex) continue;

        const tagName = match[1].toLowerCase();
        const textBefore = html.slice(lastIndex, match.index).replace(/<[^>]+>/g, "");
        charCount += textBefore.length;

        if (tagName === "p") {
          paragraphCount += 1;
        } else if (tagName === "img") {
          charCount += 3000;
          paragraphCount += 1;
        }

        const isHeading = /^h[1-6]$/.test(tagName);
        const isContentTag = tagName === "p" || tagName === "div" || tagName === "img";
        const shouldSplit =
          charCount >= maxChars ||
          (charCount >= minChars && isHeading) ||
          (charCount >= minChars && paragraphCount >= minParagraphs && isContentTag) ||
          (charCount >= targetChars && paragraphCount >= 1 && isContentTag);

        if (shouldSplit) {
          result += html.slice(lastIndex, match.index);
          result += `<a id="pmp-p${pageNumber}" name="pmp-p${pageNumber}"></a>`;
          lastIndex = match.index;
          charCount = 0;
          paragraphCount = 0;
          pageNumber += 1;
        }
      }

      // Fallback
      if (html.length - lastIndex > maxChars) {
        console.log('Using fallback splitting for remaining:', html.length - lastIndex, 'chars');
        const remaining = html.slice(lastIndex);
        let offset = 0;
        while (offset + targetChars < remaining.length) {
          result += remaining.slice(offset, offset + targetChars);
          result += `<a id="pmp-p${pageNumber}" name="pmp-p${pageNumber}"></a>`;
          offset += targetChars;
          pageNumber += 1;
        }
        result += remaining.slice(offset);
        lastIndex = html.length;
      }

      result += html.slice(lastIndex);

      const newAnchors = collectPageAnchors(result);
      console.log('After injection, anchors:', newAnchors.length);
      console.log('Result length:', result.length);
      console.log('Original length:', html.length);
      console.log('Page number reached:', pageNumber);
    }
  }
}

testInjection().catch(console.error);
