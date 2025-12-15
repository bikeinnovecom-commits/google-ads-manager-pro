// Service pour interagir avec l'API Google PageSpeed Insights

const PAGESPEED_API_KEY = import.meta.env.VITE_PAGESPEED_API_KEY;

interface PageSpeedAudit {
  id: string;
  title: string;
  description: string;
  score?: number;
  details?: any;
}

interface PageSpeedResult {
  lighthouseResult: {
    scores: {
      performance: number;
      accessibility: number;
      bestPractices: number;
      seo: number;
    };
    audits: {
      [key: string]: PageSpeedAudit;
    };
  };
}

/**
 * Scanner une URL avec PageSpeed Insights
 * @param url - URL à scanner
 * @returns Score de performance (0-100)
 */
export async function scanPageSpeed(url: string): Promise<number> {
  try {
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.append('url', url);
    apiUrl.searchParams.append('key', PAGESPEED_API_KEY);
    apiUrl.searchParams.append('category', 'performance');

    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Erreur API PageSpeed: ${response.status}`);
    }

    const data = (await response.json()) as PageSpeedResult;
    const performanceScore = Math.round(
      (data.lighthouseResult.scores.performance || 0) * 100
    );

    console.log(`PageSpeed Score pour ${url}: ${performanceScore}`);
    return performanceScore;
  } catch (error) {
    console.error('Erreur lors du scan PageSpeed:', error);
    throw error;
  }
}

/**
 * Obtenir les détails complets des audits PageSpeed
 * @param url - URL à scanner
 * @returns Résultat complet PageSpeed
 */
export async function getPageSpeedDetails(url: string): Promise<PageSpeedResult> {
  try {
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.append('url', url);
    apiUrl.searchParams.append('key', PAGESPEED_API_KEY);

    const response = await fetch(apiUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Erreur API PageSpeed: ${response.status}`);
    }

    return (await response.json()) as PageSpeedResult;
  } catch (error) {
    console.error('Erreur lors de la récupération des détails PageSpeed:', error);
    throw error;
  }
}

/**
 * Extraire les erreurs/opportunités d'optimisation
 * @param details - Résultat complet PageSpeed
 * @returns Liste des améliorations possibles
 */
export function extractOptimizations(details: PageSpeedResult) {
  const audits = details.lighthouseResult.audits;
  const optimizations = {
    images: [] as any[],
    lazyLoading: [] as any[],
    altText: [] as any[],
    cssProblem: [] as any[],
    jsProblem: [] as any[],
  };

  // Images non optimisées (WebP)
  if (audits['modern-image-formats']) {
    optimizations.images = audits['modern-image-formats'].details?.items || [];
  }

  // Images hors écran (lazy loading)
  if (audits['offscreen-images']) {
    optimizations.lazyLoading = audits['offscreen-images'].details?.items || [];
  }

  // Alt text manquants
  if (audits['image-alt']) {
    optimizations.altText = audits['image-alt'].details?.items || [];
  }

  // CSS bloquant
  if (audits['render-blocking-resources']) {
    optimizations.cssProblem = audits['render-blocking-resources'].details?.items || [];
  }

  // JavaScript inutilisé
  if (audits['unused-javascript']) {
    optimizations.jsProblem = audits['unused-javascript'].details?.items || [];
  }

  return optimizations;
}

/**
 * Obtenir les recommandations principales
 * @param details - Résultat complet PageSpeed
 * @returns Top 5 recommandations
 */
export function getTopRecommendations(details: PageSpeedResult) {
  const audits = details.lighthouseResult.audits;
  const recommendations = [];

  const priorityAudits = [
    'modern-image-formats',
    'offscreen-images',
    'render-blocking-resources',
    'unused-javascript',
    'image-alt',
    'minify-css',
    'minify-javascript',
  ];

  for (const auditId of priorityAudits) {
    const audit = audits[auditId];
    if (audit && audit.score !== undefined && audit.score < 0.9) {
      recommendations.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: Math.round(audit.score * 100),
        impact: audit.details?.items?.length || 0,
      });
    }
  }

  return recommendations.slice(0, 5);
}
