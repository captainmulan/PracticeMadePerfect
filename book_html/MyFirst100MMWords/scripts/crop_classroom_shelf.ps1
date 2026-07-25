Add-Type -AssemblyName System.Drawing
$src = Join-Path $PSScriptRoot "..\assets\classroom-reference.png"
$dst = Join-Path $PSScriptRoot "..\assets\classroom-shelf-plant.png"
$img = [System.Drawing.Image]::FromFile($src)
# Bottom-left: white shelf, books, chevron pot, green plant (matches reference SS)
$cropW = [int]($img.Width * 0.40)
$cropH = [int]($img.Height * 0.36)
$cropY = [int]($img.Height * 0.64)
$crop = New-Object System.Drawing.Rectangle 0, $cropY, $cropW, $cropH
$bmp = New-Object System.Drawing.Bitmap $cropW, $cropH
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $cropW, $cropH), $crop, [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
Write-Output "Saved $dst ($cropW x $cropH)"
