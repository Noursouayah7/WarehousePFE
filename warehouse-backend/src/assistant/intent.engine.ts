import { Injectable, Logger } from '@nestjs/common';

export type AssistantIntent =
  | 'stock_quantity'
  | 'stock_check'
  | 'inventory_summary'
  | 'product_location'
  | 'low_stock'
  | 'order_status'
  | 'warehouse_capacity'
  | 'clarification'
  | 'unsupported'
  | 'forbidden';

interface IntentKeywords {
  patterns: RegExp[];
  priority: number;
}

@Injectable()
export class IntentEngine {
  private readonly logger = new Logger(IntentEngine.name);

  private readonly intentKeywords: Record<AssistantIntent, IntentKeywords> = {
    stock_quantity: {
      patterns: [
        /\b(how much|how many|quantity|stock|units|available|remaining)\b.*\b(of|for|in|on|regarding|concerning)\b/i,
        /\b(what is|what are).*\b(quantity|stock|amount|number|count)\b.*\b(of|for)\b/i,
        /\b(show me|show|list).*\b(stock|quantity|units|available)\b/i,
        /\b(available|remaining)\b.*\b(quantity|units|stock)\b/i,
        /\b(stock|quantity|units)\b.*\b(of|for|in)\b/i,
        /\b(combien|quantite|stock|unites?|disponible|reste)\b.*\b(de|du|des|pour|dans|sur)\b/i,
        /\b(quelle est|quel est).*\b(quantite|stock|nombre|total)\b.*\b(de|du|des|pour)\b/i,
        /\b(affiche|afficher|montre|montrer|liste|lister).*\b(stock|quantite|unites?|disponible)\b/i,
        /\b(stock|quantite|unites?)\b.*\b(de|du|des|pour|dans)\b/i,
      ],
      priority: 10,
    },
    stock_check: {
      patterns: [
        /\b(do we|do i|do you).*\b(have|still have|still got)\b.*\b(product|item|stock)\b/i,
        /\b(is|are).*\b(product|item).*\b(in stock|available|stocked)\b/i,
        /\b(is|are).*\b(product|item|we).*\b(out of|low on)\b/i,
        /\bdo we have\b/i,
        /\bis.*in stock/i,
        /\b(avons[- ]nous|avez[- ]vous|est[- ]ce qu on a|on a|nous avons)\b.*\b(produit|article|stock)\b/i,
        /\b(est|sont).*\b(produit|article).*\b(en stock|disponible|disponibles)\b/i,
      ],
      priority: 9,
    },
    product_location: {
      patterns: [
        /\b(where).*\b(is|are).*\b(product|item|stock)\b/i,
        /\b(locate|find|show).*\b(me)?\s*(product|item|stock)\b/i,
        /\b(which|in which)\b.*\b(warehouse|bloc|block|location)\b.*\b(is|contains|has)\b/i,
        /\b(in which|which)\b.*\b(bloc|block|warehouse|location)\b/i,
        /\b(stored|stored in|stored at|located|located in|located at)\b/i,
        /\bstorage location\b/i,
        /\b(ou|où).*\b(est|sont).*\b(produit|article|stock)\b/i,
        /\b(localise|localiser|trouve|trouver|cherche|chercher|affiche|montre).*\b(produit|article|stock)\b/i,
        /\b(dans quel|quel).*\b(entrepot|entrepôt|bloc|emplacement).*\b(est|contient|a)\b/i,
        /\b(stocke|stockee|stocké|stockée|situe|situé|place|placé|emplacement)\b/i,
      ],
      priority: 10,
    },
    inventory_summary: {
      patterns: [
        /\b(show|list|display|get).*\b(me)?\b.*\b(inventory|stock|items|products)\b.*\b(of|in)\b/i,
        /\b(what).*\b(is|are).*\b(stored|in)\b.*\b(warehouse|bloc|block)\b/i,
        /\b(all|list all)\b.*\b(items|products|stock)\b.*\b(in|of|at)\b/i,
        /\binventory\b.*\b(of|in)\b/i,
        /\b(affiche|afficher|liste|lister|montre|montrer).*\b(inventaire|stock|articles|produits)\b.*\b(de|dans)\b/i,
        /\b(quoi|qu est ce qui).*\b(est|sont).*\b(stocke|stockee|stocké|stockée|dans).*\b(entrepot|entrepôt|bloc)\b/i,
        /\b(tous|liste tous).*\b(articles|produits|stock)\b.*\b(dans|de|du)\b/i,
        /\binventaire\b.*\b(de|du|dans)\b/i,
      ],
      priority: 9,
    },
    low_stock: {
      patterns: [
        /\b(low|almost out|out of|running low|almost gone)\b.*\b(stock|inventory|products)\b/i,
        /\b(which|what).*\b(items|products)\b.*\b(are|is).*(low|almost out|out of|running low)\b/i,
        /\b(low|almost out)\b.*\b(on|of)\b.*\b(stock|inventory)\b/i,
        /\b(stock faible|rupture|presque en rupture|bientot en rupture|faible)\b.*\b(stock|inventaire|produits|articles)?\b/i,
        /\b(quels|quelles).*\b(articles|produits)\b.*\b(stock faible|rupture|presque en rupture)\b/i,
      ],
      priority: 8,
    },
    warehouse_capacity: {
      patterns: [
        /\b(capacity|space|room|available space|max capacity)\b.*\b(in|of|at)\b.*\b(warehouse|bloc|block)\b/i,
        /\b(how much|what is).*\b(capacity|space|room)\b.*\b(in|of|at)\b/i,
        /\b(warehouse|bloc|block).*\b(capacity|space|room)\b/i,
        /\b(capacite|capacité|espace|place|espace disponible)\b.*\b(dans|de|du|a|à)\b.*\b(entrepot|entrepôt|bloc)\b/i,
        /\b(combien|quelle est|quel est).*\b(capacite|capacité|espace|place)\b.*\b(dans|de|du|a|à)\b/i,
        /\b(entrepot|entrepôt|bloc).*\b(capacite|capacité|espace|place)\b/i,
      ],
      priority: 7,
    },
    order_status: {
      patterns: [
        /\b(status|track|tracking|info|information|details)\b.*\b(of|for)?\s*order\b/i,
        /\border\s*#?\d+\b/i,
        /\b(shipment|shipping|shipped|delivery)\b.*\b(of|for)?\s*order\b/i,
        /\b(track|where is)\b.*\b(my|the)\b.*\b(order|shipment|package)\b/i,
        /\b(is|when).*\b(order|shipment).*\b(shipped|delivered|on the way)\b/i,
        /\b(statut|suivi|infos?|informations?|details|détails)\b.*\b(de|pour)?\s*(la|le)?\s*commande\b/i,
        /\bcommande\s*#?\d+\b/i,
        /\b(livraison|expedition|expédition|expediee|expédiée|livree|livrée)\b.*\b(de|pour)?\s*(la|le)?\s*commande\b/i,
        /\b(suivre|ou est|où est).*\b(ma|la|le)\b.*\b(commande|livraison|colis|expedition|expédition)\b/i,
      ],
      priority: 8,
    },
    clarification: {
      patterns: [/./], // Matches anything - fallback
      priority: 0,
    },
    unsupported: {
      patterns: [/.*/],
      priority: -1,
    },
    forbidden: {
      patterns: [/.*/],
      priority: -1,
    },
  };

