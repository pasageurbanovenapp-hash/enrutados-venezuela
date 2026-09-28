<#
.SYNOPSIS
    generate_app_assets.ps1 — Enrutados V5.0A
    Genera iconos para Expo SDK 52, Android mipmaps, iOS AppIcon y Google Play Store usando .NET System.Drawing.
.EXAMPLE
    .\scripts\generate_app_assets.ps1 -AppName "pasajero" -IconSource "C:\dev\sesion-15-08-26\pasajero-master.png"
#>
param (
    [Parameter(Mandatory=$true)]
    [string]$AppName,

    [Parameter(Mandatory=$true)]
    [string]$IconSource
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $IconSource)) {
    Write-Error "Archivo fuente de ícono no encontrado: $IconSource"
    exit 1
}

$OutDir = Join-Path (Get-Location) "assets_generated\$AppName"

# Crear directorios
$Dirs = @(
    "$OutDir\expo",
    "$OutDir\android\mipmap-mdpi",
    "$OutDir\android\mipmap-hdpi",
    "$OutDir\android\mipmap-xhdpi",
    "$OutDir\android\mipmap-xxhdpi",
    "$OutDir\android\mipmap-xxxhdpi",
    "$OutDir\android\playstore",
    "$OutDir\ios\AppIcon.appiconset"
)

foreach ($d in $Dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

Write-Host "[INFO] Generando assets para: $AppName" -ForegroundColor Cyan
Write-Host "[INFO] Salida: $OutDir" -ForegroundColor Cyan

# Cargar imagen fuente
$SrcImage = [System.Drawing.Image]::FromFile($IconSource)

function Resize-Image {
    param (
        [System.Drawing.Image]$Image,
        [int]$Width,
        [int]$Height,
        [string]$OutPath,
        [bool]$Opaque = $false,
        [int]$DrawWidth = 0,
        [int]$DrawHeight = 0
    )

    $Bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
    
    $Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    if ($Opaque) {
        $Graphics.Clear([System.Drawing.Color]::White)
    } else {
        $Graphics.Clear([System.Drawing.Color]::Transparent)
    }

    if ($DrawWidth -eq 0) { $DrawWidth = $Width }
    if ($DrawHeight -eq 0) { $DrawHeight = $Height }

    $X = ($Width - $DrawWidth) / 2
    $Y = ($Height - $DrawHeight) / 2

    $Graphics.DrawImage($Image, [float]$X, [float]$Y, [float]$DrawWidth, [float]$DrawHeight)

    $Bitmap.Save($OutPath, [System.Drawing.Imaging.ImageFormat]::Png)

    $Graphics.Dispose()
    $Bitmap.Dispose()
    
    Write-Host "  [OK] ${Width}x${Height} -> $(Split-Path $OutPath -Leaf)" -ForegroundColor Green
}

# 1. EXPO
Write-Host "━━━ [1/3] Expo Assets ━━━" -ForegroundColor Yellow

# icon.png (1024x1024 sin transparencia)
Resize-Image -Image $SrcImage -Width 1024 -Height 1024 -OutPath "$OutDir\expo\icon.png" -Opaque $true

# adaptive-icon.png (1024x1024 con imagen centrada a 960px)
Resize-Image -Image $SrcImage -Width 1024 -Height 1024 -DrawWidth 960 -DrawHeight 960 -OutPath "$OutDir\expo\adaptive-icon.png" -Opaque $false

# favicon.png (48x48)
Resize-Image -Image $SrcImage -Width 48 -Height 48 -OutPath "$OutDir\expo\favicon.png" -Opaque $false

# 2. ANDROID
Write-Host "━━━ [2/3] Android Launcher Icons ━━━" -ForegroundColor Yellow

$AndroidSizes = @{
    "mdpi" = 48
    "hdpi" = 72
    "xhdpi" = 96
    "xxhdpi" = 144
    "xxxhdpi" = 192
}

foreach ($density in $AndroidSizes.Keys) {
    $size = $AndroidSizes[$density]
    Resize-Image -Image $SrcImage -Width $size -Height $size -OutPath "$OutDir\android\mipmap-$density\ic_launcher.png"
    Resize-Image -Image $SrcImage -Width $size -Height $size -OutPath "$OutDir\android\mipmap-$density\ic_launcher_round.png"
}

Resize-Image -Image $SrcImage -Width 512 -Height 512 -OutPath "$OutDir\android\playstore\ic_launcher_512.png"

# 3. iOS
Write-Host "━━━ [3/3] iOS App Icons ━━━" -ForegroundColor Yellow

$IosSizes = @{
    "icon-20@2x" = 40
    "icon-20@3x" = 60
    "icon-29@2x" = 58
    "icon-29@3x" = 87
    "icon-40@2x" = 80
    "icon-40@3x" = 120
    "icon-60@2x" = 120
    "icon-60@3x" = 180
    "icon-20" = 20
    "icon-20-ipad@2x" = 40
    "icon-29" = 29
    "icon-29-ipad@2x" = 58
    "icon-40" = 40
    "icon-40-ipad@2x" = 80
    "icon-76" = 76
    "icon-76@2x" = 152
    "icon-83.5@2x" = 167
    "icon-1024" = 1024
}

foreach ($name in $IosSizes.Keys) {
    $size = $IosSizes[$name]
    Resize-Image -Image $SrcImage -Width $size -Height $size -OutPath "$OutDir\ios\AppIcon.appiconset\$name.png" -Opaque $true
}

# Copiar automáticamente los assets a las carpetas de las apps correspondientes
$TargetAppFolder = switch ($AppName) {
    "pasajero"  { "EnrutadosPasajero" }
    "conductor" { "EnrutadosConductor" }
    "admin"     { "EnrutadosAdmin" }
}

if ($TargetAppFolder) {
    $AppAssets = Join-Path (Get-Location) "apps\$TargetAppFolder\assets"
    if (Test-Path $AppAssets) {
        Copy-Item "$OutDir\expo\icon.png" "$AppAssets\icon.png" -Force
        Copy-Item "$OutDir\expo\adaptive-icon.png" "$AppAssets\adaptive-icon.png" -Force
        Copy-Item "$OutDir\expo\favicon.png" "$AppAssets\favicon.png" -Force
        Write-Host "[OK] Assets copiados exitosamente a apps\$TargetAppFolder\assets\" -ForegroundColor Cyan
    }
}

$SrcImage.Dispose()
Write-Host "✅ Proceso completado para $AppName" -ForegroundColor Green
