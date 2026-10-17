#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const dir = "C:\\Users\\65966\\Downloads\\comic\\12-Oct\\ပါစီဂျက်ဆန်";
const files = fs.readdirSync(dir);
const epubFile = files.find(f => f.includes("ကျိန်စာသင့်ဓား") && f.endsWith(".epub"));

if (!epubFile) {
  console.error("EPUB file not found");
  console.log("Files in directory:", files);
  process.exit(1);
}

const epubPath = path.join(dir, epubFile);
console.log("Inspecting TOC in EPUB:", epubPath);

const safePath = epubPath.replace(/'/g, "''");
const powershell = `
$ErrorActionPreference = 'Stop'
$OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead('${safePath}')
try {
  Write-Host "=== TOC.ncx content ==="
  $toc = $archive.GetEntry("OEBPS/toc.ncx")
  if ($toc) {
    $stream = $toc.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $tocContent = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    Write-Host $tocContent
  } else {
    Write-Host "No TOC.ncx found"
  }

  Write-Host ""
  Write-Host "=== Content of part0001.xhtml (first 2000 chars) ==="
  $content = $archive.GetEntry("OEBPS/part0001.xhtml")
  if ($content) {
    $stream = $content.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $html = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    Write-Host ($html.Substring(0, [Math]::Min(2000, $html.Length)))
  }
} finally {
  $archive.Dispose()
}
`;

try {
  const encoded = Buffer.from(powershell, "utf16le").toString("base64");
  const output = require("child_process").execFileSync("powershell.exe", ["-NoProfile", "-EncodedCommand", encoded], { encoding: "utf8" });
  console.log(output);
} catch (err) {
  console.error("Error:", err.message);
}
