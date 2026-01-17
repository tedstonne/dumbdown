#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [16, 48, 128];
const browsers = ['chrome', 'firefox'];

async function generateIcons() {
  const srcDir = path.join(__dirname, '..', 'src');
  const basePng = path.join(srcDir, 'icon-base.png');
  const activePng = path.join(srcDir, 'icon-active.png');

  // Read the base and active PNGs (512x512)
  const baseBuffer = await sharp(basePng).png().toBuffer();
  const activeBuffer = await sharp(activePng).png().toBuffer();

  for (const browser of browsers) {
    const iconsDir = path.join(srcDir, browser, 'icons');

    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }

    for (const size of sizes) {
      // Regular icon
      const pngPath = path.join(iconsDir, `icon${size}.png`);
      await sharp(baseBuffer)
        .resize(size, size)
        .png()
        .toFile(pngPath);
      console.log(`Created ${pngPath}`);

      // Active/highlighted icon
      const activePath = path.join(iconsDir, `icon${size}-active.png`);
      await sharp(activeBuffer)
        .resize(size, size)
        .png()
        .toFile(activePath);
      console.log(`Created ${activePath}`);
    }
  }

  console.log('\n⚗ Icons created from base PNG!');
}

generateIcons().catch(console.error);
