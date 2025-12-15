// Service pour optimiser les images sans modifier Shopify

const TINYPNG_API_KEY = import.meta.env.VITE_TINYPNG_API_KEY;

interface OptimizationStats {
  imagesOptimized: number;
  lazyLoadingAdded: number;
  altTextsGenerated: number;
  webpConverted: number;
}

/**
 * Compresser une image via TinyPNG API
 * @param imageUrl - URL de l'image Shopify
 * @returns URL de l'image compressée
 */
async function compressImageWithTinyPNG(imageUrl: string): Promise<string> {
  try {
    // TinyPNG accepte les URLs Shopify directement
    const response = await fetch('https://api.tinify.com/output/webp', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa('api:' + TINYPNG_API_KEY)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: {
          url: imageUrl,
        },
        preserve: ['creation', 'copyright', 'creation'],
      }),
    });

    if (!response.ok) {
      throw new Error(`TinyPNG error: ${response.status}`);
    }

    // Obtenir l'URL de l'image compressée
    const outputUrl = response.headers.get('location');
    return outputUrl || imageUrl;
  } catch (error) {
    console.warn(`Erreur compression TinyPNG pour ${imageUrl}:`, error);
    return imageUrl; // Retourner l'URL originale si erreur
  }
}

/**
 * Convertir une image Shopify en WebP
 * Shopify supporte WebP via les paramètres d'URL
 * @param imageUrl - URL Shopify
 * @returns URL en WebP
 */
function convertToWebP(imageUrl: string): string {
  // Shopify supporte WebP avec le paramètre ?format=webp
  if (imageUrl.includes('?')) {
    return `${imageUrl}&format=webp`;
  }
  return `${imageUrl}?format=webp`;
}

/**
 * Ajouter/modifier le lazy loading sur les images
 */
function injectLazyLoading(): number {
  let count = 0;
  const images = document.querySelectorAll('img:not([loading])');

  images.forEach((img) => {
    img.setAttribute('loading', 'lazy');
    count++;
  });

  console.log(`Lazy loading ajouté à ${count} images`);
  return count;
}

/**
 * Générer un alt text basique si absent (utilise le nom du fichier)
 */
function generateAltTexts(): number {
  let count = 0;
  const images = document.querySelectorAll('img:not([alt])');

  images.forEach((img) => {
    const src = img.getAttribute('src') || '';
    // Extraire le nom du fichier du chemin
    const filename = src.split('/').pop()?.split('.')[0] || 'Product image';
    
    // Formater le nom (remplacer les tirets/underscores par des espaces)
    const altText = filename
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    
    img.setAttribute('alt', altText);
    count++;
  });

  console.log(`Alt text générés pour ${count} images`);
  return count;
}

/**
 * Convertir les images Shopify en WebP
 */
function convertImagesToWebP(): number {
  let count = 0;
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !src.includes('webp') && src.includes('shopify')) {
      const webpUrl = convertToWebP(src);
      img.setAttribute('src', webpUrl);
      
      // Aussi mettre à jour srcset si présent
      const srcset = img.getAttribute('srcset');
      if (srcset) {
        const webpSrcset = srcset
          .split(',')
          .map((src) => {
            if (!src.includes('webp')) {
              return convertToWebP(src.trim());
            }
            return src;
          })
          .join(',');
        img.setAttribute('srcset', webpSrcset);
      }
      
      count++;
    }
  });

  console.log(`WebP appliqué à ${count} images`);
  return count;
}

/**
 * Ajouter preload pour les images hero/critiques
 */
function preloadCriticalImages(): void {
  const criticalImages = document.querySelectorAll('[class*="hero"] img, [class*="banner"] img');

  criticalImages.forEach((img) => {
    const src = img.getAttribute('src');
    if (src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    }
  });
}

/**
 * Optimiser les ressources bloquantes
 */
function optimizeBlockingResources(): void {
  // CSS non-critique
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  stylesheets.forEach((link) => {
    // Ne pas modifier les styles critiques Shopify
    const href = link.getAttribute('href');
    if (href && !href.includes('theme') && !href.includes('shopify_common')) {
      link.setAttribute('media', 'print');
      link.onload = () => link.setAttribute('media', 'all');
    }
  });

  // JavaScript non-critique
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach((script) => {
    const src = script.getAttribute('src');
    // Ne pas modifier les scripts critiques Shopify
    if (src && !src.includes('shopify_common') && !src.includes('cart')) {
      if (!script.hasAttribute('defer')) {
        script.setAttribute('defer', '');
      }
    }
  });
}

/**
 * Fonction principale : Optimiser toutes les images
 */
export async function optimizeImages(storeUrl: string): Promise<OptimizationStats> {
  console.log('🚀 Démarrage de l\'optimisation des images...');

  try {
    // 1. Injecter le lazy loading
    const lazyLoadingCount = injectLazyLoading();

    // 2. Générer les alt text manquants
    const altTextCount = generateAltTexts();

    // 3. Convertir en WebP
    const webpCount = convertImagesToWebP();

    // 4. Compresser les images (TinyPNG)
    // Note: On met à jour les URLs des images principales
    let compressionCount = 0;
    const images = document.querySelectorAll('img[src*="shopify"]');
    
    for (const img of Array.from(images).slice(0, 10)) { // Limiter à 10 pour perf
      const src = img.getAttribute('src');
      if (src) {
        const compressedUrl = await compressImageWithTinyPNG(src);
        if (compressedUrl !== src) {
          img.setAttribute('src', compressedUrl);
          compressionCount++;
        }
      }
      // Petit délai pour respecter les limites API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 5. Précharger les images critiques
    preloadCriticalImages();

    // 6. Optimiser les ressources bloquantes
    optimizeBlockingResources();

    const stats: OptimizationStats = {
      imagesOptimized: compressionCount,
      lazyLoadingAdded: lazyLoadingCount,
      altTextsGenerated: altTextCount,
      webpConverted: webpCount,
    };

    console.log('✅ Optimisation terminée:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Erreur lors de l\'optimisation:', error);
    throw error;
  }
}

/**
 * Obtenir les statistiques d'optimisation actuelles
 */
export function getOptimizationStats(): OptimizationStats {
  const lazyLoadingCount = document.querySelectorAll('img[loading="lazy"]').length;
  const altTextCount = document.querySelectorAll('img[alt]').length;
  const webpCount = document.querySelectorAll('img[src*="webp"]').length;

  return {
    imagesOptimized: webpCount,
    lazyLoadingAdded: lazyLoadingCount,
    altTextsGenerated: altTextCount,
    webpConverted: webpCount,
  };
}

/**
 * Analyser les images non optimisées
 */
export function analyzeUnoptimizedImages() {
  const images = document.querySelectorAll('img');
  const analysis = {
    total: images.length,
    unoptimized: {
      noLazyLoading: 0,
      noAltText: 0,
      notWebp: 0,
      oversized: 0,
    },
  };

  images.forEach((img) => {
    if (!img.hasAttribute('loading')) analysis.unoptimized.noLazyLoading++;
    if (!img.hasAttribute('alt')) analysis.unoptimized.noAltText++;
    
    const src = img.getAttribute('src') || '';
    if (!src.includes('webp') && src.includes('shopify')) {
      analysis.unoptimized.notWebp++;
    }

    const width = img.naturalWidth || 0;
    if (width > 1200) analysis.unoptimized.oversized++;
  });

  return analysis;
}
