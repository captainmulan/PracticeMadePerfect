$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "book_html\Other\vibe-book-final\cloudflare-pages"
$projectName = "pmp-book-assets"
$maxFileBytes = 25MB

if (-not (Test-Path -LiteralPath $assets -PathType Container)) {
    throw "Missing book asset directory: $assets"
}
if (-not (Test-Path -LiteralPath (Join-Path $assets "_headers") -PathType Leaf)) {
    throw "Missing _headers CORS/cache policy in $assets"
}

$epubs = @(Get-ChildItem -LiteralPath $assets -Filter "*.epub" -File)
if ($epubs.Count -lt 2 -or $epubs.Count -gt 3) {
    throw "Expected 2 or 3 split EPUB files, found $($epubs.Count)."
}
foreach ($epub in $epubs) {
    if ($epub.Length -ge $maxFileBytes) {
        throw "$($epub.Name) is $($epub.Length) bytes; Pages assets must be below 25 MiB."
    }
}

Write-Host "Deploying $($epubs.Count) EPUB parts to Cloudflare Pages project '$projectName'."
Write-Host "Confirm Wrangler is logged into the separate book-assets Cloudflare account."
pnpm dlx wrangler@latest pages deploy $assets --project-name $projectName --branch main
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}