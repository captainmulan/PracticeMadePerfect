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
console.log("Inspecting EPUB:", epubPath);

if (!fs.existsSync(epubPath)) {
  console.error("EPUB file not found");
  process.exit(1);
}

// Use PowerShell to inspect the EPUB structure
const safePath = epubPath.replace(/'/g, "''");
const powershell = `
$ErrorActionPreference = 'Stop'
$OutputEncoding = [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead('${safePath}')
try {
  Write-Host "=== Files in EPUB ==="
  $files = @()
  foreach ($entry in $archive.Entries) {
    if (-not $entry.FullName.EndsWith('/')) {
      $files += $entry.FullName
    }
  }
  $files | Sort-Object | ForEach-Object { Write-Host $_ }

  Write-Host ""
  Write-Host "=== Looking for OPF file ==="
  $container = $archive.GetEntry("META-INF/container.xml")
  if ($container) {
    $stream = $container.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $containerXml = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    Write-Host $containerXml
  }

  Write-Host ""
  Write-Host "=== Looking for .opf files ==="
  foreach ($entry in $archive.Entries) {
    if ($entry.FullName -match '\\.opf$') {
      Write-Host "Found OPF:" $entry.FullName
      $stream = $entry.Open()
      $reader = New-Object System.IO.StreamReader($stream)
      $opf = $reader.ReadToEnd()
      $reader.Close()
      $stream.Close()
      Write-Host $opf
    }
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
