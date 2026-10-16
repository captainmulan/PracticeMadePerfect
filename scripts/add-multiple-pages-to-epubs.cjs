#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const root = path.join(__dirname, "..");

const books = [
  { id: "khin-khin-htoo-16fae0f98b", epubPath: "book_html/Other/khin-khin-htoo-16fae0f98b/book.epub" },
  { id: "khin-khin-htoo-7e3baff1dc", epubPath: "book_html/Other/khin-khin-htoo-7e3baff1dc/book.epub" },
  { id: "khin-khin-htoo-7f4297305f", epubPath: "book_html/Other/khin-khin-htoo-7f4297305f/book.epub" },
  { id: "khin-khin-htoo-91da446dff", epubPath: "book_html/Other/khin-khin-htoo-91da446dff/book.epub" },
  { id: "khin-khin-htoo-9b37c2cf92", epubPath: "book_html/Other/khin-khin-htoo-9b37c2cf92/book.epub" },
  { id: "khin-khin-htoo-a18e0f5039", epubPath: "book_html/Other/khin-khin-htoo-a18e0f5039/book.epub" },
  { id: "khin-khin-htoo-bde6eaf37d", epubPath: "book_html/Other/khin-khin-htoo-bde6eaf37d/book.epub" },
  { id: "khin-khin-htoo-dae256f361", epubPath: "book_html/Other/khin-khin-htoo-dae256f361/book.epub" },
  { id: "khin-khin-htoo-e8a58f7721", epubPath: "book_html/Other/khin-khin-htoo-e8a58f7721/book.epub" },
  { id: "percy-jackson-mm-5b7d743d4f", epubPath: "book_html/Other/percy-jackson-mm-5b7d743d4f/book.epub" },
  { id: "percy-jackson-mm-91395c68e0", epubPath: "book_html/Other/percy-jackson-mm-91395c68e0/book.epub" },
  { id: "percy-jackson-mm-972d2163dc", epubPath: "book_html/Other/percy-jackson-mm-972d2163dc/book.epub" },
  { id: "percy-jackson-mm-ce6c21e4e5", epubPath: "book_html/Other/percy-jackson-mm-ce6c21e4e5/book.epub" },
  { id: "percy-jackson-mm-e3a342a38f", epubPath: "book_html/Other/percy-jackson-mm-e3a342a38f/book.epub" },
  { id: "percy-jackson-mm-fd1b30aa76", epubPath: "book_html/Other/percy-jackson-mm-fd1b30aa76/book.epub" },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value, pretty = false) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`, "utf8");
}

async function parseEpubPages(epubPath) {
  const fullEpubPath = path.join(root, epubPath);
  const buffer = fs.readFileSync(fullEpubPath);
  const zip = await JSZip.loadAsync(buffer);
  
  // Try to read OPF (Open Packaging Format) file
  const opfCandidates = Object.keys(zip.files).filter(name => 
    name.toLowerCase().endsWith('.opf')
  );
  
  if (opfCandidates.length === 0) {
    console.warn(`No OPF file found in ${epubPath}`);
    return [];
  }
  
  const opfPath = opfCandidates[0];
  const opfContent = await zip.file(opfPath).async("string");
  
  // Parse spine items from OPF
  const spineItems = [];
  const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i);
  if (spineMatch) {
    const itemMatches = opfContent.match(/<itemref[^>]*>/gi);
    if (itemMatches) {
      for (const match of itemMatches) {
        const idref = match.match(/idref=["']([^"']+)["']/i);
        const href = match.match(/href=["']([^"']+)["']/i);
        if (idref && href) {
          spineItems.push({ idref: idref[1], href: href[1] });
        }
      }
    }
  }
  
  // Try to read TOC (Navigation)
  const tocEntries = [];
  const navCandidates = Object.keys(zip.files).filter(name =>
    name.toLowerCase().includes('nav') || name.toLowerCase().includes('toc')
  );
  
  for (const navPath of navCandidates) {
    try {
      const navContent = await zip.file(navPath).async("string");
      const linkMatches = navContent.match(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi);
      if (linkMatches && linkMatches.length > 0) {
        for (const match of linkMatches) {
          const href = match.match(/href=["']([^"']+)["']/i);
          const text = match.match(/>([\s\S]*?)<\/a>/i);
          if (href && text) {
            tocEntries.push({ href: href[1], label: text[1].replace(/<[^>]+>/g, '').trim() });
          }
        }
        if (tocEntries.length > 0) break;
      }
    } catch (err) {
      // Continue to next candidate
    }
  }
  
  // If TOC found, use it; otherwise use spine
  const pageList = tocEntries.length > 0 ? tocEntries : spineItems.map((item, i) => ({
    href: item.href,
    label: `Page ${i + 1}`
  }));
  
  console.log(`  Found ${pageList.length} pages in EPUB`);
  return pageList;
}

async function main() {
  const exportPath = "public/data/indexeddb-export.json";
  const exportData = readJson(exportPath);
  
  for (const book of books) {
    console.log(`Processing ${book.id}...`);
    
    try {
      const pages = await parseEpubPages(book.epubPath);
      
      if (pages.length === 0) {
        console.warn(`  No pages found, keeping 1 default chapter`);
        continue;
      }
      
      const course = exportData.courses.find(c => c.id === book.id);
      if (!course) continue;
      
      // Build chapters from pages
      const chapters = [];
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const chapterId = `${book.id}-epub-page-${String(i + 1).padStart(3, "0")}`;
        const stepId = `${chapterId}-step`;
        
        chapters.push({
          id: chapterId,
          courseId: book.id,
          chapterIndex: i,
          title: page.label || `Page ${i + 1}`,
          steps: [{
            id: stepId,
            courseId: book.id,
            chapterId,
            chapterTitle: page.label || `Page ${i + 1}`,
            chapterIndex: i,
            stepIndex: i + 1,
            stepType: "epub",
            title: page.label || `Page ${i + 1}`,
            description: "",
            contentHtml: `/book_html/Other/${book.id}/book.epub#${page.href}`,
          }]
        });
      }
      
      course.chapters = chapters;
      course.stepCount = chapters.length;
      console.log(`  Updated with ${chapters.length} chapters`);
    } catch (err) {
      console.error(`  Failed to parse ${book.id}:`, err.message);
    }
  }
  
  // Save export
  exportData.exportedAt = new Date().toISOString();
  writeJson(exportPath, exportData, true);
  
  // Update deploy
  const deployPath = "deploy/indexeddb-export.json";
  const deployData = readJson(deployPath);
  for (const book of books) {
    const course = deployData.courses.find(c => c.id === book.id);
    const updated = exportData.courses.find(c => c.id === book.id);
    if (course && updated) {
      course.chapters = updated.chapters;
      course.stepCount = updated.stepCount;
    }
  }
  deployData.exportedAt = exportData.exportedAt;
  writeJson(deployPath, deployData, true);
  
  // Update home catalog
  const homePath = "public/data/home-catalog.json";
  const homeCatalog = readJson(homePath);
  for (const book of books) {
    const course = homeCatalog.courses.find(c => c.id === book.id);
    const updated = exportData.courses.find(c => c.id === book.id);
    if (course && updated) {
      course.stepCount = updated.stepCount;
    }
  }
  homeCatalog.exportedAt = exportData.exportedAt;
  writeJson(homePath, homeCatalog, true);
  
  // Update course details
  for (const book of books) {
    const course = exportData.courses.find(c => c.id === book.id);
    if (course) {
      writeJson(`public/data/course-details/${encodeURIComponent(book.id)}.json`, course);
    }
  }
  
  // Update catalog version
  writeJson("public/data/catalog-version.json", {
    exportedAt: `${exportData.exportedAt}:multi-page-fix`,
    courseCount: exportData.courses.length,
  });
  
  console.log("\nAdded multiple pages to all books");
  console.log("Next: Clear IndexedDB in browser to see changes");
}

main();
