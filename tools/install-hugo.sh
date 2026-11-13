#!/usr/bin/env bash
set -euo pipefail

# Install Hugo 0.169.0 extended on Cloudflare Pages (Ubuntu-based)
# Cloudflare's build image has Hugo 0.147.x which is too old for FixIt (needs >= 0.166.0)

HUGO_VERSION="0.169.0"
HUGO_DEB="hugo_extended_${HUGO_VERSION}_linux-amd64.deb"
HUGO_URL="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${HUGO_DEB}"
# Fallback mirrors for China / GitHub rate limits
MIRRORS=(
  "https://gh-proxy.com/${HUGO_URL}"
  "https://ghproxy.net/${HUGO_URL}"
  "https://mirror.ghproxy.com/${HUGO_URL}"
)

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

# Install libsass1 dependency (required by Hugo extended)
apt-get update -qq && apt-get install -y -qq libsass1 >/dev/null 2>&1

# Download Hugo deb
cd /tmp
for MIRROR in "${MIRRORS[@]}"; do
  echo "[install-hugo] Trying ${MIRROR}..."
  if wget -q --timeout=30 --tries=2 -O "${HUGO_DEB}" "${MIRROR}"; then
    echo "[install-hugo] Downloaded from ${MIRROR}"
    break
  fi
done

if [ ! -f "${HUGO_DEB}" ]; then
  echo "[install-hugo] ERROR: Failed to download Hugo from all mirrors" >&2
  exit 1
fi

# Install
dpkg -i "${HUGO_DEB}" >/dev/null 2>&1

# Verify
hugo version
echo "[install-hugo] Hugo ${HUGO_VERSION} installed successfully."