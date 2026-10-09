param(
  [string]$SourceDirectory = 'C:\Users\65966\Downloads\comic\08-Oct',
  [string[]]$RepairIds = @(),
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
$exportPath = Join-Path $root 'public\data\indexeddb-export.json'
$homePath = Join-Path $root 'public\data\home-catalog.json'
$versionPath = Join-Path $root 'public\data\catalog-version.json'
$bookHtmlRoot = Join-Path $root 'book_html'
$coversRoot = Join-Path $root 'public\book_covers'
$stamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$exportedAt = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

function Read-ZipText($archive, [string]$entryName) {
  $entry = $archive.GetEntry($entryName)
  if (!$entry) { return $null }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Get-EpubToc($archive) {
  $entries = @($archive.Entries | Where-Object {
    $_.FullName -match '(?i)(?:^|/)(?:toc|nav)\.xhtml$|\.ncx$'
  })
  $seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
  $toc = [System.Collections.Generic.List[object]]::new()
  foreach ($entry in $entries) {
    $xml = $null
    try { $xml = [xml](Read-ZipText $archive $entry.FullName) } catch { continue }
    if ($entry.FullName.EndsWith('.ncx', [System.StringComparison]::OrdinalIgnoreCase)) {
      foreach ($point in $xml.SelectNodes("//*[local-name()='navPoint']")) {
        $label = $point.SelectSingleNode("./*[local-name()='navLabel']/*[local-name()='text']")
        $content = $point.SelectSingleNode("./*[local-name()='content']")
        if (!$label -or !$content) { continue }
        $href = $content.GetAttribute('src').Trim().Replace('\', '/') -replace '^\./', ''
        $text = ($label.InnerText -replace '\s+', ' ').Trim()
        if ($href -and $text -and $seen.Add($href)) { $toc.Add([pscustomobject]@{ Label = $text; Href = $href }) }
      }
    } else {
      foreach ($anchor in $xml.SelectNodes("//*[local-name()='a']")) {
        $href = $anchor.GetAttribute('href').Trim().Replace('\', '/') -replace '^\./', ''
        $text = ($anchor.InnerText -replace '\s+', ' ').Trim()
        if (!$href -or !$text -or ($href.StartsWith('#') -and $href -notmatch '\.(?:xhtml?|html)')) { continue }
        if ($seen.Add($href)) { $toc.Add([pscustomobject]@{ Label = $text; Href = $href }) }
      }
    }
  }
  return $toc.ToArray()
}

function Get-EpubImagePages($archive, [string]$opfDirectory, $spine, $toc) {
  $pages = [System.Collections.Generic.List[object]]::new()
  $labelsByHref = @{}
  foreach ($item in $toc) { $labelsByHref[[string]$item.Href] = [string]$item.Label }
  $imageIndexes = @{}
  foreach ($item in $spine) {
    $href = ([string]$item.Href -replace '#.*$', '')
    $entryPath = if ($opfDirectory) { "$opfDirectory/$href" } else { $href }
    $entry = $archive.GetEntry([Uri]::UnescapeDataString($entryPath))
    if (!$entry) { continue }
    $document = $null
    try { $document = [xml](Read-ZipText $archive $entry.FullName) } catch { continue }
    foreach ($image in $document.SelectNodes("//*[local-name()='img']")) {
      $anchor = $image.SelectSingleNode("preceding::*[local-name()='a'][@id or @name][1]")
      $anchorId = if ($anchor) { $anchor.GetAttribute('id') } else { '' }
      if (!$anchorId -and $anchor) { $anchorId = $anchor.GetAttribute('name') }
      $pageHref = if ($anchorId) { "$href#$anchorId" } else { $href }
      $imageIndex = if ($imageIndexes.ContainsKey($pageHref)) { [int]$imageIndexes[$pageHref] } else { 0 }
      $imageIndexes[$pageHref] = $imageIndex + 1
      $label = $labelsByHref[$pageHref]
      if (!$label) { $label = $image.GetAttribute('alt') }
      if (!$label) { $label = "Page $($pages.Count + 1)" }
      $pages.Add([pscustomobject]@{ Label = $label; Href = $pageHref; ImageIndex = $imageIndex })
    }
  }
  return $pages.ToArray()
}

function Get-BookMetadata([System.IO.FileInfo]$file) {
  $archive = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
  try {
    $container = [xml](Read-ZipText $archive 'META-INF/container.xml')
    $opfPath = $container.SelectSingleNode("//*[local-name()='rootfile']").GetAttribute('full-path')
    if (!$opfPath) { throw "No package document in $($file.Name)" }
    $opf = [xml](Read-ZipText $archive $opfPath)
    $metadata = $opf.SelectSingleNode("//*[local-name()='metadata']")
    $titleNode = $metadata.SelectSingleNode("./*[local-name()='title']")
    $title = if ($titleNode) { ($titleNode.InnerText -replace '\s+', ' ').Trim() } else { '' }
    $authorNode = $metadata.SelectSingleNode("./*[local-name()='creator']")
    $author = if ($authorNode) { ($authorNode.InnerText -replace '\s+', ' ').Trim() } else { '' }
    $manifest = @{}
    foreach ($item in $opf.SelectNodes("//*[local-name()='manifest']/*[local-name()='item']")) { $manifest[$item.GetAttribute('id')] = $item }
    $spine = [System.Collections.Generic.List[object]]::new()
    foreach ($reference in $opf.SelectNodes("//*[local-name()='spine']/*[local-name()='itemref']")) {
      if ($reference.GetAttribute('linear') -eq 'no') { continue }
      $item = $manifest[$reference.GetAttribute('idref')]
      if ($item -and $item.GetAttribute('href')) { $spine.Add([pscustomobject]@{ Href = $item.GetAttribute('href').Replace('\', '/'); Label = '' }) }
    }
    $readableSpine = @($spine | Where-Object { $_.Href -notmatch '(?i)(?:^|/)cover\.(?:xhtml?|html?)$' })
    $toc = @(Get-EpubToc $archive)
    $opfDirectory = [System.IO.Path]::GetDirectoryName($opfPath).Replace('\', '/')
    $imagePages = @(Get-EpubImagePages $archive $opfDirectory $readableSpine $toc)
    $useToc = $toc.Count -ge 2 -and (($toc | Where-Object { $_.Href.Contains('#') }).Count -gt 0 -or $toc.Count -lt $spine.Count)
    $pages = [System.Collections.Generic.List[object]]::new()
    if ($imagePages.Count -gt $toc.Count) {
      foreach ($item in $imagePages) { $pages.Add($item) }
    } elseif ($useToc) {
      foreach ($item in $toc) { $pages.Add($item) }
    } else {
      for ($index = 0; $index -lt $readableSpine.Count; $index++) { $pages.Add([pscustomobject]@{ Label = "Chapter $($index + 1)"; Href = $readableSpine[$index].Href }) }
    }
    if ($pages.Count -eq 0) { $pages.Add([pscustomobject]@{ Label = 'Page 1'; Href = '' }) }
    $coverItem = $null
    $coverMeta = $metadata.SelectSingleNode("./*[local-name()='meta'][@name='cover']")
    if ($coverMeta) { $coverItem = $manifest[$coverMeta.GetAttribute('content')] }
    if (!$coverItem) { $coverItem = $manifest.Values | Where-Object { $_.GetAttribute('properties') -match '\bcover-image\b' } | Select-Object -First 1 }
    $coverHref = ''
    if ($coverItem) { $coverHref = if ($opfDirectory) { "$opfDirectory/$($coverItem.GetAttribute('href'))" } else { $coverItem.GetAttribute('href') } }
    return [pscustomobject]@{ Title = $title; Author = $author; Pages = $pages.ToArray(); CoverHref = $coverHref }
  } finally { $archive.Dispose() }
}

function Get-CleanTitle([string]$fileName, [string]$metadataTitle) {
  $title = $metadataTitle
  switch -Regex ($fileName) {
    '^Catwoman_' { return 'Catwoman: Lonely City' }
    '^Legends_from_Castle_Grayskull' { return 'Legends from Castle Grayskull' }
    '^SpawnCerebus_' { return 'Spawn/Cerebus' }
    '^The_Shadow_5_' { return 'The Shadow #5' }
    '^Phoebe and Her Unicorn v05' { return 'Phoebe and Her Unicorn Vol. 5: Unicorn Crossing' }
    '^Sisters By ' { return 'Sisters' }
    '^Squad By ' { return 'Squad' }
    '^Stranger Planet By ' { return 'Strange Planet' }
    '^Tales from the Loop By ' { return 'Tales from the Loop' }
    '^Teen Titans Beast Boy By ' { return 'Teen Titans: Beast Boy' }
    '^The Adventure Zone By ' { return 'The Adventure Zone' }
    '^The Girl from the Sea By ' { return 'The Girl from the Sea' }
    '^The Walking Dead Compendium One ' { return 'The Walking Dead Compendium One' }
    '^Where.s Wally_ 5 ' { return "Where's Wally? 5: The Wonder Book" }
    '^Dog Man and Cat Kid ' { return 'Dog Man and Cat Kid' }
  }
  if (!$title -or $title -match '^(?i)untitled$|^https?://|^[\w-]+(?:_[\w-]+){2,}$') {
    $title = [System.IO.Path]::GetFileNameWithoutExtension($fileName)
    $title = $title -replace '\s+-\s+[^-]+$', '' -replace '\s+By\s+.+$', '' -replace '\s+\[.+\]$', ''
    $title = $title -replace '[_]+', ' ' -replace '\s+-\s+', ': ' -replace '\s+', ' '
    $title = ($title -replace '\b([a-z])', { param($match) $match.Value.ToUpperInvariant() }).Trim()
  }
  return $title
}

function Get-Author([string]$fileName, [string]$metadataAuthor) {
  if ($metadataAuthor -and $metadataAuthor -notmatch '^(?i)unknown$|^https?://') { return $metadataAuthor }
  switch -Regex ($fileName) {
    '^Sisters By ' { return 'Raina Telgemeier' }
    '^Squad By ' { return 'Maggie Tokuda-Hall' }
    '^Stranger Planet By ' { return 'Nathan W. Pyle' }
    '^Tales from the Loop By ' { return ('Simon St' + [char]0x00E5 + 'lenhag') }
    '^Teen Titans Beast Boy By ' { return 'Kami Garcia' }
    '^The Adventure Zone By ' { return 'Clint McElroy' }
    '^The Girl from the Sea By ' { return 'Molly Knox Ostertag' }
    '^The Walking Dead Compendium One ' { return 'Robert Kirkman' }
    '^Phoebe and Her Unicorn v05' { return 'Dana Simpson' }
    '^Dog Man and Cat Kid ' { return 'Dav Pilkey' }
    '^spider-man\.pdf$' { return 'Unknown' }
  }
  if ($fileName -match '\s+-\s+(.+?)\.epub$') { return $matches[1] }
  return 'Unknown'
}

function Get-Series([string]$fileName, [string]$title) {
  $value = "$fileName $title"
  switch -Regex ($value) {
    'Dog Man|Cat Kid' { return 'Dog Man' }
    'Captain Underpants' { return 'Captain Underpants' }
    'Catwoman' { return 'Catwoman' }
    'Darth Vader|Star Wars' { return 'Star Wars' }
    'Fowl Language' { return 'Fowl Language' }
    '\bGordon' { return 'Gordon' }
    "Julia.?s House" { return "Julia's House" }
    'Castle Grayskull' { return 'Masters of the Universe' }
    'Mighty Jack' { return 'Mighty Jack' }
    'Phoebe and Her Unicorn' { return 'Phoebe and Her Unicorn' }
    'Spider-Man' { return 'Spider-Man' }
    'Strange Planet|Stranger Planet' { return 'Strange Planet' }
    'Teen Titans' { return 'Teen Titans' }
    'The Adventure Zone' { return 'The Adventure Zone' }
    'The Last Kids on Earth' { return 'The Last Kids on Earth' }
    'The Walking Dead' { return 'The Walking Dead' }
    'The Shadow' { return 'The Shadow' }
    "Where.?s Wally" { return "Where's Wally" }
    '\bZita\b' { return 'Zita' }
  }
  return ''
}

function Get-Slug([string]$value) {
  $slug = ($value.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
  if (!$slug) { throw "Could not create a book id from '$value'." }
  return $slug
}

function Get-PdfPageCount([string]$path) {
  $previousPath = $env:PMP_IMPORT_PDF
  $env:PMP_IMPORT_PDF = $path
  try {
    $pdfScript = 'const fs=process.getBuiltinModule(String.fromCharCode(110,111,100,101,58,102,115));const pdf=require(String.fromCharCode(112,100,102,45,108,105,98));pdf.PDFDocument.load(fs.readFileSync(process.env.PMP_IMPORT_PDF),{ignoreEncryption:true}).then(d=>console.log(d.getPageCount())).catch(()=>console.log(1));'
    $count = & node -e $pdfScript
    if ($LASTEXITCODE -ne 0 -or "$count" -notmatch '^\d+$') { return 1 }
    return [int]$count
  } finally { $env:PMP_IMPORT_PDF = $previousPath }
}
$bookIcon = [System.Char]::ConvertFromUtf32(0x1F4DA)

function Get-CoverExtension([System.IO.Compression.ZipArchiveEntry]$entry) {
  $extension = [System.IO.Path]::GetExtension($entry.FullName).ToLowerInvariant()
  if ($extension -in @('.jpg', '.jpeg', '.png', '.webp')) { return $extension }
  if ($entry.Name -match '\.(jpg|jpeg|png|webp)$') { return "." + $matches[1].ToLowerInvariant() }
  return '.jpg'
}

if (!(Test-Path -LiteralPath $SourceDirectory -PathType Container)) { throw "Missing source directory: $SourceDirectory" }
if (!(Test-Path -LiteralPath $exportPath -PathType Leaf) -or !(Test-Path -LiteralPath $homePath -PathType Leaf)) { throw 'Missing local catalog JSON files.' }

$files = @(Get-ChildItem -LiteralPath $SourceDirectory -File | Where-Object { $_.Extension -match '(?i)^\.(epub|pdf)$' } | Sort-Object Name)
$export = Get-Content -LiteralPath $exportPath -Raw -Encoding UTF8 | ConvertFrom-Json
$homeCatalog = Get-Content -LiteralPath $homePath -Raw -Encoding UTF8 | ConvertFrom-Json
$existingIds = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($course in $export.courses) { [void]$existingIds.Add([string]$course.id) }
$maxCourseIndex = [int](($export.courses | Measure-Object -Property courseIndex -Maximum).Maximum)
$newCourses = [System.Collections.Generic.List[object]]::new()
$updatedCourses = [System.Collections.Generic.List[object]]::new()
$skipped = [System.Collections.Generic.List[string]]::new()
$courseIndex = $maxCourseIndex

foreach ($file in $files) {
  if ($file.Extension -ieq '.epub') {
    $metadata = Get-BookMetadata $file
    $title = Get-CleanTitle $file.Name $metadata.Title
    $author = Get-Author $file.Name $metadata.Author
    $pages = @($metadata.Pages)
  } else {
    $title = 'Spider-Man'
    $author = 'Unknown'
    $pageCount = Get-PdfPageCount $file.FullName
    $pages = @(for ($page = 1; $page -le $pageCount; $page++) { [pscustomobject]@{ Label = "Page $page"; Href = "#page=$page" } })
    $metadata = [pscustomobject]@{ CoverHref = '' }
  }

  $id = Get-Slug $title
  $isRepair = $RepairIds -contains $id
  if ($RepairIds.Count -gt 0 -and !$isRepair) { continue }
  if ($existingIds.Contains($id) -and !$isRepair) {
    $skipped.Add("$($file.Name): id '$id' already exists")
    continue
  }
  if (!$existingIds.Contains($id)) { [void]$existingIds.Add($id) }
  $series = Get-Series $file.Name $title
  $folder = "Comic/$id"
  $assetName = "$id$($file.Extension.ToLowerInvariant())"
  $assetPath = "/book_html/$folder/$assetName"
  $category = if ($series) { "Kid, Comic, $series" } else { 'Kid, Comic' }
  $pageNumber = 0
  $chapters = @(
    foreach ($page in $pages) {
      $pageNumber++
      if ($file.Extension -ieq '.epub') {
        $href = [string]$page.Href
        $content = $assetPath + $(if ($href) { "#$href" } else { '' })
        $stepTitle = if ($page.Label) { [string]$page.Label } else { "Page $pageNumber" }
      } else {
        $content = "$assetPath#page=$pageNumber"
        $stepTitle = "Page $pageNumber"
      }
      $chapterTitle = "Page $pageNumber"
      $chapterId = "$id-ch-import-$stamp-$pageNumber"
      $stepType = if ($file.Extension -ieq '.epub') { 'epub' } else { 'pdf' }
      [pscustomobject]@{
        id = $chapterId
        courseId = $id
        chapterIndex = 0
        title = $chapterTitle
        steps = @([pscustomobject]@{
          id = "$chapterId-step-0"
          courseId = $id
          chapterId = $chapterId
          chapterTitle = $chapterTitle
          chapterIndex = 0
          stepIndex = $pageNumber
          stepType = $stepType
          title = $stepTitle
          description = ''
          contentHtml = $content
          epubImageIndex = if ($file.Extension -ieq '.epub' -and $null -ne $page.ImageIndex) { [int]$page.ImageIndex } else { $null }
        })
      }
    }
  )

  $courseIndex++
  $course = [ordered]@{
    id = $id
    title = $title
    description = ''
    isPublished = $true
    authorName = $author
    color = '#dc2626'
    coverColorStart = '#dc2626'
    coverColorMiddle = '#b91c1c'
    coverColorEnd = '#7f1d1d'
    coverWidth = 100
    coverHeight = 150
    icon = [System.Char]::ConvertFromUtf32(0x1F4DA)
    iconColorStart = '#fff'
    iconColorMiddle = '#fff'
    iconColorEnd = '#fff'
    iconSize = 80
    titleFontSize = 50
    titleFontWeight = 'bolder'
    titleColor = '#faf5f5'
    titlePosition = 'bottom-left'
    titleTextAlign = 'left'
    iconPosition = 'center-center'
    courseIndex = $courseIndex
    category = $category
    cat1 = 'Kid'
    cat2 = 'Comic'
    cat3 = $series
    cat4 = ''
    artifactType = 'book'
    pageViewType = 'ComicView'
    bookHtmlFolder = $folder
    stepCount = $chapters.Count
    chapters = $chapters
  }
  $coverUrl = ''
  if ($file.Extension -ieq '.epub' -and $metadata.CoverHref) {
    $archive = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
    try {
      $coverEntry = $archive.GetEntry([Uri]::UnescapeDataString($metadata.CoverHref))
      if ($coverEntry) {
        $coverFileName = "$id$(Get-CoverExtension $coverEntry)"
        $course.coverImageUrl = "/book_covers/$coverFileName"
        $coverUrl = $course.coverImageUrl
        $course._coverSource = $coverEntry.FullName
      }
    } finally { $archive.Dispose() }
  }
  $course._sourceFile = $file.FullName
  $course._assetName = $assetName
  $course._coverFileName = if ($coverUrl) { [System.IO.Path]::GetFileName($coverUrl) } else { '' }
  if ($isRepair) {
    $existingCourse = @($export.courses | Where-Object { $_.id -eq $id })[0]
    if (!$existingCourse) { throw "Repair target '$id' was not found in the local catalog." }
    $existingCourse.chapters = @($chapters)
    $existingCourse.stepCount = $chapters.Count
    $updatedCourses.Add($existingCourse)
  } else {
    $newCourses.Add([pscustomobject]$course)
  }
}

Write-Output "Books discovered: $($files.Count); new IDs: $($newCourses.Count); repaired IDs: $($updatedCourses.Count); skipped: $($skipped.Count)"
foreach ($course in $newCourses) {
  Write-Output ("{0} | {1} | {2} | {3} chapters | {4}" -f $course.id, $course.title, $course.category, $course.stepCount, $course.authorName)
}
foreach ($course in $updatedCourses) {
  Write-Output ("Repaired {0} | {1} chapters" -f $course.id, $course.stepCount)
}
foreach ($item in $skipped) { Write-Warning $item }
if ($WhatIf) { Write-Output 'Dry run only; no files were changed.'; exit 0 }

foreach ($course in $newCourses) {
  $sourceFile = [string]$course._sourceFile
  $assetName = [string]$course._assetName
  $folderPath = Join-Path $bookHtmlRoot (($course.bookHtmlFolder -replace '/', '\'))
  New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
  Copy-Item -LiteralPath $sourceFile -Destination (Join-Path $folderPath $assetName) -Force
  if ($course._coverFileName) {
    $archive = [System.IO.Compression.ZipFile]::OpenRead($sourceFile)
    try {
      $coverEntry = $archive.GetEntry([Uri]::UnescapeDataString([string]$course._coverSource))
      if ($coverEntry) {
        $coverStream = $coverEntry.Open()
        $coverBytes = [System.IO.MemoryStream]::new()
        try {
          $coverStream.CopyTo($coverBytes)
          [System.IO.File]::WriteAllBytes((Join-Path $coversRoot $course._coverFileName), $coverBytes.ToArray())
        } finally { $coverStream.Dispose(); $coverBytes.Dispose() }
      }
    } finally { $archive.Dispose() }
  }
  foreach ($field in @('_sourceFile', '_assetName', '_coverSource', '_coverFileName')) {
    $course.PSObject.Properties.Remove($field)
  }
}

$export.courses = @($export.courses) + @($newCourses)
$export.exportedAt = $exportedAt
$homeSummaries = [System.Collections.Generic.List[object]]::new()
$summaryKeys = @('id','title','description','color','coverColorStart','coverColorMiddle','coverColorEnd','coverWidth','coverHeight','coverImageUrl','icon','iconColorStart','iconColorMiddle','iconColorEnd','iconSize','iconPosition','courseIndex','scIndex','sIndex','authorName','category','isPublished','cat1','cat2','cat3','cat4','pIndex','artifactType','bookHtmlFolder','stepCount','pageViewType')
$refreshedCourses = @($newCourses) + @($updatedCourses)
foreach ($course in $refreshedCourses) {
  $summary = [ordered]@{}
  foreach ($key in $summaryKeys) {
    $property = $course.PSObject.Properties[$key]
    if ($property -and $null -ne $property.Value) { $summary[$key] = $property.Value }
  }
  $homeSummaries.Add([pscustomobject]$summary)
}
$newIds = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
foreach ($course in $refreshedCourses) { [void]$newIds.Add([string]$course.id) }
$homeCatalog.courses = @($homeCatalog.courses | Where-Object { !$newIds.Contains([string]$_.id) }) + @($homeSummaries)
$homeCatalog.exportedAt = $exportedAt
$version = [pscustomobject]@{ exportedAt = "${exportedAt}:shelf-index-v2"; courseCount = $export.courses.Count }
[System.IO.File]::WriteAllText($exportPath, (($export | ConvertTo-Json -Depth 100) + "`n"), $utf8NoBom)
[System.IO.File]::WriteAllText($homePath, (($homeCatalog | ConvertTo-Json -Depth 100) + "`n"), $utf8NoBom)
[System.IO.File]::WriteAllText($versionPath, (($version | ConvertTo-Json -Compress) + "`n"), $utf8NoBom)
if ($refreshedCourses.Count -gt 0) {
  $newBookIds = @($refreshedCourses | ForEach-Object { [string]$_.id })
  if ($newCourses.Count -gt 0) {
    & node (Join-Path $PSScriptRoot 'generate-imported-cover-thumbs.cjs') @($newCourses | ForEach-Object { [string]$_.id })
    if ($LASTEXITCODE -ne 0) { throw 'Cover thumbnail generation failed.' }
  }
  & node (Join-Path $PSScriptRoot 'generate-imported-course-details.cjs') @newBookIds
  if ($LASTEXITCODE -ne 0) { throw 'Course detail generation failed.' }
}
Write-Output "Local catalog updated: $($export.courses.Count) total books. deploy/indexeddb-export.json was not touched."