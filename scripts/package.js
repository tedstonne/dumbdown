#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const browsers = process.argv[2]
  ? [process.argv[2]]
  : ['chrome', 'firefox'];

const buildDir = path.join(__dirname, '..', 'build');

async function packageBrowser(browser) {
  const browserBuildDir = path.join(buildDir, browser);
  const manifestPath = path.join(browserBuildDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Build not found for ${browser}. Run build first.`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const version = manifest.version;

  const extension = browser === 'firefox' ? 'xpi' : 'zip';
  const outputPath = path.join(buildDir, `dumbdown-${browser}-v${version}.${extension}`);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Packaged ${browser}: ${outputPath} (${archive.pointer()} bytes)`);
      resolve(outputPath);
    });

    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(browserBuildDir, false);
    archive.finalize();
  });
}

Promise.all(browsers.map(packageBrowser))
  .then(() => console.log('Packaging complete!'))
  .catch((err) => {
    console.error('Packaging failed:', err);
    process.exit(1);
  });
