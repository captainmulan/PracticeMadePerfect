Add-Type -AssemblyName System.Drawing
$src = "C:\Users\65966\PracticeMadePerfect\book_html\သံပါးစပ်\assets\thone-pa-sat-hero.png"
$dst = "C:\Users\65966\PracticeMadePerfect\book_html\သံပါးစပ်\assets\thone-pa-sat-hero.jpg"
$img = [System.Drawing.Image]::FromFile($src)
$maxW = 640
if ($img.Width -gt $maxW) {
  $ratio = $maxW / $img.Width
  $w = $maxW
  $h = [int]($img.Height * $ratio)
} else {
  $w = $img.Width
  $h = $img.Height
}
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, 0, 0, $w, $h)
$g.Dispose()
$img.Dispose()
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88L
$bmp.Save($dst, $enc, $ep)
$bmp.Dispose()
Write-Output "Wrote $dst ($([math]::Round((Get-Item $dst).Length/1KB)) KB)"
