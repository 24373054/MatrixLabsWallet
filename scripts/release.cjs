const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read current version from manifest.json
const manifestPath = path.join(__dirname, '../manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const currentVersion = manifest.version;

console.log(`Current version: ${currentVersion}`);

// Parse version
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Ask for version bump type
const args = process.argv.slice(2);
const bumpType = args[0] || 'patch';

let newVersion;
switch (bumpType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
  default:
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

console.log(`New version: ${newVersion}`);

// Update manifest.json
manifest.version = newVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log('✓ Updated manifest.json');

// Build
console.log('Building...');
execSync('npm run build', { stdio: 'inherit' });
console.log('✓ Build completed');

// Create ZIP
const zipName = `matrixlabs-wallet-v${newVersion}.zip`;
console.log(`Creating ${zipName}...`);
execSync(`powershell -Command "Compress-Archive -Path dist\\* -DestinationPath ${zipName} -Force"`, { stdio: 'inherit' });
console.log(`✓ Created ${zipName}`);

console.log('\n🎉 Release package ready!');
console.log(`\nNext steps:`);
console.log(`1. Upload ${zipName} to Chrome Web Store`);
console.log(`2. Update release notes`);
console.log(`3. Commit and push to GitHub:`);
console.log(`   git add .`);
console.log(`   git commit -m "Release v${newVersion}"`);
console.log(`   git tag v${newVersion}`);
console.log(`   git push origin main --tags`);
