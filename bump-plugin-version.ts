import fs from 'fs-extra';

console.log('process.argv', process.argv);

function bumpVersion(manifestPath, destPath, version) {
  const contentText = fs.readFileSync(manifestPath, 'utf8');
  const content = JSON.parse(contentText);
  content.version = version;
  fs.writeFileSync(destPath, JSON.stringify(content, null, '\t'), 'utf8');
}

if (process.argv.length > 2) {
  bumpVersion('src/manifest.json', 'src/manifest.json', process.argv[2]);
}
