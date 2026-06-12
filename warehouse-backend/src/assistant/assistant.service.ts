import { BadRequestException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssistantQueryDto } from './dto/assistant-query.dto';
import { IntentEngine, type AssistantIntent } from './intent.engine';
import { GrokNormalizerService } from './grok-normalizer.service';
import { SynonymEngine } from './synonym.engine';
import { ContextManager } from './context.manager';
import { MetricsService } from './metrics.service';

type ParsedAssistantQuery = {
  productName: string | null;
  warehouseName: string | null;
  blocName: string | null;
  orderId: string | null;
  wantsInventorySummary: boolean;
  language: AssistantLanguage;
};

type AssistantLanguage = 'en' | 'fr';

export type AssistantMatch = {
  id: number;
  productName: string;
  quantity: number;
  warehouseName: string;
  blocName: string;
};

export type OrderMatch = {
  id: number;
  orderNumber: string;
  status: string;
  createdAt: Date;
};

export interface AssistantResponse {
  intent: AssistantIntent;
  message: string;
  query: ParsedAssistantQuery;
  totalQuantity?: number;
  matches?: AssistantMatch[];
  orders?: OrderMatch[];
}

const PRODUCT_STOP_WORDS = [
  'in',
  'at',
  'inside',
  'within',
  'warehouse',
  'bloc',
  'block',
  'location',
  'stock',
  'quantity',
  'available',
  'how',
  'do',
  'i',
  'have',
  'need',
  'show',
  'tell',
  'where',
  'from',
  'for',
  'dans',
  'de',
  'du',
  'des',
  'pour',
  'sur',
  'le',
  'la',
  'les',
  'un',
  'une',
  'produit',
  'article',
  'entrepot',
  'entrepôt',
];

