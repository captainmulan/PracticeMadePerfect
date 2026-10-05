param(
  [string]$SourcePath = "book_html/Other/vibe-book-final/vibe-coding-book.epub",
  [string]$OutputDirectory = "book_html/Other/vibe-book-final/cloudflare-pages",
  [long]$MaxFileBytes = 25MB
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$source = [IO.Path]::GetFullPath((Join-Path $PWD $SourcePath))
$output = [IO.Path]::GetFullPath((Join-Path $PWD $OutputDirectory))
if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
  throw "EPUB not found: $source"
}
if (Test-Path -LiteralPath $output) {
  throw "Output directory already exists; move or rename it before splitting: $output"
}

function Resolve-EpubPath([string]$fromPath, [string]$reference) {
  $value = [Uri]::UnescapeDataString(($reference -split '[?#]', 2)[0]).Replace('\', '/')
  if (-not $value -or $value.StartsWith('/') -or $value -match '^[a-z][a-z0-9+.-]*:') { return $null }
  $parts = [Collections.Generic.List[string]]::new()
  $base = [IO.Path]::GetDirectoryName($fromPath).Replace('\', '/')
  foreach ($part in @($base -split '/') + @($value -split '/')) {
    if (-not $part -or $part -eq '.') { continue }
    if ($part -eq '..') {
      if ($parts.Count -gt 0) { $parts.RemoveAt($parts.Count - 1) }
      continue
    }
    $parts.Add($part)
  }
  return $parts -join '/'
}

function Get-LocalReferences([string]$archivePath, [string]$content) {
  $found = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
  $refs = [Collections.Generic.List[string]]::new()
  $xml = [Xml.XmlDocument]::new()
  $xml.XmlResolver = $null
  try {
    $xml.LoadXml($content)
    foreach ($element in $xml.SelectNodes('//*')) {
      foreach ($attribute in $element.Attributes) {
        if ($attribute.LocalName -notin @('src', 'href', 'style')) { continue }
        if ($attribute.LocalName -eq 'style') {
          foreach ($match in [regex]::Matches($attribute.Value, 'url\(["'']?([^"'')]+)')) {
            $refs.Add($match.Groups[1].Value)
          }
        } elseif ([IO.Path]::GetExtension(($attribute.Value -split '[?#]', 2)[0]) -match '^\.(css|js|png|jpe?g|webp|gif|svg|ttf|otf|woff2?)$') {
          $refs.Add($attribute.Value)
        }
      }
    }
  } catch {
    foreach ($match in [regex]::Matches($content, '(?:src|href)=["'']([^"'']+)["'']')) {
      if ([IO.Path]::GetExtension(($match.Groups[1].Value -split '[?#]', 2)[0]) -match '^\.(css|js|png|jpe?g|webp|gif|svg|ttf|otf|woff2?)$') {
        $refs.Add($match.Groups[1].Value)
      }
    }
  }
  foreach ($ref in $refs) {
    $path = Resolve-EpubPath $archivePath $ref
    if ($path) { [void]$found.Add($path) }
  }
  return @($found)
}

function Get-EntryText($entry) {
  $reader = [IO.StreamReader]::new($entry.Open())
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Add-ResourceClosure([string]$entryPath, [hashtable]$entryByPath, [Collections.Generic.HashSet[string]]$set) {
  $queue = [Collections.Generic.Queue[string]]::new()
  $queue.Enqueue($entryPath)
  while ($queue.Count -gt 0) {
    $current = $queue.Dequeue()
    if (-not $set.Add($current)) { continue }
    $entry = $entryByPath[$current]
    if (-not $entry) { throw "EPUB asset referenced but missing: $current" }
    if ([IO.Path]::GetExtension($current) -match '^\.(css|xhtml|html)$') {
      foreach ($reference in (Get-LocalReferences $current (Get-EntryText $entry))) {
        if ($entryByPath.ContainsKey($reference) -and -not $set.Contains($reference)) {
          $queue.Enqueue($reference)
        }
      }
    }
  }
}

$archive = [IO.Compression.ZipFile]::OpenRead($source)
try {
  $entryByPath = @{}
  foreach ($entry in $archive.Entries) { $entryByPath[$entry.FullName] = $entry }
  $container = [xml](Get-EntryText $entryByPath['META-INF/container.xml'])
  $rootFile = $container.SelectSingleNode("//*[local-name()='rootfile']").GetAttribute('full-path')
  $opfSource = Get-EntryText $entryByPath[$rootFile]
  $opf = [Xml.XmlDocument]::new()
  $opf.PreserveWhitespace = $true
  $opf.XmlResolver = $null
  $opf.LoadXml($opfSource)
  $opfNs = [Xml.XmlNamespaceManager]::new($opf.NameTable)
  $opfNs.AddNamespace('o', 'http://www.idpf.org/2007/opf')
  $opfNs.AddNamespace('dc', 'http://purl.org/dc/elements/1.1/')
  $manifest = @{}
  foreach ($item in $opf.SelectNodes('//o:manifest/o:item', $opfNs)) {
    $zipPath = Resolve-EpubPath $rootFile $item.GetAttribute('href')
    $manifest[$item.GetAttribute('id')] = [pscustomobject]@{
      Id = $item.GetAttribute('id')
      Href = $item.GetAttribute('href')
      ZipPath = $zipPath
      MediaType = $item.GetAttribute('media-type')
      Properties = $item.GetAttribute('properties')
      SourceNode = $item
    }
  }

  $pages = [Collections.Generic.List[object]]::new()
  foreach ($itemRef in $opf.SelectNodes('//o:spine/o:itemref', $opfNs)) {
    $item = $manifest[$itemRef.GetAttribute('idref')]
    if ($item -and $item.Href -match '(^|/)page-(\d+)\.xhtml$') {
      $pageNumber = [int]$Matches[2]
      $dependencies = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
      Add-ResourceClosure $item.ZipPath $entryByPath $dependencies
      $pages.Add([pscustomobject]@{ Number = $pageNumber; Item = $item; Dependencies = $dependencies })
    }
  }
  if ($pages.Count -eq 0) { throw 'No page-N.xhtml items were found in the EPUB spine.' }

  $shared = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
  foreach ($item in $manifest.Values) {
    if ($item.MediaType -match '^(text/css|text/javascript|application/javascript|font/|application/font|application/vnd\.ms-opentype)' -or $item.Properties -match '(^|\s)cover-image(\s|$)') {
      Add-ResourceClosure $item.ZipPath $entryByPath $shared
    }
  }
  $coverItem = $manifest.Values | Where-Object { $_.Href -match '(^|/)cover\.xhtml$' } | Select-Object -First 1
  if ($coverItem) { Add-ResourceClosure $coverItem.ZipPath $entryByPath $shared }

  $budget = $MaxFileBytes - 128KB
  $groups = [Collections.Generic.List[object]]::new()
  $current = [Collections.Generic.List[object]]::new()
  foreach ($page in $pages) {
    $candidate = @($current.ToArray()) + @($page)
    $paths = [Collections.Generic.HashSet[string]]::new($shared, [StringComparer]::OrdinalIgnoreCase)
    foreach ($candidatePage in $candidate) {
      [void]$paths.Add($candidatePage.Item.ZipPath)
      foreach ($dependency in $candidatePage.Dependencies) { [void]$paths.Add($dependency) }
    }
    $estimate = 128KB
    foreach ($path in $paths) { $estimate += $entryByPath[$path].CompressedLength }
    if ($current.Count -gt 0 -and $estimate -gt $budget) {
      $groups.Add(@($current.ToArray()))
      $current = [Collections.Generic.List[object]]::new()
    }
    $current.Add($page)
  }
  if ($current.Count -gt 0) { $groups.Add(@($current.ToArray())) }
  if ($groups.Count -gt 3) { throw "The EPUB needs $($groups.Count) parts at this size budget; choose a different host or increase the allowed part count." }

  [void][IO.Directory]::CreateDirectory($output)
  $partResults = [Collections.Generic.List[object]]::new()
  for ($groupIndex = 0; $groupIndex -lt $groups.Count; $groupIndex++) {
    $group = @($groups[$groupIndex])
    $first = $group[0].Number
    $last = $group[-1].Number
    $partName = 'part-{0:D2}.epub' -f ($groupIndex + 1)
    $partPath = Join-Path $output $partName
    $resources = [Collections.Generic.HashSet[string]]::new($shared, [StringComparer]::OrdinalIgnoreCase)
    foreach ($page in $group) {
      [void]$resources.Add($page.Item.ZipPath)
      foreach ($dependency in $page.Dependencies) { [void]$resources.Add($dependency) }
    }

    $partOpf = [Xml.XmlDocument]::new()
    $partOpf.PreserveWhitespace = $true
    $partOpf.XmlResolver = $null
    $partOpf.LoadXml($opf.OuterXml)
    $partNs = [Xml.XmlNamespaceManager]::new($partOpf.NameTable)
    $partNs.AddNamespace('o', 'http://www.idpf.org/2007/opf')
    $partNs.AddNamespace('dc', 'http://purl.org/dc/elements/1.1/')
    $partManifest = $partOpf.SelectSingleNode('//o:manifest', $partNs)
    foreach ($node in @($partManifest.SelectNodes('o:item', $partNs))) { [void]$partManifest.RemoveChild($node) }
    $keptIds = [Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
    foreach ($item in $manifest.Values) {
      if ($resources.Contains($item.ZipPath)) { [void]$keptIds.Add($item.Id) }
    }

    $navItem = $manifest.Values | Where-Object { $_.Properties -match '(^|\s)nav(\s|$)' } | Select-Object -First 1
    $navId = if ($navItem) { $navItem.Id } else { 'pmp-nav' }
    [void]$keptIds.Add($navId)
    foreach ($item in $manifest.Values) {
      if (-not $keptIds.Contains($item.Id) -or $item.MediaType -eq 'application/x-dtbncx+xml') { continue }
      $clone = $partOpf.ImportNode($item.SourceNode, $true)
      if ($item.Id -eq $navId) {
        $clone.SetAttribute('href', 'nav.xhtml')
        $clone.SetAttribute('media-type', 'application/xhtml+xml')
        $clone.SetAttribute('properties', 'nav')
      }
      [void]$partManifest.AppendChild($clone)
    }
    if (-not $navItem) {
      $navNode = $partOpf.CreateElement('item', $partManifest.NamespaceURI)
      $navNode.SetAttribute('id', $navId)
      $navNode.SetAttribute('href', 'nav.xhtml')
      $navNode.SetAttribute('media-type', 'application/xhtml+xml')
      $navNode.SetAttribute('properties', 'nav')
      [void]$partManifest.AppendChild($navNode)
    }

    $spine = $partOpf.SelectSingleNode('//o:spine', $partNs)
    if ($spine.HasAttribute('toc')) { $spine.RemoveAttribute('toc') }
    foreach ($node in @($spine.SelectNodes('o:itemref', $partNs))) { [void]$spine.RemoveChild($node) }
    if ($groupIndex -eq 0 -and $coverItem -and $keptIds.Contains($coverItem.Id)) {
      $coverRef = $partOpf.CreateElement('itemref', $spine.NamespaceURI)
      $coverRef.SetAttribute('idref', $coverItem.Id)
      $coverRef.SetAttribute('linear', 'no')
      [void]$spine.AppendChild($coverRef)
    }
    foreach ($page in $group) {
      $pageRef = $partOpf.CreateElement('itemref', $spine.NamespaceURI)
      $pageRef.SetAttribute('idref', $page.Item.Id)
      [void]$spine.AppendChild($pageRef)
    }

    $titleNode = $partOpf.SelectSingleNode('//dc:title', $partNs)
    if ($titleNode) { $titleNode.InnerText = "Vibe Coding Book (pages $first-$last)" }
    $identifierNode = $partOpf.SelectSingleNode("//dc:identifier[@id='BookId']", $partNs)
    if ($identifierNode) { $identifierNode.InnerText = "8397A700-CEF2-41CE-BE0B-CE393EE08173-part-$($groupIndex + 1)" }

    $navDoc = [Xml.XmlDocument]::new()
    $navDoc.XmlResolver = $null
    $html = $navDoc.CreateElement('html', 'http://www.w3.org/1999/xhtml')
    $html.SetAttribute('lang', 'en')
    $html.SetAttribute('xmlns:epub', 'http://www.idpf.org/2007/ops') | Out-Null
    [void]$navDoc.AppendChild($navDoc.CreateXmlDeclaration('1.0', 'UTF-8', $null))
    [void]$navDoc.AppendChild($html)
    $head = $navDoc.CreateElement('head', $html.NamespaceURI)
    $meta = $navDoc.CreateElement('meta', $html.NamespaceURI); $meta.SetAttribute('charset', 'UTF-8'); [void]$head.AppendChild($meta)
    $navTitle = $navDoc.CreateElement('title', $html.NamespaceURI); $navTitle.InnerText = "Pages $first-$last"; [void]$head.AppendChild($navTitle)
    [void]$html.AppendChild($head)
    $body = $navDoc.CreateElement('body', $html.NamespaceURI)
    $nav = $navDoc.CreateElement('nav', $html.NamespaceURI); $nav.SetAttribute('id', 'toc'); $nav.SetAttribute('type', 'toc', 'http://www.idpf.org/2007/ops') | Out-Null
    $heading = $navDoc.CreateElement('h1', $html.NamespaceURI); $heading.InnerText = "Pages $first-$last"; [void]$nav.AppendChild($heading)
    $list = $navDoc.CreateElement('ol', $html.NamespaceURI)
    foreach ($page in $group) {
      $listItem = $navDoc.CreateElement('li', $html.NamespaceURI)
      $link = $navDoc.CreateElement('a', $html.NamespaceURI); $link.SetAttribute('href', $page.Item.Href); $link.InnerText = "Page $($page.Number)"
      [void]$listItem.AppendChild($link); [void]$list.AppendChild($listItem)
    }
    [void]$nav.AppendChild($list); [void]$body.AppendChild($nav); [void]$html.AppendChild($body)

    $file = [IO.File]::Open($partPath, [IO.FileMode]::CreateNew)
    try {
      $outZip = [IO.Compression.ZipArchive]::new($file, [IO.Compression.ZipArchiveMode]::Create, $false)
      try {
        $mime = $outZip.CreateEntry('mimetype', [IO.Compression.CompressionLevel]::NoCompression)
        $writer = [IO.StreamWriter]::new($mime.Open(), [Text.Encoding]::ASCII)
        $writer.Write('application/epub+zip'); $writer.Dispose()
        foreach ($resource in $resources) {
          if ($resource -eq 'mimetype' -or $resource -eq $rootFile -or $resource -eq 'OPS/nav.xhtml') { continue }
          $sourceEntry = $entryByPath[$resource]
          if (-not $sourceEntry) { throw "Missing source resource: $resource" }
          $targetEntry = $outZip.CreateEntry($resource, [IO.Compression.CompressionLevel]::Optimal)
          $sourceStream = $sourceEntry.Open(); $targetStream = $targetEntry.Open()
          try { $sourceStream.CopyTo($targetStream) } finally { $sourceStream.Dispose(); $targetStream.Dispose() }
        }
        $navEntry = $outZip.CreateEntry('OPS/nav.xhtml', [IO.Compression.CompressionLevel]::Optimal)
        $navSettings = [Xml.XmlWriterSettings]::new(); $navSettings.Encoding = [Text.UTF8Encoding]::new($false); $navSettings.Indent = $false
        $navStream = $navEntry.Open()
        try {
          $navWriter = [Xml.XmlWriter]::Create($navStream, $navSettings)
          try { $navDoc.Save($navWriter) } finally { $navWriter.Dispose() }
        } finally { $navStream.Dispose() }
        $opfEntryOut = $outZip.CreateEntry($rootFile, [IO.Compression.CompressionLevel]::Optimal)
        $opfSettings = [Xml.XmlWriterSettings]::new(); $opfSettings.Encoding = [Text.UTF8Encoding]::new($false); $opfSettings.Indent = $false
        $opfStream = $opfEntryOut.Open()
        try {
          $opfWriter = [Xml.XmlWriter]::Create($opfStream, $opfSettings)
          try { $partOpf.Save($opfWriter) } finally { $opfWriter.Dispose() }
        } finally { $opfStream.Dispose() }
        $containerEntryOut = $outZip.CreateEntry('META-INF/container.xml', [IO.Compression.CompressionLevel]::Optimal)
        $containerBytes = [Text.Encoding]::UTF8.GetBytes((Get-EntryText $entryByPath['META-INF/container.xml']))
        $containerStream = $containerEntryOut.Open(); try { $containerStream.Write($containerBytes, 0, $containerBytes.Length) } finally { $containerStream.Dispose() }
      } finally { $outZip.Dispose() }
    } finally { $file.Dispose() }

    $size = (Get-Item -LiteralPath $partPath).Length
    if ($size -ge $MaxFileBytes) { throw "Generated $partName is $size bytes, not below the $MaxFileBytes byte limit." }
    $partResults.Add([pscustomobject]@{ File = $partName; FirstPage = $first; LastPage = $last; Bytes = $size })
  }

  @'
/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, HEAD, OPTIONS
  Access-Control-Allow-Headers: Range
  Access-Control-Expose-Headers: Content-Length, Content-Range, Accept-Ranges
  Cache-Control: public, max-age=31536000, immutable
'@ | Set-Content -LiteralPath (Join-Path $output '_headers') -Encoding ASCII

  $partResults | Format-Table -AutoSize
  Write-Output "Created $($groups.Count) valid EPUB segments in $output"
} catch {
  if (Test-Path -LiteralPath $output) {
    Remove-Item -LiteralPath $output -Recurse -Force
  }
  throw
} finally {
  $archive.Dispose()
}