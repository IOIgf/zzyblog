#!/usr/bin/env bash
set -euo pipefail

# Install Dart Sass 1.108.0 native binary (supports --embedded protocol)
# The release tarball contains a dart-sass/ directory with sass wrapper + src/dart

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

# Extract entire dart-sass directory
tar -xzf "${SASS_TAR}"
# The tarball extracts to dart-sass/
chmod +x dart-sass/sass
chmod +x dart-sass/src/dart
# Move the whole directory to ~/bin/dart-sass
rm -rf "${INSTALL_DIR}/dart-sass"
mv dart-sass "${INSTALL_DIR}/"
# Create a wrapper script in ~/bin/sass that points to the dart-sass/sass
cat > "${INSTALL_DIR}/sass" <<'WRAPPER'
#!/usr/bin/env bash
exec "$(dirname "$0")/dart-sass/sass" "$@"
WRAPPER
chmod +x "${INSTALL_DIR}/sass"

# Verify --embedded support (just check exit code, not output content)
echo "[install-dart-sass] Testing --embedded protocol..."
if printf 'a{color:red}' | "${INSTALL_DIR}/sass" --embedded >/dev/null 2>&1; then
  echo "[install-dart-sass] --embedded protocol works."
else
  echo "[install-dart-sass] ERROR: --embedded protocol test failed" >&2
  exit 1
fi

# Version
"${INSTALL_DIR}/sass" --version
echo "[install-dart-sass] Dart Sass ${SASS_VERSION} installed successfully to ${INSTALL_DIR}."