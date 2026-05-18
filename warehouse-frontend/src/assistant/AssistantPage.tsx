'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/src/auth/AuthProvider';
import {
  askAssistant,
  AssistantHistoryEntry,
  AssistantResponse,
  getAssistantHistory,
} from './assistant.api';

type ChatEntry = {
  id: number;
  role: 'user' | 'assistant' | 'error';
  text: string;
  response?: AssistantResponse;
  timestamp?: string;
};

const starterPrompts = [
  'How much stock do we have for olive oil?',
  'Where is product B stored?',
  'What is the status of order 123?',
  'Which items are almost out of stock?',
];

export default function AssistantPage() {
  const { token, role } = useAuth();
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<ChatEntry[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Hi. I can help with stock, locations, low-stock alerts, and order tracking.',
    },
  ]);
  const [history, setHistory] = useState<AssistantHistoryEntry[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const historyPreview = useMemo(() => {
    return [...history]
      .filter((item) => item.role === 'user')
      .slice(-16)
      .reverse();
  }, [history]);

  useEffect(() => {
    if (!token) {
      setHistory([]);
      return;
    }

    let isMounted = true;
    setIsLoadingHistory(true);
    setHistoryError(null);

    void getAssistantHistory(token)
      .then((items) => {
        if (!isMounted) {
          return;
        }
        setHistory(items);
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }
        const message = err instanceof Error ? err.message : 'Could not load conversation history.';
        setHistoryError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function submitQuery(message: string) {
    if (!token) {
      setError('Missing auth token. Please login again.');
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      setError('Type a question first.');
      return;
    }

    const nextUserEntry: ChatEntry = {
      id: Date.now(),
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    setEntries((current) => [...current, nextUserEntry]);
    setIsSending(true);
    setError(null);
    setInput('');

    try {
      const response = await askAssistant(token, trimmed);
      setEntries((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: response.message,
          response,
          timestamp: new Date().toISOString(),
        },
      ]);

      const refreshedHistory = await getAssistantHistory(token);
      setHistory(refreshedHistory);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Assistant request failed';
      setError(message);
      setEntries((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'error',
          text: message,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submitQuery(input);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,_rgba(18,82,132,0.18),_transparent_35%),radial-gradient(circle_at_95%_10%,_rgba(11,122,96,0.12),_transparent_32%),linear-gradient(165deg,_#edf3f7_0%,_#f8faf9_55%,_#f2f6f4_100%)] text-[var(--foreground)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1440px] gap-5 px-3 py-4 md:grid-cols-[320px_1fr] md:px-6 md:py-6">
        <aside className="rounded-[28px] border border-[rgba(19,54,79,0.14)] bg-white/80 p-5 shadow-[0_20px_45px_rgba(8,30,49,0.12)] backdrop-blur-xl">
          <div className="rounded-2xl bg-[linear-gradient(130deg,_#114b7a_0%,_#0a6f63_100%)] p-4 text-white">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/80">Assistant</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight">Warehouse Copilot</h1>
            <p className="mt-2 text-sm text-white/85">Ask in plain language. Get instant operations answers.</p>
            <div className="mt-4 rounded-xl bg-white/15 px-3 py-2 text-xs">
              Logged in as <span className="font-semibold">{role ?? 'guest'}</span>
            </div>
          </div>

          <section className="mt-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">Historique</h2>
              {isLoadingHistory && <span className="text-xs text-[var(--muted-foreground)]">Loading...</span>}
            </div>
            {historyError && <p className="mt-2 rounded-lg bg-[var(--tint-error)] px-2 py-1 text-xs text-[var(--color-error)]">{historyError}</p>}
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {historyPreview.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[var(--border)] bg-white/70 px-3 py-3 text-xs text-[var(--muted-foreground)]">
                  No previous conversation yet.
                </p>
              ) : (
                historyPreview.map((item, index) => (
                  <button
                    key={`${item.timestamp}_${index}`}
                    type="button"
                    onClick={() => setInput(item.message)}
                    className="w-full rounded-xl border border-[rgba(17,75,122,0.14)] bg-white/90 px-3 py-2 text-left transition hover:border-[rgba(10,111,99,0.45)] hover:bg-white"
                  >
                    <p className="line-clamp-2 text-sm text-[var(--foreground)]">{item.message}</p>
                    <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">{new Date(item.timestamp).toLocaleString()}</p>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="mt-5 space-y-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="w-full rounded-xl border border-[var(--border)] bg-white/90 px-3 py-2 text-left text-sm transition hover:border-[var(--ring)] hover:bg-white"
              >
                {prompt}
              </button>
            ))}
          </section>
        </aside>

        <section className="flex min-h-[80vh] flex-col rounded-[30px] border border-[rgba(19,54,79,0.12)] bg-white/86 shadow-[0_22px_55px_rgba(8,30,49,0.1)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-[rgba(19,54,79,0.1)] px-5 py-4 md:px-7">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Live chat</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Conversation</h2>
            </div>
            {isSending ? (
              <span className="rounded-full bg-[var(--tint-info)] px-3 py-1 text-xs font-medium text-[var(--color-info)] animate-pulse">
                Thinking...
              </span>
            ) : null}
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 md:px-7">
            {entries.map((entry) => (
              <div key={entry.id} className={entry.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={[
                    'max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-[0_10px_28px_rgba(15,55,83,0.08)]',
                    entry.role === 'user'
                      ? 'bg-[linear-gradient(135deg,_#114b7a_0%,_#0a6f63_100%)] text-white'
                      : entry.role === 'error'
                        ? 'bg-[var(--tint-error)] text-[var(--color-error)]'
                        : 'border border-[var(--border)] bg-[linear-gradient(180deg,_#fbfdfd_0%,_#f4f8f7_100%)] text-[var(--foreground)]',
                  ].join(' ')}
                >
                  <p>{entry.text}</p>

                  {entry.response?.matches && entry.response.matches.length > 0 && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-[rgba(18,82,132,0.18)] bg-white/80 text-[13px] text-[var(--foreground)]">
                      <div className="grid grid-cols-[1.3fr_1.2fr_0.6fr] border-b border-[var(--border)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                        <span>Product</span>
                        <span>Location</span>
                        <span>Qty</span>
                      </div>
                      {entry.response.matches.map((match) => (
                        <div key={match.id} className="grid grid-cols-[1.3fr_1.2fr_0.6fr] border-b border-[var(--border)] px-3 py-2 last:border-b-0">
                          <span>{match.productName}</span>
                          <span>
                            {match.warehouseName} / {match.blocName}
                          </span>
                          <span>{match.quantity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {typeof entry.response?.totalQuantity === 'number' && (
                    <p className="mt-2 text-xs text-[var(--muted-foreground)]">Total units: {entry.response.totalQuantity}</p>
                  )}

                  {entry.timestamp ? (
                    <p className="mt-2 text-[11px] text-[var(--muted-foreground)]">{new Date(entry.timestamp).toLocaleTimeString()}</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[rgba(19,54,79,0.1)] p-4 md:p-5">
            {error ? <p className="mb-3 rounded-xl bg-[var(--tint-error)] px-4 py-2 text-sm text-[var(--color-error)]">{error}</p> : null}
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask stock, location, low stock, or order status..."
                className="flex-1 rounded-2xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)]"
              />
              <button
                type="submit"
                disabled={isSending}
                className="rounded-2xl bg-[linear-gradient(135deg,_#114b7a_0%,_#0a6f63_100%)] px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}