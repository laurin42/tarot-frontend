import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Buffer from 'buffer';

// Get the current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

// Konfiguration
const config = {
  width: 2048,
  height: 4096,
  backgroundColor: '#111827',  // Dunkelblauer Hintergrund
  accentColor: '#8B5CF6',      // Lila Akzentfarbe
  glowColor: '#8B5CF6',        // Lila für den Glow
  glowOpacity: 0.4,            // Stärke des Glows (reduziert für klareren Effekt)
  glowRadius: 0.35,            // Radius des Glow-Effekts (kleiner für weniger Unschärfe)
  blurAmount: 40,              // Reduzierter Blur für klarere Kanten
  outputDir: path.resolve(__dirname, '../assets'),
  filename: 'splash.png'
};

// Hilfsfunktion zum Parsen von Hex-Farben zu RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

async function createSplashScreen() {
  try {
    // Sicherstellen, dass das Ausgabeverzeichnis existiert
    await fs.ensureDir(config.outputDir);

    // Erstelle den Hintergrund mit der Basis-Farbe
    const baseBuffer = await sharp({
      create: {
        width: config.width,
        height: config.height,
        channels: 4,
        background: {
          r: hexToRgb(config.backgroundColor).r,
          g: hexToRgb(config.backgroundColor).g,
          b: hexToRgb(config.backgroundColor).b,
          alpha: 1
        }
      }
    }).png().toBuffer();

    // Erstelle einen subtileren vertikalen Gradienten
    const gradientSvg = `
      <svg width="${config.width}" height="${config.height}">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${config.backgroundColor}" stop-opacity="1" />
            <stop offset="40%" stop-color="${config.accentColor}" stop-opacity="0.05" />
            <stop offset="60%" stop-color="${config.accentColor}" stop-opacity="0.05" />
            <stop offset="100%" stop-color="${config.backgroundColor}" stop-opacity="1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>
    `;

    const gradientBuffer = await sharp(Buffer.from(gradientSvg))
      .resize(config.width, config.height)
      .png()
      .toBuffer();

    // Erstelle einen präziseren Glow-Effekt mit schärferen Kanten
    // Verwendet einen kleineren Radius und höhere Intensität im Zentrum
    const glowSvg = `
      <svg width="${config.width}" height="${config.height}">
        <defs>
          <radialGradient id="glow" cx="0.5" cy="0.5" r="${config.glowRadius}">
            <stop offset="0%" stop-color="${config.glowColor}" stop-opacity="${config.glowOpacity * 1.5}" />
            <stop offset="50%" stop-color="${config.glowColor}" stop-opacity="${config.glowOpacity * 0.7}" />
            <stop offset="80%" stop-color="${config.glowColor}" stop-opacity="${config.glowOpacity * 0.3}" />
            <stop offset="100%" stop-color="${config.glowColor}" stop-opacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="${config.width / 2}" cy="${config.height / 2}" rx="${config.width / 4}" ry="${config.width / 4}" fill="url(#glow)" />
      </svg>
    `;

    // Reduzierter Blur für schärfere Glow-Kanten
    const glowBuffer = await sharp(Buffer.from(glowSvg))
      .resize(config.width, config.height)
      .blur(config.blurAmount)  // Weniger Blur für schärfere Kanten
      .png()
      .toBuffer();

    // Optional: Füge eine leicht sichtbare geometrische Form in der Mitte hinzu
    const centerShapeSvg = `
      <svg width="${config.width}" height="${config.height}">
        <circle 
          cx="${config.width / 2}" 
          cy="${config.height / 2}" 
          r="${config.width / 12}" 
          fill="none" 
          stroke="${config.accentColor}" 
          stroke-width="2" 
          stroke-opacity="0.4"
        />
      </svg>
    `;

    const centerShapeBuffer = await sharp(Buffer.from(centerShapeSvg))
      .resize(config.width, config.height)
      .png()
      .toBuffer();

    // Kombiniere alle Ebenen
    const finalImage = await sharp(baseBuffer)
      .composite([
        { input: gradientBuffer, blend: 'over' },
        { input: glowBuffer, blend: 'screen' },
        { input: centerShapeBuffer, blend: 'over' }
      ])
      .png()
      .toBuffer();

    // Speichern des Ergebnisses
    const outputPath = path.join(config.outputDir, config.filename);
    await fs.writeFile(outputPath, finalImage);

    console.log(`✅ Splash screen saved to: ${outputPath}`);
    console.log(`📱 Resolution: ${config.width}x${config.height}px`);

    return outputPath;
  } catch (error) {
    console.error('❌ Error creating splash screen:', error);
    throw error;
  }
}

// Splash Screen erstellen
createSplashScreen()
  .then(path => {
    console.log('Tarot Splash Screen generated successfully! 🔮✨');
    console.log('Die app.json ist bereits richtig konfiguriert mit:');
    console.log(`
"splash": {
  "image": "./assets/splash.png",
  "resizeMode": "contain",
  "backgroundColor": "${config.backgroundColor}"
}
    `);
  })
  .catch(err => {
    console.error('Failed to generate splash screen:', err);
    process.exit(1);
  });