import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { assetManager, AssetPriority } from './assetPreloader';
import { optimizeImage } from './imageOptimization';

// Typ für eine optimierte Tarotkarte
interface OptimizedCardAsset {
  id: string;
  name: string;
  thumbnailUri: string;   // Kleine Version für Listen (200px)
  regularUri: string;     // Mittlere Version für normale Ansichten (600px)
  detailUri?: string;     // Große Version für Detail-Ansichten (1200px)
}

// Cache für optimierte Karten
class TarotDeckOptimizer {
  private cardCache: Map<string, OptimizedCardAsset> = new Map();
  private isInitialized: boolean = false;
  
  // Tarotkarten registrieren und voroptimieren
  public async initializeDeck(cardModules: {id: string; name: string; image: number}[]): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Alle Karten für High-Priority vorladen registrieren
      assetManager.registerImages(
        cardModules.map(card => card.image),
        AssetPriority.HIGH
      );
      
      // Karten voroptimieren (Thumbnails)
      await Promise.all(cardModules.map(async (card) => {
        // Asset laden wenn nötig
        const asset = Asset.fromModule(card.image);
        if (!asset.downloaded) {
          await asset.downloadAsync();
        }
        
        // Thumbnail optimieren (wird aktiv verwendet in Listen)
        const thumbnailUri = await optimizeImage(asset.localUri || asset.uri || '', {
          width: 200,
          quality: 0.8,
          cacheKey: `card-${card.id}-thumb`
        });
        
        // Medium-Größe für reguläre Ansicht
        const regularUri = await optimizeImage(asset.localUri || asset.uri || '', {
          width: 600,
          quality: 0.85,
          cacheKey: `card-${card.id}-regular`
        });
        
        // In Cache speichern
        this.cardCache.set(card.id, {
          id: card.id,
          name: card.name,
          thumbnailUri,
          regularUri,
        });
      }));
      
      this.isInitialized = true;
      console.log(`✅ Initialized and optimized ${cardModules.length} tarot card assets`);
    } catch (error) {
      console.error('Error initializing tarot deck optimizer:', error);
    }
  }
  
  // Kartendetails bei Bedarf laden
  public async getCardDetail(cardId: string, imageModule: number): Promise<OptimizedCardAsset> {
    const cachedCard = this.cardCache.get(cardId);
    
    if (!cachedCard) {
      throw new Error(`Card ${cardId} not found in cache`);
    }
    
    // Wenn Details noch nicht geladen, dann laden
    if (!cachedCard.detailUri) {
      const asset = Asset.fromModule(imageModule);
      if (!asset.downloaded) {
        await asset.downloadAsync();
      }
      
      const detailUri = await optimizeImage(asset.localUri || asset.uri || '', {
        width: 1200,
        quality: 0.9,
        cacheKey: `card-${cardId}-detail`
      });
      
      // Cache aktualisieren
      const updatedCard = {
        ...cachedCard,
        detailUri
      };
      
      this.cardCache.set(cardId, updatedCard);
      return updatedCard;
    }
    
    return cachedCard;
  }
  
  // Karten nach IDs abrufen (für Listen)
  public getCards(cardIds: string[]): OptimizedCardAsset[] {
    return cardIds
      .map(id => this.cardCache.get(id))
      .filter((card): card is OptimizedCardAsset => card !== undefined);
  }
  
  // Cache-Statistik abrufen
  public getCacheStats(): {count: number; sizeEstimate: string} {
    return {
      count: this.cardCache.size,
      sizeEstimate: `${Math.round(this.cardCache.size * 1.5)}MB` // Grobe Schätzung basierend auf Erfahrungswerten
    };
  }
}

// Singleton-Instanz exportieren
export const tarotDeckOptimizer = new TarotDeckOptimizer();