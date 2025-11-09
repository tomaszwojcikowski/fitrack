#!/bin/bash
# Create a simple SVG icon
cat > icon.svg << 'SVG'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#3b82f6" rx="80"/>
  <path d="M 150 180 L 150 332 L 200 332 L 200 256 L 312 256 L 312 332 L 362 332 L 362 180 L 312 180 L 312 210 L 200 210 L 200 180 Z" fill="white" stroke="white" stroke-width="8"/>
  <circle cx="256" cy="380" r="30" fill="white"/>
</svg>
SVG

# Try to use ImageMagick if available
if command -v convert &> /dev/null; then
  convert icon.svg -resize 192x192 icon-192.png
  convert icon.svg -resize 512x512 icon-512.png
  echo "Icons created with ImageMagick"
else
  # Fallback: copy SVG as placeholders
  cp icon.svg icon-192.png 2>/dev/null || true
  cp icon.svg icon-512.png 2>/dev/null || true
  echo "ImageMagick not available, created SVG placeholder"
fi
