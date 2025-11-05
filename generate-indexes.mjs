import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('./docs/senior_growth');

function getTitleFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Match the first line starting with one or more #
    const match = content.match(/^#{1,6}\s*(.+)/m);
    if (match && match[1]) {
      return match[1].trim();
    }

    // fallback: first non-empty line, stripped of any leading # and spaces
    const firstLine = content.split('\n').find(line => line.trim().length > 0);
    return firstLine
      ? firstLine.trim().replace(/^#{1,6}\s*/, '').trim()
      : path.basename(filePath);
  } catch {
    return path.basename(filePath);
  }
}

function generateOverview(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const subfolders = items.filter(i => i.isDirectory());
  const files = items.filter(
    i => i.isFile() && i.name.endsWith('.md') && i.name !== 'index.md'
  );

  let content = `# ${path.basename(dir)}\n\n`;

  if (files.length > 0) {
    content += `## Notes\n\n`;
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      const displayName = getTitleFromFile(filePath);

      // Properly encode filenames for markdown links
      const encodedFile = encodeURIComponent(file.name)
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');

      content += `- [${displayName}](./${encodedFile})\n`;
    }
    content += `\n`;
  }

  if (subfolders.length > 0) {
    content += `## Subfolders\n\n`;
    for (const folder of subfolders) {
      if (folder.name.startsWith('.')) continue;
      const folderName = folder.name;
      content += `- [${folderName}](./${folderName}/)\n`;
    }
  }

  fs.writeFileSync(path.join(dir, 'index.md'), content);
}

function traverse(dir) {
  generateOverview(dir);
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory() && !item.name.startsWith('.')) {
      traverse(path.join(dir, item.name));
    }
  }
}

traverse(rootDir);
console.log(`✅ index.md files generated successfully under ${rootDir}`);
