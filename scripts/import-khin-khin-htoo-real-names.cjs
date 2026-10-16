#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");

// Map existing IDs to real book names
const bookMappings = [
  // Khin Khin Htoo books
  { id: "khin-khin-htoo-16fae0f98b", sourceDir: "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\KhinKhinHtoo", epubFile: "ကြာဆစ်ကြိုး.epub", title: "ကြာဆစ်ကြိုး", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-7e3baff1dc", sourceDir: "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\KhinKhinHtoo", epubFile: "ခမည်းကြိုး.epub", title: "ခမည်းကြိုး", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-7f4297305f", sourceDir: "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\KhinKhinHtoo", epubFile: "ဆူးပန်းခွေ.epub", title: "ဆူးပန်းခွေ", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-91da446dff", sourceDir: "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\KhinKhinHtoo", epubFile: "တောမင်းသမီး.epub", title: "တောမင်းသမီး", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-9b37c2cf92", sourceDir: "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\KhinKhinHtoo", epubFile: "ပန်းကြာဝတ်မှုန်.epub", title: "ပန်းကြာဝတ်မှုန်", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-a18e0f5039", sourceDir: "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\KhinKhinHtoo", epubFile: "မင်္ဂလာလှည်း.epub", title: "မင်္ဂလာလှည်း", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-bde6eaf37d", sourceDir: "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\KhinKhinHtoo", epubFile: "မအိမ်ကံ.epub", title: "မအိမ်ကံ", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-dae256f361", sourceDir: "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\KhinKhinHtoo", epubFile: "အညာသူအညာသား ကျွန်မဆွေမျိုးများ.epub", title: "အညာသူအညာသား ကျွန်မဆွေမျိုးများ", author: "Khin Khin Htoo" },
  { id: "khin-khin-htoo-e8a58f7721", sourceDir: "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\KhinKhinHtoo", epubFile: "အဝေးကမှန်းဟိုရွာလမ်း ထီးတန်းကြီးလှပါဘိ.epub", title: "အဝေးကမှန်းဟိုရွာလမ်း ထီးတန်းကြီးလှပါဘိ", author: "Khin Khin Htoo" },
  // Percy Jackson books - use existing EPUBs in book_html
  { id: "percy-jackson-mm-5b7d743d4f", sourceDir: null, epubFile: null, title: "ပါစီဂျက်ဆန် နှင့် အိုလံပစ် နတ်ဘုရားများ - ကမ္ဘာဦးကျိန်စာ", author: "Rick Riordan" },
  { id: "percy-jackson-mm-91395c68e0", sourceDir: null, epubFile: null, title: "ပါစီဂျက်ဆန် နှင့် အိုလံပစ် နတ်ဘုရားများ - ဒမ်မီဂေါ့မှတ်စုများ", author: "Rick Riordan" },
  { id: "percy-jackson-mm-972d2163dc", sourceDir: null, epubFile: null, title: "ပါစီဂျက်ဆန်နှင့် အိုလံပစ် နတ်ဘုရားများ မိစ္ဆာပင်လယ်", author: "Rick Riordan" },
  { id: "percy-jackson-mm-ce6c21e4e5", sourceDir: null, epubFile: null, title: "ပါစီဂျက်ဆန်နှင့် အိုလံပစ် နတ်ဘုရားများ မိုးကြိုးခိုးသူ", author: "Rick Riordan" },
  { id: "percy-jackson-mm-e3a342a38f", sourceDir: null, epubFile: null, title: "ပါစီဂျက်ဆန်နှင့် အိုလံပစ်နတ်ဘုရားများ - ကျိန်စာသင့်ဓား", author: "Rick Riordan" },
  { id: "percy-jackson-mm-fd1b30aa76", sourceDir: null, epubFile: null, title: "ပါစီဂျက်ဆန်နှင့် အိုလံပစ်နတ်ဘုရားများ - မှော်ဝင်္ကပါတိုက်ပွဲ", author: "Rick Riordan" },
];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function writeJson(relativePath, value, pretty = false) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(value, null, pretty ? 2 : 0)}\n`, "utf8");
}

function parseEpubStructure(epubPath) {
  const escapedPath = path.resolve(epubPath).replace(/'/g, "''");
  const powershell = `
    $ErrorActionPreference = 'Stop'
    $OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead('${escapedPath}')
    try {
      $toc = @()
      $tocEntry = $archive.GetEntry('toc.ncx')
      if ($tocEntry) {
        $reader = [System.IO.StreamReader]::new($tocEntry.Open())
        try { [xml]$xml = $reader.ReadToEnd() } finally { $reader.Dispose() }
        foreach ($node in $xml.SelectNodes('//*[local-name()="navMap"]/*[local-name()="navPoint"]')) {
          $label = $node.SelectSingleNode('./*[local-name()="navLabel"]/*[local-name()="text"]')
          $content = $node.SelectSingleNode('./*[local-name()="content"]')
          if ($label -and $content) {
            $toc += @{ title = ($label.InnerText -replace '\\s+', ' ').Trim(); href = $content.GetAttribute('src') }
          }
        }
      }
      $pages = @()
      foreach ($entry in $archive.Entries) {
        if ($entry.FullName -match '\\.(xhtml|html)$') {
          $pages += $entry.FullName
        }
      }
      $pages = $pages | Sort-Object
      @{ toc = $toc; pages = $pages }
    } finally {
      $archive.Dispose()
    }
  `;
  try {
    const encoded = Buffer.from(powershell, "utf16le").toString("base64");
    const output = execFileSync("powershell.exe", ["-NoProfile", "-EncodedCommand", encoded], { encoding: "utf8" }).trim();
    // Remove CLIXML if present
    const cleanOutput = output.replace(/^<Objs[^>]*>.*<\/Objs>/s, '').trim();
    return JSON.parse(cleanOutput);
  } catch (err) {
    console.warn(`Failed to parse ${epubPath}:`, err.message);
    return { toc: [], pages: [] };
  }
}

// Load export
const exportPath = "public/data/indexeddb-export.json";
const exportData = readJson(exportPath);

for (const mapping of bookMappings) {
  console.log(`Processing ${mapping.id}: ${mapping.title}`);
  
  let sourceEpub = null;
  let destEpub = path.join(root, "book_html", "Other", mapping.id, "book.epub");
  
  // Handle books with source directory (Khin Khin Htoo)
  if (mapping.sourceDir && mapping.epubFile) {
    sourceEpub = path.join(mapping.sourceDir, mapping.epubFile);
    if (!fs.existsSync(sourceEpub)) {
      console.warn(`Source EPUB not found: ${sourceEpub}`);
      continue;
    }
    fs.mkdirSync(path.dirname(destEpub), { recursive: true });
    fs.copyFileSync(sourceEpub, destEpub);
  }
  // Handle books without source (Percy Jackson - use existing)
  else if (!fs.existsSync(destEpub)) {
    console.warn(`Existing EPUB not found: ${destEpub}`);
    continue;
  }
  
  // Parse EPUB structure (if source exists, otherwise use existing)
  const epubToParse = sourceEpub || destEpub;
  const epubStructure = parseEpubStructure(epubToParse);
  const toc = epubStructure.toc || [];
  const pages = epubStructure.pages || [];
  
  console.log(`  Found ${toc.length} TOC entries, ${pages.length} pages`);
  
  // Build chapters from TOC
  const chapters = [];
  for (let i = 0; i < toc.length; i++) {
    const tocEntry = toc[i];
    const chapterId = `${mapping.id}-epub-page-${String(i + 1).padStart(3, "0")}`;
    const stepId = `${chapterId}-step`;
    
    chapters.push({
      id: chapterId,
      courseId: mapping.id,
      chapterIndex: i,
      title: tocEntry.title || `Page ${i + 1}`,
      steps: [{
        id: stepId,
        courseId: mapping.id,
        chapterId,
        chapterTitle: tocEntry.title || `Page ${i + 1}`,
        chapterIndex: i,
        stepIndex: i + 1,
        stepType: "epub",
        title: tocEntry.title || `Page ${i + 1}`,
        description: "",
        contentHtml: `/book_html/Other/${mapping.id}/book.epub#${tocEntry.href}`,
      }]
    });
  }
  
  // Update course
  const course = exportData.courses.find(c => c.id === mapping.id);
  if (course) {
    course.title = mapping.title;
    course.description = `${mapping.title} by ${mapping.author}`;
    course.authorName = mapping.author;
    course.stepCount = chapters.length;
    course.chapters = chapters;
    console.log(`  Updated with ${chapters.length} chapters`);
  }
}

