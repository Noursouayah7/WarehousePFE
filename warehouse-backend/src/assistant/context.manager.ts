import { Injectable, Logger } from '@nestjs/common';

export interface ConversationContext {
  userId: string;
  lastQuery: string;
  lastIntent: string;
  lastExtractedEntities: {
    product?: string;
    warehouse?: string;
    bloc?: string;
    order?: string;
  };
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    message: string;
    intent?: string;
    timestamp: Date;
  }>;
  clarificationAsked: boolean;
  lastAskedAbout?: string;
}

@Injectable()
export class ContextManager {
  private readonly logger = new Logger(ContextManager.name);
  private contexts: Map<string, ConversationContext> = new Map();

  /**
   * Create or retrieve user's conversation context
   */
  getContext(userId: string): ConversationContext {
    if (!this.contexts.has(userId)) {
      this.contexts.set(userId, {
        userId,
        lastQuery: '',
        lastIntent: '',
        lastExtractedEntities: {},
        conversationHistory: [],
        clarificationAsked: false,
      });
    }
    return this.contexts.get(userId)!;
  }

  /**
   * Update context with new query
   */
  updateContextWithQuery(
    userId: string,
    message: string,
    intent: string,
    extractedEntities: {
      product?: string;
      warehouse?: string;
      bloc?: string;
      order?: string;
    },
  ): void {
    const context = this.getContext(userId);
    context.lastQuery = message;
    context.lastIntent = intent;
    context.lastExtractedEntities = extractedEntities;
    context.conversationHistory.push({
      role: 'user',
      message,
      intent,
      timestamp: new Date(),
    });
    context.clarificationAsked = false;
  }

  /**
   * Update context with assistant response
   */
  updateContextWithResponse(userId: string, message: string, intent: string): void {
    const context = this.getContext(userId);
    context.conversationHistory.push({
      role: 'assistant',
      message,
      intent,
      timestamp: new Date(),
    });
  }

  /**
   * Mark that assistant asked for clarification
   */
  markClarificationAsked(userId: string, about: string): void {
    const context = this.getContext(userId);
    context.clarificationAsked = true;
    context.lastAskedAbout = about;
  }

  /**
   * Get previous context for follow-up queries
   * e.g., "User: How much oil 2? Bot: In which warehouse? User: warehouse 1"
   */
  getPreviousContext(userId: string): Partial<ConversationContext> | null {
    const context = this.getContext(userId);
    if (context.conversationHistory.length < 2) {
      return null;
    }

    // Return last assistant message and last extracted entities
    const lastAssistantMsg = [...context.conversationHistory].reverse().find((msg) => msg.role === 'assistant');

    return lastAssistantMsg
      ? {
          lastQuery: context.lastQuery,
          lastIntent: context.lastIntent,
          lastExtractedEntities: context.lastExtractedEntities,
          lastAskedAbout: context.lastAskedAbout,
        }
      : null;
  }

  /**
   * Fill missing entities from previous context
   * e.g., If previous query had product "oil 2", use it in follow-up
   */
  fillMissingEntitiesFromContext(
    userId: string,
    currentEntities: {
      product?: string;
      warehouse?: string;
      bloc?: string;
    },
  ): {
    product?: string;
    warehouse?: string;
    bloc?: string;
  } {
    const context = this.getContext(userId);
    const previousEntities = context.lastExtractedEntities;

    // Fill missing entities with previous context
    return {
      product: currentEntities.product || previousEntities.product,
      warehouse: currentEntities.warehouse || previousEntities.warehouse,
      bloc: currentEntities.bloc || previousEntities.bloc,
    };
  }

  /**
   * Check if this is a follow-up query
   * e.g., User first asks about "oil 2", next asks "what about warehouse 1"
   */
  isFollowUpQuery(userId: string): boolean {
    const context = this.getContext(userId);
    if (context.conversationHistory.length < 1) {
      return false;
    }

    const lastMessage = context.conversationHistory[context.conversationHistory.length - 1];
    return lastMessage.role === 'assistant';
  }

  /**
   * Clear context for user (start fresh conversation)
   */
  clearContext(userId: string): void {
    this.contexts.delete(userId);
  }

  /**
   * Get conversation history for user
   */
  getConversationHistory(userId: string, limit: number = 10): ConversationContext['conversationHistory'] {
    const context = this.getContext(userId);
    return context.conversationHistory.slice(-limit);
  }

  /**
   * Get all active conversations (for admin monitoring)
   */
  getActiveConversations(): ConversationContext[] {
    return Array.from(this.contexts.values());
  }

  /**
   * Cleanup old conversations (older than 24 hours)
   */
  cleanupOldConversations(olderThanHours: number = 24): number {
    const now = new Date();
    let removed = 0;

    for (const [userId, context] of this.contexts.entries()) {
      if (context.conversationHistory.length === 0) {
        this.contexts.delete(userId);
        removed++;
        continue;
      }

      const lastMessage = context.conversationHistory[context.conversationHistory.length - 1];
      const hoursOld = (now.getTime() - lastMessage.timestamp.getTime()) / (1000 * 60 * 60);

      if (hoursOld > olderThanHours) {
        this.contexts.delete(userId);
        removed++;
      }
    }

    if (removed > 0) {
      this.logger.log(`Cleaned up ${removed} old conversations`);
    }

    return removed;
  }
}
