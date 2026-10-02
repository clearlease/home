// Imports the canvas images (downloaded /_blob/<id> files) into public/media,
// resized for their largest on-page size at 2x and converted to WebP.
// Usage: node scripts/import-media.mjs <dir-with-downloaded-blobs>
import sharp from 'sharp';
import { readdirSync, copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { MEDIA } from '../src/dc/media.mjs';

if (process.argv[1] && process.argv[1].endsWith('import-media.mjs')) {
  const src = process.argv[2];
  const out = 'public/media';
  mkdirSync(out, { recursive: true });
  for (const file of readdirSync(src)) {
    const id = file.split('.')[0];
    const m = MEDIA[id];
    if (!m) continue;
    if (m.svg) { copyFileSync(join(src, file), join(out, m.name + '.svg')); console.log('svg ', m.name); continue; }
    const info = await sharp(join(src, file)).resize({ width: m.width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(join(out, m.name + '.webp'));
    console.log('webp', m.name, info.width + 'x' + info.height, Math.round(info.size / 1024) + ' KB');
  }
}
