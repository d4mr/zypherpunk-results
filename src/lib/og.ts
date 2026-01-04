import satori from 'satori';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';

// Font loading
let fontsLoaded = false;
let dmSansRegular: ArrayBuffer;
let dmSansMedium: ArrayBuffer;
let dmSansBold: ArrayBuffer;
let instrumentSerifRegular: ArrayBuffer;
let instrumentSerifItalic: ArrayBuffer;
let spaceMonoRegular: ArrayBuffer;
let spaceMonoBold: ArrayBuffer;

async function loadFonts() {
  if (fontsLoaded) return;
  
  const fontsDir = path.join(process.cwd(), 'src/assets/fonts');
  
  dmSansRegular = fs.readFileSync(path.join(fontsDir, 'DMSans-Regular.ttf'));
  dmSansMedium = fs.readFileSync(path.join(fontsDir, 'DMSans-Medium.ttf'));
  dmSansBold = fs.readFileSync(path.join(fontsDir, 'DMSans-Bold.ttf'));
  instrumentSerifRegular = fs.readFileSync(path.join(fontsDir, 'InstrumentSerif-Regular.ttf'));
  instrumentSerifItalic = fs.readFileSync(path.join(fontsDir, 'InstrumentSerif-Italic.ttf'));
  spaceMonoRegular = fs.readFileSync(path.join(fontsDir, 'SpaceMono-Regular.ttf'));
  spaceMonoBold = fs.readFileSync(path.join(fontsDir, 'SpaceMono-Bold.ttf'));
  
  fontsLoaded = true;
}

// Image cache to avoid re-fetching
const imageCache = new Map<string, string>();

// Fetch and optimize image to base64 data URI for satori
async function fetchAndOptimizeImage(url: string | null, size: number): Promise<string | null> {
  if (!url) return null;
  
  // Check cache
  const cacheKey = `${url}-${size}`;
  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  try {
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(5000) // 5s timeout
    });
    if (!response.ok) return null;
    
    const buffer = await response.arrayBuffer();
    
    // Resize and convert to PNG using sharp
    const optimized = await sharp(Buffer.from(buffer))
      .resize(size, size, { fit: 'cover' })
      .png({ quality: 80 })
      .toBuffer();
    
    // Convert to base64 data URI
    const base64 = `data:image/png;base64,${optimized.toString('base64')}`;
    
    // Cache it
    imageCache.set(cacheKey, base64);
    
    return base64;
  } catch (e) {
    console.warn(`Failed to fetch image: ${url}`);
    return null;
  }
}

interface OgImageOptions {
  title: string;
  subtitle?: string;
  badge?: string;
  stats?: Array<{ label: string; value: string; isGold?: boolean }>;
  faviconUrl?: string | null;
  avatars?: Array<{ url: string | null; name: string }>;
}

