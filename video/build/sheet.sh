#!/bin/bash
export PW_PATH=/opt/node-tools/node_modules/playwright/index.js
# usage: build/sheet.sh <chapterId>  -> out/sheet_<id>_N.jpg (2x3 contact sheets)
cd "$(dirname "$0")/.."; rm -rf out/snap/$1; node build/snap.mjs $1 out/snap/$1 || exit 1
rm -f out/sheet_$1_*.jpg
ffmpeg -v error -y -pattern_type glob -i "out/snap/$1/*.jpg" -vf "tile=2x3:padding=6:color=white" -q:v 4 out/sheet_$1_%d.jpg
ls out/sheet_$1_*.jpg