  /**
   * Detect the primary intent of a user query
   * @param message User's natural language query
   * @returns Detected intent and confidence score
   */
  detectIntent(message: string): {
    intent: AssistantIntent;
    confidence: number;
    reasons: string[];
  } {
    const normalizedMessage = this.normalizeText(message);
    const matches: Array<{
      intent: AssistantIntent;
      priority: number;
      matched_patterns: number;
      reasons: string[];
    }> = [];

    for (const [intent, keywords] of Object.entries(this.intentKeywords)) {
      let matchedPatterns = 0;
      const reasons: string[] = [];

      for (const pattern of keywords.patterns) {
        if (pattern.test(normalizedMessage)) {
          matchedPatterns++;
          reasons.push(pattern.source);
        }
      }

      if (matchedPatterns > 0) {
        matches.push({
          intent: intent as AssistantIntent,
          priority: keywords.priority,
          matched_patterns: matchedPatterns,
          reasons,
        });
      }
    }

    if (matches.length === 0) {
      return {
        intent: 'clarification',
        confidence: 0.1,
        reasons: ['No matching patterns found'],
      };
    }

    // Sort by priority (descending) then by number of matches (descending)
    matches.sort((a, b) => b.priority - a.priority || b.matched_patterns - a.matched_patterns);
    const topMatch = matches[0];

    // Calculate confidence score
    const normalizedPriority = Math.max(0, Math.min(1, topMatch.priority / 10));
    const patternStrength = Math.max(0.2, Math.min(1, topMatch.matched_patterns / 4));
    const confidence = Math.min(0.99, normalizedPriority * 0.7 + patternStrength * 0.3);

    this.logger.debug(`Intent detection: ${topMatch.intent} (confidence: ${confidence.toFixed(2)})`);

    return {
      intent: topMatch.intent as AssistantIntent,
      confidence,
      reasons: topMatch.reasons,
    };
  }

  /**
   * Normalize text for intent matching
   */
  private normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  /**
   * Map intent to query focus area
   */
  getIntentFocus(intent: AssistantIntent): 'product' | 'location' | 'order' | 'status' {
    const focusMap: Record<AssistantIntent, 'product' | 'location' | 'order' | 'status'> = {
      stock_quantity: 'product',
      stock_check: 'product',
      inventory_summary: 'location',
      product_location: 'location',
      low_stock: 'product',
      order_status: 'order',
      warehouse_capacity: 'location',
      clarification: 'status',
      unsupported: 'status',
      forbidden: 'status',
    };
    return focusMap[intent];
  }
}
