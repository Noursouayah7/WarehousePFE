const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export type CreateContactRequestPayload = {
  email: string;
  phone: string;
  reason: string;
};

function parseErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  const message = (data as Record<string, unknown>).message;
  if (typeof message === 'string') {
    return message;
  }

  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join(', ');
  }

  return fallback;
}

export async function createContactRequest(payload: CreateContactRequestPayload): Promise<void> {
  const response = await fetch(`${API_URL}/contact-requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, 'Failed to send contact request'));
  }
}
