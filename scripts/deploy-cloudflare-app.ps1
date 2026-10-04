$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$dist = Join-Path $root "dist"
$cloudflareDist = Join-Path $root "cloudflare-dist"

if (-not (Test-Path -LiteralPath $dist)) {
    throw "Missing dist directory. Run the build before staging the Cloudflare deployment."
}

Remove-Item -LiteralPath $cloudflareDist -Recurse -Force -ErrorAction SilentlyContinue
robocopy $dist $cloudflareDist /E /XD (Join-Path $dist "book_html") | Out-Null
if ($LASTEXITCODE -gt 7) {
    exit $LASTEXITCODE
}

if (Test-Path -LiteralPath (Join-Path $cloudflareDist "book_html")) {
    throw "book_html was included in cloudflare-dist. Deployment stopped."
}

$indexedDbExport = Join-Path $cloudflareDist "data\indexeddb-export.json"
Remove-Item -LiteralPath $indexedDbExport -Force -ErrorAction SilentlyContinue
if (Test-Path -LiteralPath $indexedDbExport) {
    throw "indexeddb-export.json was included in cloudflare-dist. Deployment stopped."
}

Push-Location $root
try {
    pnpm dlx wrangler@latest pages deploy cloudflare-dist --project-name magiclibrary --branch main
} finally {
    Pop-Location
}
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
