import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native'
import { ImageManipulator, FlipType, SaveFormat } from 'expo-image-manipulator';

const CACHE_DIR = `${FileSystem.cacheDirectory}optimized-images/`;

/**
 * Optimiert ein Bild mit modernen Expo Image Manipulator APIs
 * @param source Quelle des zu optimierenden Bildes (URI, Objekt mit URI oder Asset-Referenz)
 * @param options Optionen für die Optimierung
 * @returns Promise mit dem URI des optimierten Bildes
 */
export async function optimizeImage(
  source: string | { uri: string } | number,  // Accept different source types
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'JPEG' | 'PNG' | 'WEBP';
    cacheKey?: string;
  } = {}
): Promise<string> {
  // Extract uri string from different source types
  let uri: string;
  
  if (typeof source === 'string') {
    uri = source;
  } else if (typeof source === 'object' && source !== null && 'uri' in source) {
    uri = source.uri;
  } else if (typeof source === 'number') {
    // Handle require('./image.png') module ID
    try {
      // For local assets, we can't optimize them directly
      // Just return the original asset URI
      return Image.resolveAssetSource(source).uri;
    } catch (e) {
      console.error('Failed to resolve asset source:', e);
      throw new Error('Invalid image source: Unable to resolve module asset');
    }
  } else {
    throw new Error('Invalid image source: Must be a string URI, an object with uri property, or an asset reference');
  }

  if (!uri) {
    throw new Error('Invalid image source: URI is empty or undefined');
  }

  // Extract filename for cache key
  const filename = uri.split('/').pop() || 'image';
  
  const {
    width = 800,
    height,
    quality = 0.8,
    format = 'WEBP',
    cacheKey = filename,  // Use extracted filename instead of direct uri.split
  } = options;

  try {
    // Sicherstellen, dass das Cache-Verzeichnis existiert
    await ensureCacheDirectoryExists();

    // Generiere eindeutigen Dateinamen für das Cache-Ergebnis
    const formatLower = format.toLowerCase();
    const cachedFile = `${CACHE_DIR}${cacheKey}-${width}${height ? `-${height}` : ''}-${quality}.${formatLower}`;
    
    // Überprüfen, ob das Bild bereits im Cache ist
    if (await FileSystem.getInfoAsync(cachedFile).then((info) => info.exists)) {
      console.log(`Using cached optimized image: ${cachedFile}`);
      return cachedFile;
    }

    // Neue API verwenden - Context-basierter Ansatz
    const context = ImageManipulator.manipulate(uri);
    
    // Größe anpassen
    if (width && height) {
      // Wenn beide Dimensionen angegeben sind, resize mit beiden
      context.resize({ width, height });
    } else if (width) {
      // Nur Breite angegeben - proportionale Skalierung
      context.resize({ width });
    } else if (height) {
      // Nur Höhe angegeben - proportionale Skalierung
      context.resize({ height });
    }
    
    // Rendern des optimierten Bildes
    const processedImageRef = await context.renderAsync();
    
    // Speichern mit den gewünschten Optionen
    const saveFormat = format === 'JPEG' ? SaveFormat.JPEG 
      : format === 'PNG' ? SaveFormat.PNG 
      : SaveFormat.WEBP;
      
    const processedImage = await processedImageRef.saveAsync({
      format: saveFormat,
      compress: quality
    });

    // In den Cache kopieren für zukünftige Verwendung
    await FileSystem.copyAsync({
      from: processedImage.uri,
      to: cachedFile,
    });

    return cachedFile;
  } catch (error) {
    console.error('Failed to optimize image:', error);
    // Bei einem Fehler das Original zurückgeben
    return uri;
  }
}

/**
 * Erweiterte Bildoptimierung mit zusätzlichen Transformationen
 * @param uri URI des zu optimierenden Bildes
 * @param options Erweiterte Optionen für die Bildbearbeitung
 */
