<#
.SYNOPSIS
    Tworzy lekki wariant wideo hero dla telefonów i słabszych komputerów.

.DESCRIPTION
    Czyta `public/videos/hero.mp4` i zapisuje obok `hero-mobile.mp4`
    oraz plakat `public/og/hero-poster-mobile.jpg`.

    URUCHOM TO ZA KAŻDYM RAZEM, GDY PODMIENISZ `hero.mp4`.
    Inaczej telefony zostaną przy poprzedniej wersji materiału.

        powershell -ExecutionPolicy Bypass -File scripts/encode-hero-video.ps1

    Wymaga ffmpeg w PATH (https://ffmpeg.org/download.html).

.NOTES
    Dlaczego akurat te ustawienia:

    * `scale=854:480` — telefon i tak wyświetla kadr na kilkuset pikselach
      szerokości. Dekodowanie 1080p to czterokrotnie więcej pikseli na
      klatkę bez żadnej widocznej korzyści.

    * `-g 6` (klatka kluczowa co 0,2 s) — to jest najważniejsze ustawienie
      w całym pliku. Hero nie ODTWARZA filmu, tylko przewija go scrollem,
      czyli w kółko skacze po osi czasu. Żeby pokazać dowolną klatkę,
      dekoder musi zacząć od poprzedniej klatki kluczowej i przeliczyć
      wszystko po drodze. Przy domyślnym odstępie 0,8 s bywa to 24 klatki
      na jeden skok; przy 0,2 s — najwyżej 6.

    * `-crf 27` z `-preset slow` — te dwa razem wychodzą na ok. 2,3 MB
      zamiast 5,8 MB. Materiał ogląda się pod przyciemnieniem i (na
      początku) pod rozmyciem, więc zapas jakości nie miałby gdzie się
      pokazać.

    * `-movflags +faststart` — indeks pliku ląduje na jego początku,
      dzięki czemu przeglądarka zna długość materiału od razu.
#>

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root 'public/videos/hero.mp4'
$target = Join-Path $root 'public/videos/hero-mobile.mp4'
$poster = Join-Path $root 'public/og/hero-poster-mobile.jpg'

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    throw 'Nie znaleziono ffmpeg w PATH. Pobierz go z https://ffmpeg.org/download.html'
}

if (-not (Test-Path $source)) {
    throw "Brak pliku zrodlowego: $source"
}

Write-Host "Koduje wariant mobilny z $source ..." -ForegroundColor Cyan

& ffmpeg -v error -y -i $source `
    -vf 'scale=854:480' `
    -c:v libx264 -profile:v main -level 3.1 -pix_fmt yuv420p `
    -preset slow -crf 27 `
    -g 6 -keyint_min 6 -sc_threshold 0 `
    -an -movflags +faststart `
    $target

if ($LASTEXITCODE -ne 0) { throw 'ffmpeg zwrocil blad przy kodowaniu wideo.' }

Write-Host 'Zapisuje plakat mobilny ...' -ForegroundColor Cyan

& ffmpeg -v error -y -i $source -vf 'scale=960:-2' -frames:v 1 -q:v 6 $poster

if ($LASTEXITCODE -ne 0) { throw 'ffmpeg zwrocil blad przy zapisie plakatu.' }

$sourceMb = [math]::Round((Get-Item $source).Length / 1MB, 2)
$targetMb = [math]::Round((Get-Item $target).Length / 1MB, 2)

Write-Host ''
Write-Host "Gotowe.  hero.mp4: $sourceMb MB  ->  hero-mobile.mp4: $targetMb MB" -ForegroundColor Green
