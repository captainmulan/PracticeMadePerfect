#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { execFileSync } = require("child_process");

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

function extractCoverFromEpub(epubPath) {
  const fullEpubPath = path.join(root, epubPath);
  const escapedPath = path.resolve(fullEpubPath).replace(/'/g, "''");
  
  const powershell = `
    $ErrorActionPreference = 'Stop'
    $OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead('${escapedPath}')
    try {
      $coverNames = @('cover.jpg', 'cover.png', 'cover.jpeg', 'cover.webp', 'OPS/images/cover.jpg', 'OPS/images/cover.png', 'OPS/images/cover.jpeg', 'Images/cover.jpg', 'Images/cover.png')
      $coverEntry = $null
      foreach ($name in $coverNames) {
        $entry = $archive.Entries | Where-Object { $_.FullName -eq $name -or $_.FullName -like "*/$name" }
        if ($entry) { $coverEntry = $entry; break }
      }
      if (-not $coverEntry) {
        # Try to find any image
        $imageEntry = $archive.Entries | Where-Object { $_.FullName -match '\\.(jpg|jpeg|png|webp)$' } | Select-Object -First 1
        if ($imageEntry) { $coverEntry = $imageEntry }
      }
      if ($coverEntry) {
        $reader = [System.IO.StreamReader]::new($coverEntry.Open())
        try { 
          $bytes = [System.IO.Byte[]]::new($coverEntry.Length)
          $reader.BaseStream.Read($bytes, 0, $coverEntry.Length) | Out-Null
          [Convert]::ToBase64String($bytes)
        } finally { $reader.Dispose() }
      }
    } finally {
      $archive.Dispose()
    }
  `;
  
  try {
    const encoded = Buffer.from(powershell, "utf16le").toString("base64");
    const output = execFileSync("powershell.exe", ["-NoProfile", "-EncodedCommand", encoded], { encoding: "utf8" }).trim();
    const cleanOutput = output.replace(/^<Objs[^>]*>.*<\/Objs>/s, '').trim();
    return cleanOutput || null;
  } catch (err) {
    console.warn(`Failed to extract cover from ${epubPath}:`, err.message);
    return null;
  }
}

const coversDir = path.join(root, "public", "book_covers");
fs.mkdirSync(coversDir, { recursive: true });

async function extractCovers() {
  for (const book of books) {
    const coverBase64 = extractCoverFromEpub(book.epubPath);
    
    if (coverBase64) {
      const coverBuffer = Buffer.from(coverBase64, "base64");
      const coverPath = path.join(coversDir, `${book.id}.jpeg`);
      
      try {
        await sharp(coverBuffer)
          .resize(360, 540, { fit: "inside" })
          .jpeg({ quality: 85 })
          .toFile(coverPath);
        console.log(`Extracted cover for ${book.id}`);
      } catch (err) {
        console.warn(`Failed to process cover for ${book.id}:`, err.message);
      }
    } else {
      console.warn(`No cover found for ${book.id}`);
    }
  }
}

extractCovers().then(() => {
  console.log("\nCover extraction complete");
});