const LOCATION_STOP_WORDS = [
  'product',
  'item',
  'warehouse',
  'bloc',
  'block',
  'location',
  'stock',
  'quantity',
  'produit',
  'article',
  'entrepot',
  'entrepôt',
  'emplacement',
  'quantite',
  'quantité',
];
const PRODUCT_FALLBACK_PREFIXES = [
  'how much',
  'how many',
  'how_much',
  'show me',
  'show',
  'tell me',
  'tell',
  'what is',
  'what are',
  'where is',
  'where are',
  'do i have',
  'i have',
  'i need',
  'need',
  'stock',
  'quantity',
  'available',
  'availability',
  'units',
  'combien',
  'quelle quantite',
  'quelle quantité',
  'affiche',
  'montre',
  'liste',
  'quel est',
  'quelle est',
  'ou est',
  'où est',
  'avons nous',
  'avons-nous',
  'nous avons',
  'stock',
  'quantite',
  'quantité',
  'disponible',
  'disponibilite',
  'disponibilité',
];
const PRODUCT_TRAILING_STOP_WORDS = [
  'in',
  'at',
  'inside',
  'within',
  'warehouse',
  'bloc',
  'block',
  'location',
  'stock',
  'quantity',
  'available',
  'availability',
  'units',
  'is',
  'are',
  'was',
  'were',
  'be',
  'being',
  'been',
  'do',
  'does',
  'did',
  'have',
  'has',
  'had',
  'dans',
  'de',
  'du',
  'des',
  'pour',
  'sur',
  'le',
  'la',
  'les',
  'est',
  'sont',
  'etre',
  'être',
  'avoir',
  'avons',
  'avez',
  'stock',
  'quantite',
  'quantité',
  'disponible',
  'disponibilite',
  'disponibilité',
];

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly intentEngine: IntentEngine,
    private readonly grokNormalizer: GrokNormalizerService,
    private readonly synonymEngine: SynonymEngine,
    private readonly contextManager: ContextManager,
    private readonly metricsService: MetricsService,
  ) {}

  async query(userRole: string, userId: string, dto: AssistantQueryDto): Promise<AssistantResponse> {
    const startTime = Date.now();
    const message = dto.message.trim();

    if (!message) {
      throw new BadRequestException('Message is required');
    }

    if (userRole === 'PENDING') {
      throw new ForbiddenException('Your account is not allowed to use the assistant yet');
    }

    const language = this.detectLanguage(message);
    const grokNormalizedMessage = await this.grokNormalizer.normalizeMessage(message);
    const messageForParsing = grokNormalizedMessage ?? message;

    // Detect intent
    const intentDetection = this.intentEngine.detectIntent(messageForParsing);
    const intent = intentDetection.intent;

    // Normalize synonyms
    const normalizedMessage = this.synonymEngine.normalizeSynonyms(messageForParsing);

    // Parse the message
    const parsed = this.parseMessage(normalizedMessage, language);

    // Fill missing entities from context if this is a follow-up
    let enrichedParsed = parsed;
    if (this.contextManager.isFollowUpQuery(userId)) {
      const filledEntities = this.contextManager.fillMissingEntitiesFromContext(userId, {
        product: parsed.productName ?? undefined,
        warehouse: parsed.warehouseName ?? undefined,
        bloc: parsed.blocName ?? undefined,
      });
      enrichedParsed = {
        ...parsed,
        productName: filledEntities.product ?? parsed.productName,
        warehouseName: filledEntities.warehouse ?? parsed.warehouseName,
        blocName: filledEntities.bloc ?? parsed.blocName,
      };
    }

    this.logger.log(
      `assistant query role=${userRole} intent=${intent} product=${enrichedParsed.productName ?? '-'} warehouse=${enrichedParsed.warehouseName ?? '-'} bloc=${enrichedParsed.blocName ?? '-'}`,
    );

    // Handle different intents
    let response: AssistantResponse;

    switch (intent) {
      case 'order_status':
        response = await this.handleOrderStatusQuery(enrichedParsed, userRole);
        break;

      case 'product_location':
        response = await this.handleLocationQuery(enrichedParsed, userRole);
        break;

      case 'low_stock':
        response = await this.handleLowStockQuery(enrichedParsed, userRole);
        break;

      case 'warehouse_capacity':
        response = await this.handleCapacityQuery(enrichedParsed, userRole);
        break;

      case 'stock_check':
        response = await this.handleStockCheckQuery(enrichedParsed, userRole);
        break;

      case 'stock_quantity':
      case 'inventory_summary':
      default:
        response = await this.handleProductAndInventoryQueries(enrichedParsed, userRole, intent);
        break;
    }

    // Update context
    this.contextManager.updateContextWithQuery(userId, message, intent, {
      product: enrichedParsed.productName ?? undefined,
      warehouse: enrichedParsed.warehouseName ?? undefined,
      bloc: enrichedParsed.blocName ?? undefined,
      order: enrichedParsed.orderId ?? undefined,
    });

    this.contextManager.updateContextWithResponse(userId, response.message, response.intent);
    if (response.intent === 'clarification') {
      this.contextManager.markClarificationAsked(userId, parsed.productName ? 'location' : 'product');
    }

    // Record metrics
    const responseTime = Date.now() - startTime;
    const success = response.intent !== 'clarification' && response.intent !== 'unsupported';
    const resultCount = (response.matches?.length ?? 0) + (response.orders?.length ?? 0);

    this.metricsService.recordQuery({
      userId,
      userRole,
      query: message,
      intent: response.intent,
      success,
      resultCount,
      responseTime,
      extractedEntities: {
        product: enrichedParsed.productName ?? undefined,
        warehouse: enrichedParsed.warehouseName ?? undefined,
        bloc: enrichedParsed.blocName ?? undefined,
        order: enrichedParsed.orderId ?? undefined,
      },
    });

    return response;
  }

  private parseMessage(message: string, language: AssistantLanguage): ParsedAssistantQuery {
    const orderId = this.extractOrderId(message);
    const productName = orderId && /\b(?:order|commande)\b/i.test(message) ? null : this.extractProductName(message);
    const warehouseName = this.extractTerm(message, /\b(?:warehouse|entrepot|entrepôt)\b/i, LOCATION_STOP_WORDS);
    const blocName = this.extractTerm(message, /\b(?:bloc|block)\b/i, LOCATION_STOP_WORDS);
    const wantsInventorySummary =
      /\b(how much|how many|stock|quantity|available|availability|units?|list|show|inventory|combien|quantite|quantité|disponible|disponibilite|disponibilité|liste|affiche|inventaire)\b/i.test(message);

    return {
      productName,
      warehouseName,
      blocName,
      orderId,
      wantsInventorySummary,
      language,
    };
  }

  private extractProductName(message: string): string | null {
    const productAfterStrongCue = this.extractTextAfterCue(
      message,
      /\b(?:for|on|regarding|concerning|pour|sur|concernant)\b/i,
      [...LOCATION_STOP_WORDS, 'and', 'or', 'with', 'et', 'ou', 'avec'],
    );
    if (productAfterStrongCue && !this.isGenericProductCandidate(productAfterStrongCue)) {
      return productAfterStrongCue;
    }

    const explicitProduct = this.extractTerm(message, /\b(?:product|item|produit)\b/i, PRODUCT_STOP_WORDS);
    if (explicitProduct && !this.isGenericProductCandidate(explicitProduct)) {
      return explicitProduct;
    }

    const productBeforeLocation = this.extractTextBeforeKeyword(
      message,
      /\b(?:warehouse|entrepot|entrepôt|bloc|block)\b/i,
      PRODUCT_FALLBACK_PREFIXES,
    );
    if (productBeforeLocation && !this.isGenericProductCandidate(productBeforeLocation)) {
      return productBeforeLocation;
    }

    const productAfterCue = this.extractTextAfterCue(
      message,
      /\b(?:of|about|for|on|regarding|concerning|de|du|des|pour|sur|concernant)\b/i,
      [...LOCATION_STOP_WORDS, 'and', 'or', 'with'],
    );
    if (productAfterCue && !this.isGenericProductCandidate(productAfterCue)) {
      return productAfterCue;
    }

    const standaloneProduct = this.extractStandaloneProduct(message);
    if (standaloneProduct && !this.isGenericProductCandidate(standaloneProduct)) {
      return standaloneProduct;
    }

    return null;
  }

  private extractOrderId(message: string): string | null {
    const match = /(?:order|commande)\s*#?(\d+)|#(\d+)/i.exec(message);
    return match ? match[1] || match[2] : null;
  }

  private extractTerm(source: string, keyword: RegExp, stopWords: string[]): string | null {
    const match = keyword.exec(source);
    if (!match || match.index === undefined) {
      return null;
    }

    let value = source.slice(match.index + match[0].length);
    value = value.replace(/^\s*(?:of|named|called|the|for|in|at|inside|within|de|du|des|nomme|nommé|appele|appelé|le|la|les|pour|dans|a|à)\s+/i, '');

    const stopPattern = new RegExp(`\\s+(?:${stopWords.join('|')})\\b`, 'i');
    const stopMatch = stopPattern.exec(value);
    if (stopMatch && stopMatch.index !== undefined) {
      value = value.slice(0, stopMatch.index);
    }

    return this.cleanTerm(this.trimTrailingConnectors(value));
  }

  private extractStandaloneProduct(source: string): string | null {
    let value = source;

    value = value.replace(/^\s*(?:how much|how many|show me|show|tell me|tell|what is|what are|do i have|i have|i need|need|combien|quelle quantite|quelle quantité|affiche|montre|liste|quel est|quelle est|avons nous|avons-nous|nous avons|besoin de)\s+/i, '');
    value = value.replace(/^\s*how_much\s+/i, '');
    value = value.replace(/^\s*(?:of|about|for|on|regarding|concerning|de|du|des|pour|sur|concernant|le|la|les)\s+/i, '');

    const stopPattern = new RegExp(`\\s+(?:${PRODUCT_TRAILING_STOP_WORDS.join('|')})\\b`, 'i');
    const stopMatch = stopPattern.exec(value);
    if (stopMatch && stopMatch.index !== undefined) {
      value = value.slice(0, stopMatch.index);
    }

    value = value.replace(/\s+(?:the|a|an|le|la|les|un|une)\s*$/i, '');

    return this.cleanTerm(value);
  }

  private inferCatalogName(message: string, candidates: string[]): string | null {
    const normalizedMessage = this.normalizeText(message);
    let bestMatch: string | null = null;

    for (const candidate of candidates) {
      const normalizedCandidate = this.normalizeText(candidate);
      if (!normalizedCandidate) {
        continue;
      }

      const escapedCandidate = normalizedCandidate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const candidatePattern = new RegExp(`(?:^|\\b)${escapedCandidate}(?:\\b|$)`, 'i');
      if (candidatePattern.test(normalizedMessage)) {
        if (!bestMatch || normalizedCandidate.length > this.normalizeText(bestMatch).length) {
          bestMatch = candidate;
        }
      }
    }

    return bestMatch;
  }

  private uniqueValues(values: string[]): string[] {
    return Array.from(new Set(values.filter((value) => value.trim().length > 0)));
  }

  private extractTextBeforeKeyword(source: string, keyword: RegExp, prefixes: string[]): string | null {
    const match = keyword.exec(source);
    const sliceEnd = match && match.index !== undefined ? match.index : source.length;
    let value = source.slice(0, sliceEnd);

    value = value.replace(new RegExp(`^\\s*(?:${prefixes.join('|')})\\b(?:\\s+(?:of|about|for|on|regarding|concerning|de|du|des|pour|sur|concernant))?\\s*`, 'i'), '');
    value = value.replace(/\s+(?:in|at|inside|within|of|for|from|is|are|was|were|available|availability|stock|quantity|units?|dans|de|du|des|pour|sur|est|sont|disponible|disponibilite|disponibilité|quantite|quantité|unites?|unités?)\s*$/i, '');

    return this.cleanTerm(this.trimTrailingConnectors(value));
  }

  private extractTextAfterCue(source: string, cue: RegExp, stopWords: string[]): string | null {
    const match = cue.exec(source);
    if (!match || match.index === undefined) {
      return null;
    }

    let value = source.slice(match.index + match[0].length);
    value = value.replace(/^\s*(?:of|about|for|on|regarding|concerning|the|a|an|de|du|des|pour|sur|concernant|le|la|les|un|une)\s+/i, '');

    const stopPattern = new RegExp(`\\s+(?:${[...stopWords, ...PRODUCT_TRAILING_STOP_WORDS].join('|')})\\b`, 'i');
    const stopMatch = stopPattern.exec(value);
    if (stopMatch && stopMatch.index !== undefined) {
      value = value.slice(0, stopMatch.index);
    }

    return this.cleanTerm(this.trimTrailingConnectors(value));
  }

  private detectLanguage(message: string): AssistantLanguage {
    const normalized = this.normalizeText(message.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
    const frenchMarkers = [
      /\b(combien|quantite|quelle|quel|quels|quelles|ou|statut|commande|livraison|expedition)\b/i,
      /\b(produit|produits|entrepot|stocke|stockee|disponible|rupture|faible|inventaire)\b/i,
      /\b(avons nous|avons-nous|est ce|dans quel|de la|du|des|pour)\b/i,
    ];

    return frenchMarkers.some((pattern) => pattern.test(normalized)) ? 'fr' : 'en';
  }

  private isGenericProductCandidate(value: string): boolean {
    const normalized = this.normalizeText(value);
    if (PRODUCT_FALLBACK_PREFIXES.includes(normalized)) {
      return true;
    }

    if (/\b(?:stock|quantity|availability|available|units?|product|item|produit|produits|article|articles|low|faible|rupture)\b/i.test(normalized)) {
      return true;
    }

    return /\b(?:how much|how many|are|is|was|were|be|being|been|do|does|did|combien|quel|quelle|est|sont|avons|avez)\b/i.test(normalized);
  }

  private cleanTerm(value: string): string | null {
    const cleaned = value
      .replace(/[?.!,;:]+$/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return cleaned.length > 0 ? cleaned : null;
  }

  private trimTrailingConnectors(value: string): string {
    return value.replace(/\s+(?:in|at|inside|within|of|for|from|and|or|with|dans|de|du|des|pour|sur|et|ou|où|avec)\s*$/i, '').trim();
  }

  private matchesLocation(
    product: {
      bloc: { name: string; warehouse: { name: string } };
    },
    parsed: ParsedAssistantQuery,
  ): boolean {
    const blocName = this.normalizeText(product.bloc.name);
    const warehouseName = this.normalizeText(product.bloc.warehouse.name);

    if (parsed.blocName && !this.matchesTerm(blocName, parsed.blocName)) {
      return false;
    }

    if (parsed.warehouseName && !this.matchesTerm(warehouseName, parsed.warehouseName)) {
      return false;
    }

    return true;
  }

  private normalizeText(value: string): string {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private matchesTerm(source: string, term: string): boolean {
    const normalizedTerm = this.normalizeText(term);
    if (!normalizedTerm) {
      return false;
    }

    const escapedTerm = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escapedTerm}\\b`, 'i').test(source);
  }

  private toMatch(product: {
    id: number;
    name: string;
    quantity: number;
    bloc: { name: string; warehouse: { name: string } };
  }): AssistantMatch {
    return {
      id: product.id,
      productName: product.name,
      quantity: product.quantity,
      warehouseName: product.bloc.warehouse.name,
      blocName: product.bloc.name,
    };
  }

  // ==================== INTENT HANDLERS ====================

  private async handleProductAndInventoryQueries(
    parsed: ParsedAssistantQuery,
    userRole: string,
    intent: AssistantIntent,
  ): Promise<AssistantResponse> {
    if (!parsed.productName && !parsed.warehouseName && !parsed.blocName && !parsed.wantsInventorySummary) {
      return {
        intent: 'unsupported',
        message: parsed.language === 'fr'
          ? 'Je peux repondre aux questions sur le stock produit, les niveaux d inventaire, les emplacements et les commandes. Essayez une question sur un produit, un entrepot, un bloc ou le statut d une commande.'
          : 'I can answer questions about product stock, inventory levels, locations, and orders. Try asking about a product, warehouse, bloc, or order status.',
        query: parsed,
      };
    }

    if (userRole === 'CUSTOMER' && (parsed.warehouseName || parsed.blocName)) {
      return {
        intent: 'forbidden',
        message: parsed.language === 'fr'
          ? 'Les comptes client peuvent demander la disponibilite des produits, mais pas les details par entrepot ou bloc.'
          : 'Customer accounts can ask about product availability, but not warehouse or bloc-level details.',
        query: parsed,
      };
    }

    const allProducts = await this.prisma.product.findMany({
      include: {
        bloc: {
          include: {
            warehouse: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
    });

    const catalogText = [parsed.productName, parsed.warehouseName, parsed.blocName].filter(Boolean).join(' ');

    const inferredProductName =
      parsed.productName ?? this.inferCatalogName(catalogText, allProducts.map((product) => product.name));
    const inferredWarehouseName =
      parsed.warehouseName ??
      this.inferCatalogName(catalogText, this.uniqueValues(allProducts.map((product) => product.bloc.warehouse.name)));
    const inferredBlocName =
      parsed.blocName ?? this.inferCatalogName(catalogText, this.uniqueValues(allProducts.map((product) => product.bloc.name)));

    const effectiveParsed: ParsedAssistantQuery = {
      ...parsed,
      productName: inferredProductName,
      warehouseName: inferredWarehouseName,
      blocName: inferredBlocName,
    };

    const products = allProducts.filter((product) => {
      if (effectiveParsed.productName) {
        const normalizedProductName = this.normalizeText(product.name);
        if (!this.matchesTerm(normalizedProductName, effectiveParsed.productName)) {
          return false;
        }
      }

      return this.matchesLocation(product, effectiveParsed);
    });

    if (effectiveParsed.productName) {
      if (products.length === 0 && (effectiveParsed.warehouseName || effectiveParsed.blocName)) {
        const locationProducts = allProducts.filter((product) => this.matchesLocation(product, effectiveParsed));
        if (locationProducts.length > 0) {
          return this.respondToInventorySummary(effectiveParsed, locationProducts);
        }
      }

      return this.respondToProductQuery(effectiveParsed, products);
    }

    return this.respondToInventorySummary(effectiveParsed, products);
  }

  private async handleOrderStatusQuery(parsed: ParsedAssistantQuery, userRole: string): Promise<AssistantResponse> {
    if (!parsed.orderId) {
      return {
        intent: 'clarification',
        message: parsed.language === 'fr'
          ? 'Veuillez fournir un numero de commande. Par exemple : "Quel est le statut de la commande 123 ?"'
          : 'Please provide an order number. For example: "What is the status of order 123?"',
        query: parsed,
      };
    }

    const order = await this.prisma.order.findFirst({
      where: { id: parseInt(parsed.orderId) },
      include: {
        shipments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!order) {
      return {
        intent: 'clarification',
        message: parsed.language === 'fr'
          ? `Je n ai pas trouve la commande #${parsed.orderId}. Verifiez le numero puis reessayez.`
          : `I could not find order #${parsed.orderId}. Check the order number and try again.`,
        query: parsed,
      };
    }

    const shipmentStatus = order.shipments?.[0]?.status || order.status;
    return {
      intent: 'order_status',
      message: parsed.language === 'fr'
        ? `Statut de la commande #${parsed.orderId} : ${shipmentStatus}. Creee le ${new Date(order.createdAt).toLocaleDateString()}.`
        : `Order #${parsed.orderId} status: ${shipmentStatus}. Created on ${new Date(order.createdAt).toLocaleDateString()}.`,
      query: parsed,
      orders: [
        {
          id: order.id,
          orderNumber: `#${order.id}`,
          status: shipmentStatus,
          createdAt: order.createdAt,
        },
      ],
    };
  }

  private async handleLocationQuery(parsed: ParsedAssistantQuery, userRole: string): Promise<AssistantResponse> {
    if (!parsed.productName) {
      return {
        intent: 'clarification',
        message: parsed.language === 'fr'
          ? 'Quel produit voulez-vous localiser ? Par exemple : "Ou est stocke huile 2 ?"'
          : 'Which product would you like to locate? For example: "Where is oil 2 stored?"',
        query: parsed,
      };
    }

    if (userRole === 'CUSTOMER') {
      return {
        intent: 'forbidden',
        message: parsed.language === 'fr'
          ? 'Les informations d emplacement sont reservees au personnel.'
          : 'Location information is restricted to staff members.',
        query: parsed,
      };
    }

    const products = await this.prisma.product.findMany({
      where: { name: { contains: parsed.productName, mode: 'insensitive' } },
      include: {
        bloc: {
          include: {
            warehouse: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (products.length === 0) {
      return {
        intent: 'clarification',
        message: parsed.language === 'fr'
          ? `Je n ai pas trouve le produit "${parsed.productName}".`
          : `I could not find product "${parsed.productName}".`,
        query: parsed,
      };
    }

    const message = parsed.language === 'fr'
      ? `${parsed.productName} est stocke dans : ${products.map((p) => `Entrepot ${p.bloc.warehouse.name}, Bloc ${p.bloc.name}`).join('; ')}.`
      : `${parsed.productName} is stored in: ${products.map((p) => `Warehouse ${p.bloc.warehouse.name}, Bloc ${p.bloc.name}`).join('; ')}.`;

    return {
      intent: 'product_location',
      message,
      query: parsed,
      matches: products.map((p) => this.toMatch(p)),
    };
  }

  private async handleLowStockQuery(parsed: ParsedAssistantQuery, userRole: string): Promise<AssistantResponse> {
    if (userRole === 'CUSTOMER') {
      return {
        intent: 'forbidden',
        message: parsed.language === 'fr'
          ? 'Les informations de stock faible sont reservees au personnel.'
          : 'Low stock information is restricted to staff members.',
        query: parsed,
      };
    }

    const lowStockThreshold = 10; // Define threshold as needed
    const products = await this.prisma.product.findMany({
      where: {
        quantity: { lte: lowStockThreshold },
        ...(parsed.warehouseName && {
          bloc: {
            warehouse: { name: { contains: parsed.warehouseName, mode: 'insensitive' } },
          },
        }),
      },
      include: {
        bloc: {
          include: {
            warehouse: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { quantity: 'asc' },
    });

    if (products.length === 0) {
      return {
        intent: 'low_stock',
        message: parsed.language === 'fr'
          ? 'Aucun produit en stock faible dans l emplacement indique.'
          : 'No products with low stock in the specified location.',
        query: parsed,
      };
    }

    return {
      intent: 'low_stock',
      message: parsed.language === 'fr'
        ? `${products.length} produits trouves avec un stock faible (<= ${lowStockThreshold} unites).`
        : `Found ${products.length} products with low stock (≤${lowStockThreshold} units).`,
      query: parsed,
      totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
      matches: products.map((p) => this.toMatch(p)),
    };
  }

  private async handleCapacityQuery(parsed: ParsedAssistantQuery, userRole: string): Promise<AssistantResponse> {
    if (userRole === 'CUSTOMER') {
      return {
        intent: 'forbidden',
        message: parsed.language === 'fr'
          ? 'Les informations de capacite sont reservees au personnel.'
          : 'Capacity information is restricted to staff members.',
        query: parsed,
      };
    }

    // Assuming capacity is calculated as max_capacity - used_capacity
    // Adjust based on your actual schema
    return {
      intent: 'warehouse_capacity',
      message: parsed.language === 'fr'
        ? 'Les questions de capacite necessitent des donnees de capacite dans le schema. Veuillez configurer ce point d acces.'
        : 'Warehouse capacity queries require capacity data in your schema. Please configure this endpoint.',
      query: parsed,
    };
  }

  private async handleStockCheckQuery(parsed: ParsedAssistantQuery, userRole: string): Promise<AssistantResponse> {
    if (!parsed.productName) {
      return {
        intent: 'clarification',
        message: parsed.language === 'fr'
          ? 'Quel produit voulez-vous verifier ? Par exemple : "Avons-nous encore huile 2 ?"'
          : 'Which product would you like to check? For example: "Do we still have oil 2?"',
        query: parsed,
      };
    }

    const products = await this.prisma.product.findMany({
      where: { name: { contains: parsed.productName, mode: 'insensitive' } },
      include: {
        bloc: {
          include: {
            warehouse: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (products.length === 0) {
      return {
        intent: 'stock_check',
        message: parsed.language === 'fr'
          ? `Nous n avons pas "${parsed.productName}" en stock.`
          : `We do not have "${parsed.productName}" in stock.`,
        query: parsed,
      };
    }

    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const message = totalQuantity > 0
      ? parsed.language === 'fr'
        ? `Oui, nous avons ${totalQuantity} unites de "${parsed.productName}" en stock.`
        : `Yes, we have ${totalQuantity} units of "${parsed.productName}" in stock.`
      : parsed.language === 'fr'
        ? `Non, "${parsed.productName}" est en rupture de stock.`
        : `No, "${parsed.productName}" is out of stock.`;

    return {
      intent: 'stock_check',
      message,
      query: parsed,
      totalQuantity,
      matches: products.map((p) => this.toMatch(p)),
    };
  }

  private respondToProductQuery(
    parsed: ParsedAssistantQuery,
    products: Array<{
      id: number;
      name: string;
      quantity: number;
      bloc: { name: string; warehouse: { name: string } };
    }>,
  ): AssistantResponse {
    if (products.length === 0) {
      return {
        intent: 'clarification',
        message: parsed.language === 'fr'
          ? parsed.warehouseName || parsed.blocName
            ? `Je n ai pas trouve "${parsed.productName}" dans l emplacement demande. Essayez un autre produit ou un emplacement plus large.`
            : `Je n ai trouve aucun produit correspondant a "${parsed.productName}".`
          : parsed.warehouseName || parsed.blocName
            ? `I could not find "${parsed.productName}" in the requested location. Try another product or a broader location.`
            : `I could not find any product matching "${parsed.productName}".`,
        query: parsed,
      };
    }

    const exactName = this.normalizeText(parsed.productName ?? '');
    const exactMatches = products.filter((product) => this.normalizeText(product.name) === exactName);
    const matches = exactMatches.length > 0 ? exactMatches : products;

    if (matches.length > 1 && !parsed.warehouseName && !parsed.blocName) {
      return {
        intent: 'clarification',
        message: parsed.language === 'fr'
          ? `J ai trouve plusieurs correspondances pour "${parsed.productName}". Ajoutez un entrepot ou un bloc pour affiner.`
          : `I found multiple matches for "${parsed.productName}". Add a warehouse or bloc name to narrow it down.`,
        query: parsed,
        matches: matches.slice(0, 5).map((product) => this.toMatch(product)),
      };
    }

    const totalQuantity = matches.reduce((sum, product) => sum + product.quantity, 0);

    if (matches.length === 1) {
      const product = matches[0];
      return {
        intent: 'stock_quantity',
        message: parsed.language === 'fr'
          ? `Vous avez ${product.quantity} unites de ${product.name} dans l entrepot ${product.bloc.warehouse.name}, bloc ${product.bloc.name}.`
          : `You have ${product.quantity} units of ${product.name} in warehouse ${product.bloc.warehouse.name}, bloc ${product.bloc.name}.`,
        query: parsed,
        totalQuantity: product.quantity,
        matches: [this.toMatch(product)],
      };
    }

    return {
      intent: 'stock_quantity',
      message: parsed.language === 'fr'
        ? `J ai trouve ${matches.length} entrees pour ${parsed.productName} avec un total de ${totalQuantity} unites.`
        : `I found ${matches.length} entries for ${parsed.productName} with a total of ${totalQuantity} units.`,
      query: parsed,
      totalQuantity,
      matches: matches.map((product) => this.toMatch(product)),
    };
  }

  private respondToInventorySummary(
    parsed: ParsedAssistantQuery,
    products: Array<{
      id: number;
      name: string;
      quantity: number;
      bloc: { name: string; warehouse: { name: string } };
    }>,
  ): AssistantResponse {
    if (products.length === 0) {
      return {
        intent: 'clarification',
        message: parsed.language === 'fr'
          ? parsed.warehouseName || parsed.blocName
            ? 'Je n ai pas trouve de stock dans cet emplacement. Verifiez le nom de l entrepot ou du bloc puis reessayez.'
            : 'Je n ai trouve aucun stock correspondant a cette question.'
          : parsed.warehouseName || parsed.blocName
            ? 'I could not find stock in that location. Check the warehouse or bloc name and try again.'
            : 'I could not find any stock matching that question.',
        query: parsed,
      };
    }

    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

    return {
      intent: 'inventory_summary',
      message: parsed.language === 'fr'
        ? parsed.blocName || parsed.warehouseName
          ? `J ai trouve ${products.length} entrees produit dans l emplacement demande, avec ${totalQuantity} unites au total.`
          : `J ai trouve ${products.length} entrees produit en stock, avec ${totalQuantity} unites au total dans l entrepot.`
        : parsed.blocName || parsed.warehouseName
          ? `I found ${products.length} product entries in the requested location, with ${totalQuantity} total units.`
          : `I found ${products.length} stocked product entries, with ${totalQuantity} total units across the warehouse.`,
      query: parsed,
      totalQuantity,
      matches: products.slice(0, 8).map((product) => this.toMatch(product)),
    };
  }
}
