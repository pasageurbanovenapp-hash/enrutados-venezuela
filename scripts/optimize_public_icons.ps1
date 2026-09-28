[CmdletBinding()]
param(
    [string]$IconDirectory = '',
    [int]$MaxSize = 256,
    [int]$Colors = 256
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($IconDirectory)) {
    $repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
    $IconDirectory = Join-Path $repoRoot 'artifacts\enrutados-venezuela\public\icons'
}

if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    throw 'ImageMagick no encontrado. Instala ImageMagick y vuelve a ejecutar este script.'
}

if (-not (Test-Path $IconDirectory)) {
    throw "Directorio de iconos no encontrado: $IconDirectory"
}

$icons = @(Get-ChildItem -Path $IconDirectory -Filter '*.png' -File)
if ($icons.Count -eq 0) {
    throw "No se encontraron PNG en: $IconDirectory"
}

$tempDirectory = Join-Path ([System.IO.Path]::GetTempPath()) "enrutados-icons-$([guid]::NewGuid())"
New-Item -ItemType Directory -Path $tempDirectory | Out-Null

try {
    foreach ($icon in $icons) {
        $outputPath = Join-Path $tempDirectory $icon.Name
        & magick $icon.FullName `
            -resize "${MaxSize}x${MaxSize}>" `
            -strip `
            -colors $Colors `
            -define png:compression-level=9 `
            -define png:compression-filter=5 `
            -define png:compression-strategy=1 `
            $outputPath

        if ($LASTEXITCODE -ne 0 -or -not (Test-Path $outputPath)) {
            throw "No se pudo optimizar $($icon.Name)"
        }
    }

    foreach ($icon in $icons) {
        Move-Item -Path (Join-Path $tempDirectory $icon.Name) -Destination $icon.FullName -Force
    }

    Write-Host "Iconos optimizados en $IconDirectory" -ForegroundColor Green
    & magick identify -format '%f %wx%h %[channels] %b\n' (Join-Path $IconDirectory '*.png')
}
finally {
    if (Test-Path $tempDirectory) {
        Remove-Item -Path $tempDirectory -Recurse -Force
    }
}
