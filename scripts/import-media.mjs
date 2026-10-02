// Imports the canvas images (downloaded /_blob/<id> files) into public/media,
// resized for their largest on-page size at 2x and converted to WebP.
// Usage: node scripts/import-media.mjs <dir-with-downloaded-blobs>
import sharp from 'sharp';
import { readdirSync, copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export const MEDIA = {
  '3fe7a8b82ce8052f386ce3a43a0a6a77': { name: 'clearlease-logo', svg: true },
  'ff00bcf1c8b07d9db211f358a6a9ad2e': { name: 'hieronymus-deutsch', width: 720 },
  '69728cde2ac7a3121319c2ea4a90576c': { name: 'gruender-clearlease', width: 1600 },
  '54dd836b22821d276a343c04bddce646': { name: 'vortrag-handelsimmobilien-kongress', width: 1280 },
  'eb8782b39769d456ca7f4f68bc673c4d': { name: 'logo-garbe', width: 360 },
  'e6908b7065227635261e9f638742d54e': { name: 'logo-zia-innovation-2026', width: 320 },
  'a2503e88d93dd8ab06c79621c25f6a45': { name: 'logo-german-proptech-initiative', width: 260 },
  '900f377862b89424ab310658c99bc652': { name: 'logo-ki-park', width: 320 },
  'bfc3584943b9f4d161695d905351bd7f': { name: 'logo-handelsimmobilien-kongress', width: 320 },
  '0033c8c59c88f27ecb24ffeda8aefb6a': { name: 'logo-ai-nation', width: 200 },
  '9d0dae53408e5e04699033989c4e9ae0': { name: 'badge-dsgvo', width: 180 },
};
export const mediaPath = (id) => {
  const m = MEDIA[id];
  if (!m) throw new Error(`Unknown canvas image ${id}: add it to scripts/import-media.mjs`);
  return `/media/${m.name}.${m.svg ? 'svg' : 'webp'}`;
};

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
