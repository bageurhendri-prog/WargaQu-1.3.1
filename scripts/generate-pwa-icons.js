import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePNG(width, height, isMaskable = false) {
  // Build raw scanlines (each row: 1 byte filter 0 + width * 4 bytes RGBA)
  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const safeRadius = (Math.min(width, height) / 2) * (isMaskable ? 0.72 : 0.88);
  const cornerRadius = isMaskable ? 0 : width * 0.22; // rounded squircle for standard, full bleed for maskable

  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      // Check rounded corner clip if not maskable
      let inCard = true;
      if (!isMaskable) {
        const dx = Math.max(0, Math.abs(x - cx) - (cx - cornerRadius));
        const dy = Math.max(0, Math.abs(y - cy) - (cy - cornerRadius));
        if (dx * dx + dy * dy > cornerRadius * cornerRadius) {
          inCard = false;
        }
      }

      if (!inCard) {
        // Transparent
        raw[offset++] = 0;
        raw[offset++] = 0;
        raw[offset++] = 0;
        raw[offset++] = 0;
        continue;
      }

      // Background gradient (Dark Stone to Deep Teal)
      const gradT = (x + y) / (width + height);
      let r = Math.round(15 * (1 - gradT) + 4 * gradT);
      let g = Math.round(118 * (1 - gradT) + 47 * gradT);
      let b = Math.round(110 * (1 - gradT) + 46 * gradT);
      let a = 255;

      // Distance from center
      const distFromCenter = Math.hypot(x - cx, y - cy);

      // Outer ring
      const ringOuter = safeRadius * 0.95;
      const ringInner = safeRadius * 0.78;
      if (distFromCenter <= ringOuter && distFromCenter >= ringInner) {
        // Glowing teal/emerald ring
        r = 45; g = 212; b = 191; a = 255;
      }

      // 'Q' Center Circle
      const qRadius = safeRadius * 0.52;
      const qInnerRadius = safeRadius * 0.32;
      if (distFromCenter <= qRadius && distFromCenter >= qInnerRadius) {
        // Solid clean white letter Q circle
        r = 255; g = 255; b = 255; a = 255;
      }

      // 'Q' Tail segment (bottom right diagonal line)
      const qTailX = cx + safeRadius * 0.26;
      const qTailY = cy + safeRadius * 0.26;
      const tailDist = Math.hypot(x - qTailX, y - qTailY);
      if (tailDist <= safeRadius * 0.16 && x > cx && y > cy) {
        r = 245; g = 158; b = 11; a = 255; // Gold amber tail for WargaQu
      }

      // Top Community Dot (Representing PaguyubanQu people connected at top)
      const topDotY = cy - safeRadius * 0.62;
      if (Math.hypot(x - cx, y - topDotY) <= safeRadius * 0.14) {
        r = 255; g = 255; b = 255; a = 255;
      }

      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const idatData = zlib.deflateSync(raw, { level: 9 });
  const idat = makeChunk('IDAT', idatData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idat, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate PNGs
console.log('Generating pwa-192x192.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));

console.log('Generating pwa-512x512.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));

console.log('Generating pwa-maskable-512x512.png...');
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));

console.log('Generating apple-touch-icon.png (180x180)...');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));

// 2. Favicon .ico (minimal valid 32x32 ico containing PNG)
const png32 = generatePNG(32, 32, false);
const icoHeader = Buffer.alloc(6 + 16);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // icon type
icoHeader.writeUInt16LE(1, 4); // 1 image
// Directory entry
icoHeader[6] = 32; // width
icoHeader[7] = 32; // height
icoHeader[8] = 0;  // palette count
icoHeader[9] = 0;  // reserved
icoHeader.writeUInt16LE(1, 10); // color planes
icoHeader.writeUInt16LE(32, 12); // bpp
icoHeader.writeUInt32LE(png32.length, 14); // image size
icoHeader.writeUInt32LE(22, 18); // offset to data
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), Buffer.concat([icoHeader, png32]));

// 3. icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F766E"/>
      <stop offset="50%" stop-color="#0D9488"/>
      <stop offset="100%" stop-color="#042F2E"/>
    </linearGradient>
    <linearGradient id="qGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5EEAD4"/>
      <stop offset="100%" stop-color="#2DD4BF"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <g filter="url(#shadow)">
    <!-- Outer Orbit Circle -->
    <circle cx="256" cy="256" r="160" fill="none" stroke="#2DD4BF" stroke-width="16" opacity="0.6" stroke-dasharray="24 16"/>
    <!-- Top Citizen Bubble (Paguyuban) -->
    <circle cx="256" cy="116" r="38" fill="#FFFFFF"/>
    <path d="M216 160 C216 140, 296 140, 296 160" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round"/>
    <!-- Left Citizen Bubble -->
    <circle cx="116" cy="256" r="32" fill="#5EEAD4"/>
    <!-- Right Citizen Bubble -->
    <circle cx="396" cy="256" r="32" fill="#5EEAD4"/>
    <!-- Bottom Citizen Bubble -->
    <circle cx="256" cy="396" r="32" fill="#5EEAD4"/>
    <!-- Main Center 'Q' Shield / Bubble -->
    <circle cx="256" cy="256" r="82" fill="none" stroke="#FFFFFF" stroke-width="26"/>
    <path d="M296 296 L340 340" stroke="#F59E0B" stroke-width="28" stroke-linecap="round"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('All PWA icons generated successfully.');
