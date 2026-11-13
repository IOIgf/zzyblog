#!/usr/bin/env bash
set -euo pipefail

# Install Dart Sass 1.108.0 native binary (supports --embedded protocol)
# Downloads from GitHub releases, extracts to ~/bin

SASS_VERSION="1.108.0"
SASS_TAR="dart-sass-${SASS_VERSION}-linux-x64.tar.gz"
SASS_URL="https://github.com/sass/dart-sass/releases/download/${SASS_VERSION}/${SASS_TAR}"
# Fallback mirrors
MIRRORS=(
  "https://gh-proxy.com/${SASS_URL}"
  "https://ghproxy.net/${SASS_URL}"
  "https://mirror.ghproxy.com/${SASS_URL}"
)

INSTALL_DIR="${HOME}/bin"
mkdir -p "${INSTALL_DIR}"
export PATH="${INSTALL_DIR}:${PATH}"

echo "[install-dart-sass] Installing Dart Sass ${SASS_VERSION}..."

# Check if already installed with correct version
if command -v sass >/dev/null 2>&1; then
  CURRENT_VERSION=$(sass --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
  if [ "$CURRENT_VERSION" = "$SASS_VERSION" ]; then
    echo "[install-dart-sass] Dart Sass ${SASS_VERSION} already installed, skipping."
    exit 0
  fi
  echo "[install-dart-sass] Found Dart Sass ${CURRENT_VERSION}, replacing with ${SASS_VERSION}."
fi

# Download Dart Sass tar.gz
cd /tmp
for MIRROR in "${MIRRORS[@]}"; do
  echo "[install-dart-sass] Trying ${MIRROR}..."
  if wget -q --timeout=30 --tries=2 -O "${SASS_TAR}" "${MIRROR}"; then
    echo "[install-dart-sass] Downloaded from ${MIRROR}"
    break
  fi
done

if [ ! -f "${SASS_TAR}" ]; then
  echo "[install-dart-sass] ERROR: Failed to download Dart Sass from all mirrors" >&2
  exit 1
fi

# Extract sass binary
tar -xzf "${SASS_TAR}" dart-sass/sass
chmod +x dart-sass/sass
mv dart-sass/sass "${INSTALL_DIR}/sass"
rm -rf dart-sass

# Verify --embedded support
echo "[install-dart-sass] Testing --embedded protocol..."
if printf 'a{color:red}' | "${INSTALL_DIR}/sass" --embedded 2>&1 | grep -q 'a{color:red}'; then
  echo "[install-dart-sass] --embedded protocol works."
else
  echo "[install-dart-sass] WARNING: --embedded test failed, but continuing..."
fi

# Version
"${INSTALL_DIR}/sass" --version
echo "[install-dart-sass] Dart Sass ${SASS_VERSION} installed successfully to ${INSTALL_DIR}."