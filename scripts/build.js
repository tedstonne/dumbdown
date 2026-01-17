#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const browsers = process.argv[2]
  ? [process.argv[2]]
  : ['chrome', 'firefox'];

const srcDir = path.join(__dirname, '..', 'src');
const buildDir = path.join(__dirname, '..', 'build');

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function buildBrowser(browser) {
  const browserBuildDir = path.join(buildDir, browser);
  const browserSrcDir = path.join(srcDir, browser);

  // Clean and create build directory
  if (fs.existsSync(browserBuildDir)) {
    fs.rmSync(browserBuildDir, { recursive: true });
  }
  fs.mkdirSync(browserBuildDir, { recursive: true });

  // Copy manifest.json
  fs.copyFileSync(
    path.join(browserSrcDir, 'manifest.json'),
    path.join(browserBuildDir, 'manifest.json')
  );

  // Copy icons
  const iconsDir = path.join(browserSrcDir, 'icons');
  const buildIconsDir = path.join(browserBuildDir, 'icons');
  if (fs.existsSync(iconsDir)) {
    copyDir(iconsDir, buildIconsDir);
  }

  // Copy options HTML/CSS
  const optionsDir = path.join(browserBuildDir, 'options');
  fs.mkdirSync(optionsDir, { recursive: true });
  fs.copyFileSync(
    path.join(browserSrcDir, 'options', 'options.html'),
    path.join(optionsDir, 'options.html')
  );
  fs.copyFileSync(
    path.join(browserSrcDir, 'options', 'options.css'),
    path.join(optionsDir, 'options.css')
  );
  fs.copyFileSync(
    path.join(browserSrcDir, 'options', 'options.js'),
    path.join(optionsDir, 'options.js')
  );

  // Bundle background.js with common modules
  await esbuild.build({
    entryPoints: [path.join(browserSrcDir, 'background.js')],
    bundle: true,
    outfile: path.join(browserBuildDir, 'background.js'),
    format: 'esm',
    platform: 'browser',
    target: ['chrome109', 'firefox109'],
  });

  console.log(`Built ${browser} extension in ${browserBuildDir}`);
}

// Build all specified browsers
Promise.all(browsers.map(buildBrowser))
  .then(() => console.log('Build complete!'))
  .catch((err) => {
    console.error('Build failed:', err);
    process.exit(1);
  });