export async function generateOgImage(options: OgImageOptions): Promise<Uint8Array> {
  await loadFonts();
  
  const { title, subtitle, badge, stats, faviconUrl, avatars } = options;
  
  // Pre-fetch and optimize images
  const [favicon, ...avatarImages] = await Promise.all([
    fetchAndOptimizeImage(faviconUrl || null, 100),
    ...(avatars || []).slice(0, 4).map(a => fetchAndOptimizeImage(a.url, 56))
  ]);
  
  // Dynamic title sizing - much larger
  const titleLength = title.length;
  const fontSize = titleLength > 50 ? 52 : titleLength > 35 ? 64 : titleLength > 25 ? 80 : 96;

  const element = React.createElement(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        background: '#050505',
        display: 'flex',
        position: 'relative',
        fontFamily: 'DM Sans',
      },
    },
    // Background gradient - teal glow top left
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(0, 212, 170, 0.25) 0%, transparent 60%)',
        display: 'flex',
      },
    }),
    // Gold glow bottom right
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: '-150px',
        right: '-100px',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(245, 166, 35, 0.15) 0%, transparent 60%)',
        display: 'flex',
      },
    }),
    // Main content container
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 64px',
          width: '100%',
          height: '100%',
          position: 'relative',
        },
      },
      // Top row: Badge
      badge && React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '28px',
          },
        },
        React.createElement('div', {
          style: {
            width: '10px',
            height: '10px',
            background: '#00d4aa',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(0, 212, 170, 0.8)',
          },
        }),
        React.createElement('span', {
          style: {
            fontFamily: 'Space Mono',
            fontSize: '18px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: '#00d4aa',
          },
        }, badge)
      ),
      // Middle: Favicon + Title row
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px',
            marginBottom: subtitle ? '16px' : '32px',
          },
        },
        // Favicon
        favicon && React.createElement('img', {
          src: favicon,
          style: {
            width: '100px',
            height: '100px',
            borderRadius: '20px',
            border: '2px solid #252525',
            objectFit: 'cover',
            flexShrink: 0,
          },
        }),
        // Title
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            },
          },
          React.createElement('span', {
            style: {
              fontFamily: 'Instrument Serif',
              fontSize: `${fontSize}px`,
              fontWeight: 400,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
            },
          }, title)
        )
      ),
      // Subtitle/tagline
      subtitle && React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            marginBottom: '32px',
            maxWidth: '900px',
          },
        },
        React.createElement('span', {
          style: {
            fontFamily: 'DM Sans',
            fontSize: '36px',
            color: '#a3a3a3',
            lineHeight: 1.3,
          },
        }, subtitle.length > 90 ? subtitle.slice(0, 90) + '...' : subtitle)
      ),
      // Spacer
      React.createElement('div', { style: { flex: 1, display: 'flex' } }),
      // Bottom row: Avatars + Stats
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            width: '100%',
          },
        },
        // Avatars
        avatars && avatars.length > 0 ? React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
            },
          },
          ...avatars.slice(0, 4).map((avatar, i) =>
            avatarImages[i] ? React.createElement('img', {
              key: i,
              src: avatarImages[i]!,
              style: {
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: '3px solid #050505',
                marginLeft: i > 0 ? '-16px' : '0',
                objectFit: 'cover',
              },
            }) : React.createElement(
              'div',
              {
                key: i,
                style: {
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '3px solid #050505',
                  marginLeft: i > 0 ? '-16px' : '0',
                  background: '#252525',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#737373',
                  fontSize: '20px',
                  fontWeight: 500,
                },
              },
              avatar.name.charAt(0).toUpperCase()
            )
          )
        ) : React.createElement('div', { style: { display: 'flex' } }),
        // Stats
        stats && stats.length > 0 && React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              gap: '48px',
            },
          },
          ...stats.map((stat, i) =>
            React.createElement(
              'div',
              {
                key: i,
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '4px',
                },
              },
              React.createElement('span', {
                style: {
                  fontFamily: 'Space Mono',
                  fontSize: '48px',
                  fontWeight: 700,
                  color: stat.isGold ? '#f5a623' : '#ffffff',
                  lineHeight: 1,
                },
              }, stat.value),
              React.createElement('span', {
                style: {
                  fontFamily: 'Space Mono',
                  fontSize: '14px',
                  color: '#737373',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                },
              }, stat.label)
            )
          )
        )
      )
    ),
    // Domain branding - top right
    React.createElement(
      'div',
      {
        style: {
          position: 'absolute',
          top: '56px',
          right: '64px',
          display: 'flex',
          alignItems: 'center',
        },
      },
      React.createElement('span', {
        style: {
          fontFamily: 'Space Mono',
          fontSize: '24px',
          fontWeight: 400,
          color: '#404040',
        },
      }, 'zypherpunk.d4mr.com')
    ),
    // Left accent bar
    React.createElement('div', {
      style: {
        position: 'absolute',
        left: '0',
        top: '56px',
        bottom: '56px',
        width: '4px',
        background: 'linear-gradient(to bottom, #00d4aa, #00d4aa 30%, transparent)',
        display: 'flex',
      },
    })
  );

  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'DM Sans',
        data: dmSansRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'DM Sans',
        data: dmSansMedium,
        weight: 500,
        style: 'normal',
      },
      {
        name: 'DM Sans',
        data: dmSansBold,
        weight: 700,
        style: 'normal',
      },
      {
        name: 'Instrument Serif',
        data: instrumentSerifRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Instrument Serif',
        data: instrumentSerifItalic,
        weight: 400,
        style: 'italic',
      },
      {
        name: 'Space Mono',
        data: spaceMonoRegular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Space Mono',
        data: spaceMonoBold,
        weight: 700,
        style: 'normal',
      },
    ],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Uint8Array(png);
}