export async function enhancedImageOptimization(
  uri: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'JPEG' | 'PNG' | 'WEBP';
    cacheKey?: string;
    rotate?: number;
    flip?: 'horizontal' | 'vertical' | 'both' | null;
    crop?: {
      originX: number;
      originY: number;
      width: number;
      height: number;
    } | null;
  } = {}
): Promise<string> {
  const {
    width = 800,
    height,
    quality = 0.8,
    format = 'WEBP',
    cacheKey = uri.split('/').pop(),
    rotate = 0,
    flip = null,
    crop = null,
  } = options;

  // Eindeutigen Cache-Schlüssel erstellen, der alle Operationen berücksichtigt
  const operationsKey = `${width}${height ? `-${height}` : ''}-${quality}-${rotate}-${flip || 'noflip'}-${crop ? `crop-${crop.width}x${crop.height}` : 'nocrop'}`;
  const cachedFile = `${CACHE_DIR}${cacheKey}-${operationsKey}.${format.toLowerCase()}`;

  try {
    // Sicherstellen, dass das Cache-Verzeichnis existiert
    await ensureCacheDirectoryExists();

    // Überprüfen, ob das Bild bereits im Cache ist
    if (await FileSystem.getInfoAsync(cachedFile).then((info) => info.exists)) {
      console.log(`Using cached enhanced image: ${cachedFile}`);
      return cachedFile;
    }

    // Neue API verwenden - Context-basierter Ansatz
    const context = ImageManipulator.manipulate(uri);

    // Transformationen anwenden
    if (rotate !== 0) {
      context.rotate(rotate);
    }

    if (flip === 'horizontal') {
      context.flip(FlipType.Horizontal);
    } else if (flip === 'vertical') {
      context.flip(FlipType.Vertical);
    } else if (flip === 'both') {
      // Für beide Achsen müssen wir zwei separate Operationen durchführen
      context.flip(FlipType.Horizontal);
      context.flip(FlipType.Vertical);
    }

    if (crop) {
      context.crop(crop);
    }

    // Größe anpassen (als letzte Operation für beste Leistung)
    if (width && height) {
      context.resize({ width, height });
    } else if (width) {
      context.resize({ width });
    } else if (height) {
      context.resize({ height });
    }

    // Rendern des optimierten Bildes
    const processedImageRef = await context.renderAsync();
    
    // Speichern mit den gewünschten Optionen
    const saveFormat = format === 'JPEG' ? SaveFormat.JPEG 
      : format === 'PNG' ? SaveFormat.PNG 
      : SaveFormat.WEBP;
      
    const processedImage = await processedImageRef.saveAsync({
      format: saveFormat,
      compress: quality
    });

    // In den Cache kopieren für zukünftige Verwendung
    await FileSystem.copyAsync({
      from: processedImage.uri,
      to: cachedFile,
    });

    return cachedFile;
  } catch (error) {
    console.error('Failed to enhance image:', error);
    // Bei einem Fehler das Original zurückgeben
    return uri;
  }
}

/**
 * Stellt sicher, dass das Cache-Verzeichnis existiert
 */
async function ensureCacheDirectoryExists(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

/**
 * Bereinigt den Image-Cache
 * @param maxAgeDays Maximales Alter der Cache-Dateien in Tagen (Standard: 7)
 */
export async function clearImageCache(maxAgeDays = 7): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      return;
    }

    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    const now = new Date().getTime();
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000; // Tage in Millisekunden

    for (const file of files) {
      try {
        const filePath = `${CACHE_DIR}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath, { md5: false });
        
        if (fileInfo.exists && fileInfo.modificationTime) {
          const fileAge = now - fileInfo.modificationTime;
          
          if (fileAge > maxAgeMs) {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
            console.log(`Deleted old cached image: ${file}`);
          }
        }
      } catch (error) {
        console.error(`Error processing cache file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Failed to clear image cache:', error);
  }
}

/**
 * Gibt Informationen über den aktuellen Cache-Zustand zurück
 */
export async function getImageCacheInfo(): Promise<{
  cacheSize: number;
  fileCount: number;
  exists: boolean;
}> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    
    if (!dirInfo.exists) {
      return { cacheSize: 0, fileCount: 0, exists: false };
    }

    const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
    let totalSize = 0;

    for (const file of files) {
      const fileInfo = await FileSystem.getInfoAsync(`${CACHE_DIR}${file}`);
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }

    return {
      cacheSize: totalSize,
      fileCount: files.length,
      exists: true
    };
  } catch (error) {
    console.error('Failed to get image cache info:', error);
    return { cacheSize: 0, fileCount: 0, exists: false };
  }
}