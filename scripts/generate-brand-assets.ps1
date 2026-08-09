<#
    generate-brand-assets.ps1
    -------------------------
    Generuje favicony i obraz OpenGraph z `public/logo/logo.png`.

    Uruchom z katalogu projektu:
        powershell -ExecutionPolicy Bypass -File .\scripts\generate-brand-assets.ps1

    Podmień logo i odpal ponownie — cała identyfikacja wizualna
    (ikona karty, obraz do udostępnień) przeliczy się sama.

    Tylko Windows (System.Drawing). Na macOS/Linux wygeneruj te pliki
    dowolnym innym narzędziem i wrzuć pod te same ścieżki.
#>

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $root 'public'
$logoPath = Join-Path $publicDir 'logo\logo.png'

if (-not (Test-Path $logoPath)) {
    Write-Error "Brak pliku $logoPath"
    exit 1
}

function Ensure-Dir([string]$Path) {
    if (-not (Test-Path $Path)) { New-Item -ItemType Directory -Force -Path $Path | Out-Null }
}

$logo = [System.Drawing.Image]::FromFile($logoPath)

function New-BrandPlate {
    param(
        [string]$Path,
        [int]$Width,
        [int]$Height,
        [double]$LogoScale = 0.55,
        [switch]$Png,
        [string]$Caption = ''
    )

    Ensure-Dir (Split-Path -Parent $Path)

    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    # Tło: near-black marki
    $g.Clear([System.Drawing.Color]::FromArgb(255, 5, 0, 13))

    # Neonowe poświaty (fiolet / magenta / błękit)
    $blooms = @(
        @{ x = 0.18; y = 0.20; r = 0.95; c = @(179, 71, 255); a = 60 },
        @{ x = 0.85; y = 0.78; r = 0.80; c = @(255, 45, 247); a = 46 },
        @{ x = 0.55; y = 0.95; r = 0.70; c = @(45, 159, 255); a = 40 }
    )

    foreach ($b in $blooms) {
        $radius = [int]([Math]::Max($Width, $Height) * $b.r)
        $cx = [int]($Width * $b.x) - [int]($radius / 2)
        $cy = [int]($Height * $b.y) - [int]($radius / 2)

        # Uwaga: nie nazywaj tej zmiennej $path — kolidowałaby z parametrem $Path.
        $bloomPath = New-Object System.Drawing.Drawing2D.GraphicsPath
        $bloomPath.AddEllipse($cx, $cy, $radius, $radius)
        $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($bloomPath)
        $brush.CenterColor = [System.Drawing.Color]::FromArgb($b.a, $b.c[0], $b.c[1], $b.c[2])
        $brush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, $b.c[0], $b.c[1], $b.c[2]))
        $g.FillPath($brush, $bloomPath)
        $brush.Dispose()
        $bloomPath.Dispose()
    }

    # Siatka
    $gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(14, 179, 71, 255), 1)
    $step = [int]([Math]::Max(24, $Width / 16))
    for ($x = $step; $x -lt $Width; $x += $step) { $g.DrawLine($gridPen, $x, 0, $x, $Height) }
    for ($y = $step; $y -lt $Height; $y += $step) { $g.DrawLine($gridPen, 0, $y, $Width, $y) }
    $gridPen.Dispose()

    # Logo, wpasowane z zachowaniem proporcji
    $maxW = $Width * $LogoScale
    $maxH = $Height * $LogoScale
    $ratio = [Math]::Min($maxW / $logo.Width, $maxH / $logo.Height)
    $lw = [int]($logo.Width * $ratio)
    $lh = [int]($logo.Height * $ratio)
    $lx = [int](($Width - $lw) / 2)
    $ly = [int](($Height - $lh) / 2)
    if ($Caption) { $ly = [int]($ly - $Height * 0.06) }

    $g.DrawImage($logo, $lx, $ly, $lw, $lh)

    if ($Caption) {
        $fontSize = [float]([Math]::Max(14, $Height * 0.042))
        $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
        $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 199, 179, 230))
        $format = New-Object System.Drawing.StringFormat
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $rect = New-Object System.Drawing.RectangleF(0, ($ly + $lh + $Height * 0.045), $Width, ($fontSize * 2.4))
        $g.DrawString($Caption, $font, $brush, $rect, $format)
        $font.Dispose(); $brush.Dispose(); $format.Dispose()
    }

    $g.Dispose()

    if ($Png) {
        $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    else {
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
            Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
        $params = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter(
            [System.Drawing.Imaging.Encoder]::Quality, [int64]90)
        $bmp.Save($Path, $encoder, $params)
        $params.Dispose()
    }

    $bmp.Dispose()
    Write-Host ("  " + $Path.Replace($root, '.'))
}

Write-Host "`nGeneruję zasoby marki z logo.png..." -ForegroundColor Magenta

New-BrandPlate -Path (Join-Path $publicDir 'og\og-image.jpg') -Width 1200 -Height 630 -LogoScale 0.44 -Caption 'Producent Muzyczny  ·  Mix / Master  ·  Wizualizacje'
New-BrandPlate -Path (Join-Path $publicDir 'icons\favicon-32.png')       -Width 32  -Height 32  -LogoScale 0.86 -Png
New-BrandPlate -Path (Join-Path $publicDir 'icons\apple-touch-icon.png') -Width 180 -Height 180 -LogoScale 0.76 -Png
New-BrandPlate -Path (Join-Path $publicDir 'icons\icon-512.png')         -Width 512 -Height 512 -LogoScale 0.72 -Png

$logo.Dispose()
Write-Host "`nGotowe." -ForegroundColor Green
