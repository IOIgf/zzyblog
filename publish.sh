#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
node tools/publish.js --once
