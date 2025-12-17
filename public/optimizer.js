/**
 * 🚀 Google Ads Manager Pro - Performance Optimizer
 * 
 * Script ISOLÉ pour améliorer PageSpeed Insights
 * Sans modifier aucun script Shopify existant
 * 
 * Version: 1.0.0
 * Auteur: Google Ads Manager Pro
 * 
 * DÉSACTIVATION: Supprimer la ligne <script> dans theme.liquid
 */

(function() {
  'use strict';

  // ====================================
  // 🔧 CONFIGURATION
  // ====================================
  const CONFIG = {
    enabled: true,           // Activer/désactiver le script
    debug: false,            // Afficher les logs dans la console
    lazyLoading: true,       // Activer lazy loading des images
    preloadCritical: true,   // Précharger les ressources critiques
    deferScripts: true,      // Différer les scripts non-critiques
    optimizeFonts: true,     // Optimiser le chargement des polices
    fixLayoutShift: true     // Réduire le CLS (Cumulative Layout Shift)
  };

  // ====================================
  // 📊 MÉTRIQUES
  // ====================================
  const metrics = {
    imagesOptimized: 0,
    lazyLoadingAdded: 0,
    scriptsDeferred: 0,
    fontsOptimized: 0,
    startTime: performance.now()
  };

  // ====================================
  // 🔍 UTILITAIRES
  // ====================================
  function log(message, data = null) {
    if (CONFIG.debug) {
      console.log(`[Optimizer] ${message}`, data || '');
    }
  }

  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= -100 &&
      rect.left >= -100 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 100 &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + 100
    );
  }

  // ====================================
  // 🖼️ LAZY LOADING DES IMAGES
  // ====================================
  function optimizeImages() {
    if (!CONFIG.lazyLoading) return;

    const images = document.querySelectorAll('img:not([loading])');
    
    images.forEach((img, index) => {
      // Ne pas lazy-load les images au-dessus de la ligne de flottaison
      if (index < 3 && isInViewport(img)) {
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');
      } else {
        img.setAttribute('loading', 'lazy');
        img.setAttribute('decoding', 'async');
        metrics.lazyLoadingAdded++;
      }

      // Ajouter des dimensions si manquantes (évite CLS)
      if (!img.hasAttribute('width') && img.naturalWidth) {
        img.setAttribute('width', img.naturalWidth);
        img.setAttribute('height', img.naturalHeight);
      }

      metrics.imagesOptimized++;
    });

    log(`Images optimisées: ${metrics.imagesOptimized}, Lazy loading ajouté: ${metrics.lazyLoadingAdded}`);
  }

  // ====================================
  // 📝 PRÉCHARGEMENT DES RESSOURCES CRITIQUES
  // ====================================
  function preloadCriticalResources() {
    if (!CONFIG.preloadCritical) return;

    // Précharger la première image visible (LCP)
    const firstImage = document.querySelector('img');
    if (firstImage && firstImage.src) {
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.as = 'image';
      preload.href = firstImage.src;
      document.head.appendChild(preload);
      log('Préchargement LCP image:', firstImage.src);
    }

    // Préconnexion aux domaines tiers fréquents
    const preconnectDomains = [
      'https://cdn.shopify.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    preconnectDomains.forEach(domain => {
      if (!document.querySelector(`link[rel="preconnect"][href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    log('Préconnexions ajoutées');
  }

  // ====================================
  // 🔤 OPTIMISATION DES POLICES
  // ====================================
  function optimizeFonts() {
    if (!CONFIG.optimizeFonts) return;

    // Ajouter font-display: swap aux polices Google Fonts
    const styleSheets = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    
    styleSheets.forEach(sheet => {
      if (!sheet.href.includes('display=swap')) {
        const newHref = sheet.href + (sheet.href.includes('?') ? '&' : '?') + 'display=swap';
        sheet.href = newHref;
        metrics.fontsOptimized++;
      }
    });

    log(`Polices optimisées: ${metrics.fontsOptimized}`);
  }

  // ====================================
  // 📐 RÉDUCTION DU CLS (Layout Shift)
  // ====================================
  function fixLayoutShift() {
    if (!CONFIG.fixLayoutShift) return;

    // Réserver l'espace pour les images sans dimensions
    const style = document.createElement('style');
    style.textContent = `
      img:not([width]):not([height]) {
        aspect-ratio: attr(width) / attr(height);
      }
      
      /* Éviter les sauts de mise en page */
      .shopify-section {
        contain: layout;
      }
      
      /* Stabiliser les embeds */
      iframe {
        aspect-ratio: 16/9;
        width: 100%;
        height: auto;
      }
    `;
    document.head.appendChild(style);

    log('Styles anti-CLS ajoutés');
  }

  // ====================================
  // ⚡ DIFFÉRER LES SCRIPTS NON-CRITIQUES
  // ====================================
  function observeAndDeferScripts() {
    if (!CONFIG.deferScripts) return;

    // Observer les nouveaux scripts ajoutés dynamiquement
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'SCRIPT' && !node.async && !node.defer) {
            // Ne pas modifier les scripts critiques de Shopify
            const src = node.src || '';
            const criticalPatterns = ['shopify', 'checkout', 'cart', 'analytics'];
            
            if (!criticalPatterns.some(pattern => src.toLowerCase().includes(pattern))) {
              node.defer = true;
              metrics.scriptsDeferred++;
              log('Script différé:', src);
            }
          }
        });
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // ====================================
  // 📊 RAPPORT DE PERFORMANCE
  // ====================================
  function reportMetrics() {
    const endTime = performance.now();
    const duration = Math.round(endTime - metrics.startTime);

    const report = {
      ...metrics,
      executionTime: `${duration}ms`,
      timestamp: new Date().toISOString()
    };

    log('📊 Rapport de performance:', report);

    // Envoyer les métriques à Google Ads Manager Pro (optionnel)
    if (window.GAMPro) {
      window.GAMPro.reportMetrics(report);
    }

    return report;
  }

  // ====================================
  // 🚀 INITIALISATION
  // ====================================
  function init() {
    if (!CONFIG.enabled) {
      log('⏸️ Optimizer désactivé');
      return;
    }

    log('🚀 Démarrage de l\'optimisation...');

    // Exécuter immédiatement
    preloadCriticalResources();
    fixLayoutShift();
    optimizeFonts();
    observeAndDeferScripts();

    // Attendre que le DOM soit prêt pour les images
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        optimizeImages();
        reportMetrics();
      });
    } else {
      optimizeImages();
      reportMetrics();
    }

    // Observer les nouvelles images ajoutées dynamiquement
    const imageObserver = new MutationObserver(() => {
      optimizeImages();
    });

    imageObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });

    log('✅ Optimizer initialisé avec succès');
  }

  // ====================================
  // 🎯 DÉMARRAGE
  // ====================================
  
  // Exposer l'API pour contrôle externe
  window.GAMProOptimizer = {
    config: CONFIG,
    metrics: metrics,
    enable: () => { CONFIG.enabled = true; init(); },
    disable: () => { CONFIG.enabled = false; },
    report: reportMetrics,
    version: '1.0.0'
  };

  // Démarrer
  init();

})();
