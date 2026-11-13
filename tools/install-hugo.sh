#!/usr/bin/env bash
set -euo pipefail

# Install Hugo 0.169.0 extended on Cloudflare Pages (no sudo/apt needed)
# Downloads tar.gz from GitHub Release, extracts binary to ~/bin

HUGO_VERSION="0.169.0"
HUGO_TAR="hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz"
HUGO_URL="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${HUGO_TAR}"
# Fallback mirrors for China / GitHub rate limits
MIRRORS=(
  "https://gh-proxy.com/${HUGO_URL}"
  "https://ghproxy.net/${HUGO_URL}"
  "https://mirror.ghproxy.com/${HUGO_URL}"
)

INSTALL_DIR="${HOME}/bin"
mkdir -p "${INSTALL_DIR}"
export PATH="${INSTALL_DIR}:${PATH}"

echo "[install-hugo] Installing Hugo ${HUGO_VERSION} extended..."

# Check if already installed with correct version
if command -v hugo >/dev/null 2>&1; then
  CURRENT_VERSION=$(hugo version 2>/dev/null | grep -oE 'v?[0-9]+\.[0-9]+\.[0-9]+' | head -1 | sed 's/^v//')
  if [ "$CURRENT_VERSION" = "$HUGO_VERSION" ]; then
    echo "[install-hugo] Hugo ${HUGO_VERSION} already installed, skipping."
    exit 0
  fi
  echo "[install-hugo] Found Hugo ${CURRENT_VERSION}, replacing with ${HUGO_VERSION}."
fi

# Download Hugo tar.gz
cd /tmp
for MIRROR in "${MIRRORS[@]}"; do
  echo "[install-hugo] Trying ${MIRROR}..."
  if wget -q --timeout=30 --tries=2 -O "${HUGO_TAR}" "${MIRROR}"; then
    echo "[install-hugo] Downloaded from ${MIRROR}"
    break
  fi
done

if [ ! -f "${HUGO_TAR}" ]; then
  echo "[install-hugo] ERROR: Failed to download Hugo from all mirrors" >&2
  exit 1
fi

# Extract hugo binary
tar -xzf "${HUGO_TAR}" hugo
chmod +x hugo
mv hugo "${INSTALL_DIR}/hugo"

# Verify
echo "[install-hugo] Hugo version:"
"${INSTALL_DIR}/hugo" version
echo "[install-hugo] Hugo ${HUGO_VERSION} installed successfully to ${INSTALL_DIR}."