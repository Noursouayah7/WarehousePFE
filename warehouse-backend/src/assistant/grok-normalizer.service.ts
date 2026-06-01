import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class GrokNormalizerService {
  private readonly logger = new Logger(GrokNormalizerService.name);
  private readonly enabled = this.parseBoolean(process.env.GROK_ASSISTANT_ENABLED);
  private readonly apiKey = process.env.GROK_API_KEY ?? '';
  private readonly apiUrl = process.env.GROK_API_URL ?? 'https://api.x.ai/v1/chat/completions';
  private readonly model = process.env.GROK_MODEL ?? 'grok-3-mini';
  private readonly timeoutMs = this.parseNumber(process.env.GROK_TIMEOUT_MS, 1500);
  private readonly maxInputChars = this.parseNumber(process.env.GROK_MAX_INPUT_CHARS, 500);

  async normalizeMessage(message: string): Promise<string | null> {
    if (!this.enabled || !this.apiKey) {
      return null;
    }

    const normalizedInput = this.sanitizeInput(message);
    if (!normalizedInput) {
      return null;
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0,
          max_tokens: 120,
          messages: [
            {
              role: 'system',
              content:
                'Normalize warehouse assistant user queries. Keep only the meaning of the request. Do not invent facts, do not change order numbers, product names, warehouse names, or bloc names. Return a single short sentence.',
            },
            {
              role: 'user',
              content: normalizedInput,
            },
          ],
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Grok normalization failed with status ${response.status}`);
        return null;
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const normalizedOutput = this.extractText(payload);

      return this.sanitizeOutput(normalizedOutput);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';
      this.logger.warn(`Grok normalization unavailable: ${reason}`);
      return null;
    } finally {
      clearTimeout(timeoutHandle);
    }
  }

  private parseBoolean(value: string | undefined): boolean {
    return value === 'true' || value === '1' || value === 'yes';
  }

  private parseNumber(value: string | undefined, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private sanitizeInput(value: string): string {
    return value
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
      .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, '[redacted-phone]')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, this.maxInputChars);
  }

  private sanitizeOutput(value: string): string | null {
    const cleaned = value.replace(/\s+/g, ' ').trim();
    return cleaned.length > 0 ? cleaned : null;
  }

  private extractText(payload: Record<string, unknown>): string {
    const choices = payload.choices as Array<{ message?: { content?: unknown }; text?: unknown }> | undefined;
    const choiceContent = choices?.[0]?.message?.content;
    if (typeof choiceContent === 'string') {
      return choiceContent;
    }

    if (Array.isArray(choiceContent)) {
      const parts = choiceContent
        .map((part) => {
          if (typeof part === 'string') {
            return part;
          }

          if (part && typeof part === 'object' && 'text' in part) {
            const text = (part as { text?: unknown }).text;
            return typeof text === 'string' ? text : '';
          }

          return '';
        })
        .filter(Boolean);

      if (parts.length > 0) {
        return parts.join(' ');
      }
    }

    if (choices?.[0] && typeof choices[0].text === 'string') {
      return choices[0].text;
    }

    const outputText = payload.output_text;
    if (typeof outputText === 'string') {
      return outputText;
    }

    const text = payload.text;
    if (typeof text === 'string') {
      return text;
    }

    return '';
  }
}