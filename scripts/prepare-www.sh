#!/usr/bin/env bash
# Web dosyalarını Android paketi için www/ klasörüne kopyalar.
set -euo pipefail
rm -rf www && mkdir -p www
cp -r index.html styles.css app.js manifest.webmanifest icons www/
cp node_modules/@capacitor/core/dist/capacitor.js www/capacitor.js
# Capacitor çekirdeğini app.js'den önce yükle
sed -i 's#<script src="app.js"></script>#<script src="capacitor.js"></script>\n<script src="app.js"></script>#' www/index.html
grep -q 'capacitor.js' www/index.html
