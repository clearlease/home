// Generates public/og-image.png (1200x630): the clearlea.se logo on the brand surface.
import sharp from 'sharp';
const logo = await sharp('public/media/clearlease-logo.svg', { density: 600 }).resize({ width: 680 }).png().toBuffer();
const meta = await sharp(logo).metadata();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: '#F7F7F7' } })
  .composite([
    { input: logo, left: Math.round((1200 - meta.width) / 2), top: Math.round((630 - meta.height) / 2) },
    { input: Buffer.from('<svg width="1200" height="12"><rect width="1200" height="12" fill="#13293d"/></svg>'), left: 0, top: 618 },
  ])
  .png()
  .toFile('public/og-image.png');
console.log('public/og-image.png', meta.width + 'x' + meta.height);
