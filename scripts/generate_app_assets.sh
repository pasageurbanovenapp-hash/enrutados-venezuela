#!/usr/bin/env bash
# =============================================================================
# generate_app_assets.sh — Enrutados V5.0A
# Genera iconos y splashes para App Store, Google Play y Expo SDK 52
# Requiere: ImageMagick (convert, identify)
# Uso: bash generate_app_assets.sh <app> <icono_fuente.png> [splash_fuente.png]
# Ejemplo: bash generate_app_assets.sh pasajero icon-pasajero.png splas_pasajero.png
# =============================================================================

set -euo pipefail

# ──────────────────────────────────────────────
# COLORES para output legible
# ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC}  $1"; }
log_ok()      { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# ──────────────────────────────────────────────
# VALIDACIONES INICIALES
# ──────────────────────────────────────────────
command -v convert  &>/dev/null || log_error "ImageMagick no encontrado. Instala: sudo apt install imagemagick"
command -v identify &>/dev/null || log_error "identify (ImageMagick) no encontrado."

[[ $# -lt 2 ]] && {
    echo "Uso: $0 <app_name> <icon_source.png> [splash_source.png]"
    echo "     app_name: pasajero | conductor | admin"
    exit 1
}

APP_NAME="$1"
ICON_SRC="$2"
SPLASH_SRC="${3:-}"

[[ ! -f "$ICON_SRC" ]] && log_error "Archivo de icono no encontrado: $ICON_SRC"
[[ -n "$SPLASH_SRC" && ! -f "$SPLASH_SRC" ]] && log_error "Archivo de splash no encontrado: $SPLASH_SRC"

# Verificar que la fuente sea >= 1024x1024
SRC_W=$(identify -format "%w" "$ICON_SRC")
SRC_H=$(identify -format "%h" "$ICON_SRC")
[[ $SRC_W -lt 1024 || $SRC_H -lt 1024 ]] && \
    log_warn "Fuente menor a 1024x1024 (${SRC_W}x${SRC_H}). Calidad puede degradarse."

# ──────────────────────────────────────────────
# DIRECTORIO DE SALIDA
# ──────────────────────────────────────────────
OUT_DIR="./assets_generated/${APP_NAME}"
mkdir -p \
    "${OUT_DIR}/expo" \
    "${OUT_DIR}/android/mipmap-mdpi" \
    "${OUT_DIR}/android/mipmap-hdpi" \
    "${OUT_DIR}/android/mipmap-xhdpi" \
    "${OUT_DIR}/android/mipmap-xxhdpi" \
    "${OUT_DIR}/android/mipmap-xxxhdpi" \
    "${OUT_DIR}/android/playstore" \
    "${OUT_DIR}/ios" \
    "${OUT_DIR}/ios/AppIcon.appiconset"

log_info "Generando assets para: ${APP_NAME}"
log_info "Directorio de salida: ${OUT_DIR}"

# ──────────────────────────────────────────────
# FUNCIÓN UTILITARIA: resize con calidad óptima
# ──────────────────────────────────────────────
resize_icon() {
    local src="$1"
    local dst="$2"
    local size="$3"
    local extra_opts="${4:-}"

    convert "$src" \
        -resize "${size}x${size}" \
        -gravity center \
        -extent "${size}x${size}" \
        +repage \
        $extra_opts \
        "$dst"
    log_ok "  ${size}x${size} → $(basename $dst)"
}

# ──────────────────────────────────────────────
# 1. EXPO — icon.png y adaptive-icon.png
# ──────────────────────────────────────────────
log_info "━━━ [1/4] Expo Assets ━━━"

# icon.png — 1024x1024, sin transparencia (App Store lo rechaza con alpha)
convert "$ICON_SRC" \
    -resize 1024x1024 \
    -gravity center \
    -background white \
    -flatten \
    -extent 1024x1024 \
    "${OUT_DIR}/expo/icon.png"
log_ok "  expo/icon.png (1024x1024, sin alpha)"

# adaptive-icon.png — 1024x1024 (Ajustado para máximo tamaño visual)
# Permite pasar SAFE_SIZE por variable de entorno (por defecto 960px ~ 94% de 1024)
SAFE_SIZE=${SAFE_SIZE:-960}
convert "$ICON_SRC" \
    -resize "${SAFE_SIZE}x${SAFE_SIZE}" \
    -gravity center \
    -background none \
    -extent 1024x1024 \
    "${OUT_DIR}/expo/adaptive-icon.png"
log_ok "  expo/adaptive-icon.png (1024x1024, tamaño ampliado ${SAFE_SIZE}px)"

# favicon.png para web (Expo web)
resize_icon "$ICON_SRC" "${OUT_DIR}/expo/favicon.png" 48

# ──────────────────────────────────────────────
# 2. ANDROID — mipmap densities
# ──────────────────────────────────────────────
log_info "━━━ [2/4] Android Launcher Icons ━━━"

# ic_launcher (cuadrado con esquinas redondeadas implícitas)
declare -A ANDROID_SIZES=(
    ["mdpi"]=48
    ["hdpi"]=72
    ["xhdpi"]=96
    ["xxhdpi"]=144
    ["xxxhdpi"]=192
)

for density in "${!ANDROID_SIZES[@]}"; do
    size=${ANDROID_SIZES[$density]}
    # Versión normal
    resize_icon "$ICON_SRC" \
        "${OUT_DIR}/android/mipmap-${density}/ic_launcher.png" \
        "$size"
    # Versión round (circular) — recorte circular con máscara
    convert "$ICON_SRC" \
        -resize "${size}x${size}" \
        -gravity center \
        -extent "${size}x${size}" \
        \( +clone -threshold -1 -negate \
           -fill white -draw "circle $((size/2)),$((size/2)) $((size/2)),0" \) \
        -alpha off \
        -compose copy_opacity \
        -composite \
        -background white -flatten \
        "${OUT_DIR}/android/mipmap-${density}/ic_launcher_round.png"
    log_ok "  mipmap-${density}: ic_launcher + ic_launcher_round (${size}px)"
done

# Google Play Store listing — 512x512
resize_icon "$ICON_SRC" "${OUT_DIR}/android/playstore/ic_launcher_512.png" 512
log_ok "  playstore/ic_launcher_512.png → Google Play listing"

# ──────────────────────────────────────────────
# 3. iOS — AppIcon.appiconset
# ──────────────────────────────────────────────
log_info "━━━ [3/4] iOS App Icons ━━━"

# iOS requiere fondo sólido (sin transparencia)
# Tamaños según Apple Human Interface Guidelines 2024
declare -A IOS_SIZES=(
    # iPhone
    ["icon-20@2x"]=40
    ["icon-20@3x"]=60
    ["icon-29@2x"]=58
    ["icon-29@3x"]=87
    ["icon-40@2x"]=80
    ["icon-40@3x"]=120
    ["icon-60@2x"]=120
    ["icon-60@3x"]=180
    # iPad
    ["icon-20"]=20
    ["icon-20-ipad@2x"]=40
    ["icon-29"]=29
    ["icon-29-ipad@2x"]=58
    ["icon-40"]=40
    ["icon-40-ipad@2x"]=80
    ["icon-76"]=76
    ["icon-76@2x"]=152
    ["icon-83.5@2x"]=167
    # App Store
    ["icon-1024"]=1024
)

for name in "${!IOS_SIZES[@]}"; do
    size=${IOS_SIZES[$name]}
    convert "$ICON_SRC" \
        -resize "${size}x${size}" \
        -gravity center \
        -background white \
        -flatten \
        -extent "${size}x${size}" \
        "${OUT_DIR}/ios/AppIcon.appiconset/${name}.png"
done
log_ok "  iOS: ${#IOS_SIZES[@]} tamaños generados en AppIcon.appiconset/"

# Contents.json para Xcode
cat > "${OUT_DIR}/ios/AppIcon.appiconset/Contents.json" << 'CONTENTS'
{
  "images": [
    {"idiom": "iphone", "scale": "2x", "size": "20x20",   "filename": "icon-20@2x.png"},
    {"idiom": "iphone", "scale": "3x", "size": "20x20",   "filename": "icon-20@3x.png"},
    {"idiom": "iphone", "scale": "2x", "size": "29x29",   "filename": "icon-29@2x.png"},
    {"idiom": "iphone", "scale": "3x", "size": "29x29",   "filename": "icon-29@3x.png"},
    {"idiom": "iphone", "scale": "2x", "size": "40x40",   "filename": "icon-40@2x.png"},
    {"idiom": "iphone", "scale": "3x", "size": "40x40",   "filename": "icon-40@3x.png"},
    {"idiom": "iphone", "scale": "2x", "size": "60x60",   "filename": "icon-60@2x.png"},
    {"idiom": "iphone", "scale": "3x", "size": "60x60",   "filename": "icon-60@3x.png"},
    {"idiom": "ipad",   "scale": "1x", "size": "20x20",   "filename": "icon-20.png"},
    {"idiom": "ipad",   "scale": "2x", "size": "20x20",   "filename": "icon-20-ipad@2x.png"},
    {"idiom": "ipad",   "scale": "1x", "size": "29x29",   "filename": "icon-29.png"},
    {"idiom": "ipad",   "scale": "2x", "size": "29x29",   "filename": "icon-29-ipad@2x.png"},
    {"idiom": "ipad",   "scale": "1x", "size": "40x40",   "filename": "icon-40.png"},
    {"idiom": "ipad",   "scale": "2x", "size": "40x40",   "filename": "icon-40-ipad@2x.png"},
    {"idiom": "ipad",   "scale": "1x", "size": "76x76",   "filename": "icon-76.png"},
    {"idiom": "ipad",   "scale": "2x", "size": "76x76",   "filename": "icon-76@2x.png"},
    {"idiom": "ipad",   "scale": "2x", "size": "83.5x83.5","filename": "icon-83.5@2x.png"},
    {"idiom": "ios-marketing", "scale": "1x", "size": "1024x1024", "filename": "icon-1024.png"}
  ],
  "info": {"author": "xcode", "version": 1}
}
CONTENTS
log_ok "  Contents.json generado para Xcode"

# ──────────────────────────────────────────────
# 4. SPLASH SCREENS
# ──────────────────────────────────────────────
if [[ -n "$SPLASH_SRC" ]]; then
    log_info "━━━ [4/4] Splash Screens ━━━"
    mkdir -p "${OUT_DIR}/splash"

    # Expo splash (usado en app.config.js → splash.image)
    # Recomendado: 1284x2778 (iPhone 15 Pro Max)
    convert "$SPLASH_SRC" \
        -resize 1284x2778 \
        -gravity center \
        -background white \
        -extent 1284x2778 \
        "${OUT_DIR}/splash/splash-expo.png"
    log_ok "  splash-expo.png (1284x2778, iPhone 15 Pro Max base)"

    # Android splash (API 12+)
    for res in "1080x1920" "720x1280" "480x800"; do
        w=${res%x*}; h=${res#*x}
        convert "$SPLASH_SRC" \
            -resize "${res}" \
            -gravity center \
            -background white \
            -extent "${res}" \
            "${OUT_DIR}/splash/splash-android-${w}x${h}.png"
        log_ok "  splash-android-${w}x${h}.png"
    done

    # Google Play Feature Graphic (obligatorio para publicar)
    convert "$SPLASH_SRC" \
        -resize 1024x500 \
        -gravity center \
        -background white \
        -extent 1024x500 \
        "${OUT_DIR}/android/playstore/feature_graphic.png"
    log_ok "  feature_graphic.png (1024x500, requerido Google Play)"
else
    log_warn "No se proporcionó splash. Omitiendo paso 4."
fi

# ──────────────────────────────────────────────
# RESUMEN FINAL
# ──────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Assets generados exitosamente para: ${APP_NAME}${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  📁 Directorio: ${OUT_DIR}/"
echo ""
echo -e "  ${BLUE}Próximos pasos:${NC}"
echo -e "  1. Copiar expo/icon.png          → apps/${APP_NAME}/assets/icon.png"
echo -e "  2. Copiar expo/adaptive-icon.png → apps/${APP_NAME}/assets/adaptive-icon.png"
echo -e "  3. Copiar splash/splash-expo.png → apps/${APP_NAME}/assets/splash.png"
echo -e "  4. Verificar app.config.js apunta a estos archivos"
echo ""
echo -e "  ${YELLOW}Verificar en app.config.js:${NC}"
cat << 'EOF'
  {
    "expo": {
      "icon": "./assets/icon.png",
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/adaptive-icon.png",
          "backgroundColor": "#FFFFFF"   ← ajustar por app
        }
      },
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
EOF
echo ""

# Listar archivos generados con tamaños
log_info "Archivos generados:"
find "${OUT_DIR}" -name "*.png" | sort | while read f; do
    dims=$(identify -format "%wx%h" "$f" 2>/dev/null || echo "???")
    size=$(du -h "$f" | cut -f1)
    printf "  %-60s %8s  %s\n" "$f" "$dims" "$size"
done
