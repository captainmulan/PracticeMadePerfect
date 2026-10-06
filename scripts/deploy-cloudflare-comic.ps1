$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "book_html\Comic"
$projectName = "magiclibrary-comic"
$maxFileBytes = 25MB
$maxFiles = 20000
$headersPath = Join-Path $assets "_headers"

if (-not (Test-Path -LiteralPath $assets -PathType Container)) {
    throw "Missing Comic book directory: $assets"
}
if (Test-Path -LiteralPath $headersPath) {
    throw "Refusing to overwrite existing Cloudflare headers file: $headersPath"
}

$files = @(Get-ChildItem -LiteralPath $assets -Recurse -File)
if ($files.Count -gt $maxFiles) {
    throw "Found $($files.Count) files; Cloudflare Pages allows at most $maxFiles files per project."
}
$oversizedFiles = @($files | Where-Object { $_.Length -ge $maxFileBytes })
if ($oversizedFiles.Count -gt 0) {
    $names = ($oversizedFiles | ForEach-Object { "$($_.FullName) ($($_.Length) bytes)" }) -join [Environment]::NewLine
    throw "Cloudflare Pages assets must be below 25 MiB:`n$names"
}

$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$identity = pnpm dlx wrangler@latest whoami 2>&1
$identityExitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference
$identityText = $identity -join [Environment]::NewLine
Write-Host $identityText
if ($identityExitCode -ne 0 -or $identityText -match "(?i)not authenticated") {
    throw "Wrangler is not authenticated. Run 'pnpm dlx wrangler@latest login' with the new Cloudflare account first."
}

$confirmation = Read-Host "Deploy only book_html/Comic to Pages project '$projectName' under this account? (y/N)"
if ($confirmation -notmatch "^(?i)y(es)?$") {
    throw "Deployment cancelled."
}

$headers = @"
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Range
  Access-Control-Expose-Headers: Accept-Ranges, Content-Length, Content-Range, ETag
  Access-Control-Max-Age: 86400
  Cache-Control: public, max-age=86400, must-revalidate
"@

try {
    [System.IO.File]::WriteAllText($headersPath, $headers, [System.Text.Encoding]::ASCII)
    Write-Host "Deploying $($files.Count) files from book_html/Comic to '$projectName'."
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    pnpm dlx wrangler@latest pages deploy $assets --project-name $projectName --branch main
    $deployExitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorActionPreference
    if ($deployExitCode -ne 0) {
        throw "Cloudflare Pages deployment failed with exit code $deployExitCode."
    }
} finally {
    Remove-Item -LiteralPath $headersPath -Force -ErrorAction SilentlyContinue
}