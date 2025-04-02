import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { optimizeImage } from './imageOptimization';

// Halte den SplashScreen für Preloading
SplashScreen.preventAutoHideAsync();

// Verschiedene Asset-Typen
export enum AssetPriority {
  CRITICAL = 'critical',   // Sofort laden (UI-Elemente, Logo, etc.)
  HIGH = 'high',           // Früh laden (Tarot-Deck)
  MEDIUM = 'medium',       // Nach App-Start laden (Detail-Bilder)
  LOW = 'low'              // Bei Bedarf laden (selten genutzte Bilder)
}

type AssetMap = {
  [priority in AssetPriority]: {
    images: number[]; // Require-Referenzen für Bilder
    loaded: boolean;
  }
};

// Zentrales Asset-Management
class AssetManager {
  private assets: AssetMap = {
    [AssetPriority.CRITICAL]: { images: [], loaded: false },
    [AssetPriority.HIGH]: { images: [], loaded: false },
    [AssetPriority.MEDIUM]: { images: [], loaded: false },
    [AssetPriority.LOW]: { images: [], loaded: false }
  };

  private fonts: Record<string, Font.FontSource> = {};
  private isPreloading: boolean = false;

  // Assets zur Ladewarteschlange hinzufügen
  public registerImages(images: number[], priority: AssetPriority = AssetPriority.MEDIUM): void {
    this.assets[priority].images.push(...images);
  }

  // Schriften registrieren
  public registerFonts(fontMap: Record<string, Font.FontSource>): void {
    this.fonts = { ...this.fonts, ...fontMap };
  }

  // Alle kritischen Assets laden
  public async preloadCriticalAssets(): Promise<void> {
    if (this.isPreloading) return;
    
    try {
      this.isPreloading = true;

      // Fonts laden
      if (Object.keys(this.fonts).length > 0) {
        await Font.loadAsync(this.fonts);
      }

      // Kritische Bilder laden
      await this.loadAssetsByPriority(AssetPriority.CRITICAL);

      // SplashScreen verstecken
      await SplashScreen.hideAsync();

      // High-Priority im Hintergrund laden
      this.loadAssetsByPriority(AssetPriority.HIGH).catch(err => 
        console.error('Error loading high priority assets:', err)
      );
      
    } catch (error) {
      console.error('Error preloading critical assets:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  // Assetgruppen nach Priorität laden
  private async loadAssetsByPriority(priority: AssetPriority): Promise<void> {
    if (this.assets[priority].loaded) return;
    
    const imagesToLoad = this.assets[priority].images;
    if (imagesToLoad.length === 0) {
      this.assets[priority].loaded = true;
      return;
    }

    // Bilder vorladen
    await Promise.all(
      imagesToLoad.map(image => Asset.fromModule(image).downloadAsync())
    );

    this.assets[priority].loaded = true;
    console.log(`✅ Loaded ${imagesToLoad.length} ${priority} priority assets`);
  }

  // Bilder für aktive UI-Verwendung laden und optimieren
  public async getOptimizedImage(
    imageModule: number,
    width: number = 400,
    priority: AssetPriority = AssetPriority.MEDIUM
  ): Promise<string> {
    const asset = Asset.fromModule(imageModule);
    if (!asset.downloaded) {
      await asset.downloadAsync();
    }
    
    return await optimizeImage(asset.localUri || asset.uri || '', {
      width,
      quality: priority === AssetPriority.LOW ? 0.7 : 0.85,
      cacheKey: `img-${imageModule}`
    });
  }
}

export const assetManager = new AssetManager();