// Save export
exportData.exportedAt = new Date().toISOString();
writeJson(exportPath, exportData, true);

// Update deploy
const deployPath = "deploy/indexeddb-export.json";
const deployData = readJson(deployPath);
for (const mapping of bookMappings) {
  const course = deployData.courses.find(c => c.id === mapping.id);
  const updated = exportData.courses.find(c => c.id === mapping.id);
  if (course && updated) {
    course.title = updated.title;
    course.description = updated.description;
    course.stepCount = updated.stepCount;
    course.chapters = updated.chapters;
  }
}
deployData.exportedAt = exportData.exportedAt;
writeJson(deployPath, deployData, true);

// Update home catalog
const homePath = "public/data/home-catalog.json";
const homeCatalog = readJson(homePath);
for (const mapping of bookMappings) {
  const course = homeCatalog.courses.find(c => c.id === mapping.id);
  const updated = exportData.courses.find(c => c.id === mapping.id);
  if (course && updated) {
    course.title = updated.title;
    course.description = updated.description;
    course.stepCount = updated.stepCount;
  }
}
homeCatalog.exportedAt = exportData.exportedAt;
writeJson(homePath, homeCatalog, true);

// Update course details
for (const mapping of bookMappings) {
  const course = exportData.courses.find(c => c.id === mapping.id);
  if (course) {
    writeJson(`public/data/course-details/${encodeURIComponent(mapping.id)}.json`, course);
  }
}

// Update catalog version
writeJson("public/data/catalog-version.json", {
  exportedAt: `${exportData.exportedAt}:real-names-structure`,
  courseCount: exportData.courses.length,
});

console.log("\nUpdated all Khin Khin Htoo books with real names and proper structure");
console.log("Next: Clear IndexedDB in browser to see changes");
