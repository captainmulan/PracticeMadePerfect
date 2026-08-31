Add-Type -AssemblyName System.Drawing
$src = Join-Path $PSScriptRoot "..\assets\whiteboard.png"
$dst = Join-Path $PSScriptRoot "..\assets\whiteboard-board.png"
$img = [System.Drawing.Image]::FromFile($src)
$crop = New-Object System.Drawing.Rectangle 48, 42, 402, 276
$bmp = New-Object System.Drawing.Bitmap $crop.Width, $crop.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $crop.Width, $crop.Height), $crop, [System.Drawing.GraphicsUnit]::Pixel)
$bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
$img.Dispose()
Write-Output "Saved $dst"
