import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SynonymEngine {
  private readonly logger = new Logger(SynonymEngine.name);

  /**
   * Synonym mappings for product-related terms
   * Maps various user inputs to normalized terms
   */
  private readonly productSynonyms: Record<string, string[]> = {
    oil: ['oil', 'olive oil', 'oiling', 'olives'],
    olive: ['olive', 'olives', 'olive oil'],
    product: ['product', 'item', 'goods', 'merchandise', 'stock', 'commodity', 'article'],
    stock: ['stock', 'inventory', 'supply', 'quantity', 'units', 'stock level', 'stock available'],
    quantity: ['quantity', 'amount', 'number', 'count', 'total', 'how many', 'how much'],
    available: ['available', 'in stock', 'stocked', 'available quantity', 'on hand', 'remaining'],
    warehouse: ['warehouse', 'depot', 'storage', 'facility', 'warehouse location'],
    bloc: ['bloc', 'block', 'section', 'area', 'zone', 'location', 'compartment'],
    low: ['low', 'low stock', 'running low', 'almost out', 'depleted', 'insufficient'],
    location: ['location', 'where', 'stored', 'placed', 'positioned', 'situated'],
  };

  /**
   * Synonym mappings for order/shipment terms
   */
  private readonly orderSynonyms: Record<string, string[]> = {
    order: ['order', 'purchase order', 'purchase', 'po', 'request'],
    shipment: ['shipment', 'shipment status', 'delivery', 'shipped', 'delivery status'],
    status: ['status', 'condition', 'state', 'progress', 'tracking'],
    track: ['track', 'trace', 'tracking', 'where is', 'locate'],
    shipped: ['shipped', 'sent', 'dispatched', 'on the way', 'in transit'],
    delivered: ['delivered', 'received', 'arrived', 'completed'],
    pending: ['pending', 'awaiting', 'waiting', 'in progress'],
  };

  /**
   * Synonym mappings for action verbs
   */
  private readonly actionSynonyms: Record<string, string[]> = {
    show: ['show', 'display', 'list', 'show me', 'give me', 'tell me', 'get', 'retrieve'],
    how_much: ['how much', 'how many', 'what amount', 'what quantity', 'total', 'count'],
    where: ['where', 'which warehouse', 'in which', 'locate', 'find', 'where is'],
    what: ['what', 'which', 'what is', 'what are'],
  };

  /**
   * Normalize user input using synonym mapping
   * Converts various phrasings to standardized terms
   */
  normalizeSynonyms(text: string): string {
    let normalized = text.toLowerCase();

    // Apply all synonym mappings
    const allSynonyms = {
      ...this.productSynonyms,
      ...this.orderSynonyms,
      ...this.actionSynonyms,
    };

    for (const [canonical, synonyms] of Object.entries(allSynonyms)) {
      for (const synonym of synonyms) {
        // Match as whole word using word boundaries
        const escapedSynonym = synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`\\b${escapedSynonym}\\b`, 'gi');
        normalized = normalized.replace(pattern, canonical);
      }
    }

    return normalized;
  }

  /**
   * Find similar product names to user input
   * Uses fuzzy matching to handle typos and variations
   */
  findSimilarProductName(userInput: string, candidates: string[]): string | null {
    const normalizedInput = userInput.toLowerCase().trim();

    // Exact match first
    for (const candidate of candidates) {
      if (candidate.toLowerCase() === normalizedInput) {
        return candidate;
      }
    }

    // Try synonym-normalized matching
    const normalizedCandidates = candidates.map((c) => ({
      original: c,
      normalized: this.normalizeSynonyms(c).toLowerCase(),
    }));

    for (const { original, normalized } of normalizedCandidates) {
      if (normalized === this.normalizeSynonyms(normalizedInput).toLowerCase()) {
        return original;
      }
    }

    // Levenshtein distance matching for typos
    let bestMatch: string | null = null;
    let bestDistance = Infinity;

    for (const candidate of candidates) {
      const distance = this.levenshteinDistance(normalizedInput, candidate.toLowerCase());
      if (distance < bestDistance && distance <= 2) {
        bestDistance = distance;
        bestMatch = candidate;
      }
    }

    return bestMatch;
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   * Helps handle typos in product names
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Extract canonical term from user input
   * Converts "olive oil" -> "oil", "how many" -> "quantity", etc.
   */
  extractCanonicalTerm(term: string, category: 'product' | 'order' | 'action'): string | null {
    const normalized = term.toLowerCase().trim();
    const synonymMap =
      category === 'product'
        ? this.productSynonyms
        : category === 'order'
          ? this.orderSynonyms
          : this.actionSynonyms;

    for (const [canonical, synonyms] of Object.entries(synonymMap)) {
      for (const synonym of synonyms) {
        if (synonym.toLowerCase() === normalized || normalized.includes(synonym.toLowerCase())) {
          return canonical;
        }
      }
    }

    return null;
  }

  /**
   * Get all synonyms for a canonical term
   */
  getSynonyms(term: string): string[] {
    const allSynonyms = {
      ...this.productSynonyms,
      ...this.orderSynonyms,
      ...this.actionSynonyms,
    };

    return allSynonyms[term.toLowerCase()] || [];
  }

  /**
   * Expand user query with synonyms for better matching
   */
  expandQueryWithSynonyms(text: string): string[] {
    const normalized = this.normalizeSynonyms(text);
    return [text, normalized];
  }
}
