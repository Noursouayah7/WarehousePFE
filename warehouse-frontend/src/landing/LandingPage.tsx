'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Archivo_Black } from 'next/font/google';
import { motion } from 'framer-motion';

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
});

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stats = [
  { value: '100%', label: 'Traceable batches' },
  { value: '24h', label: 'Inventory visibility' },
  { value: '7', label: 'Quality checkpoints' },
  { value: '1', label: 'Factory story' },
];

const productCards = [
  {
    name: 'Extra Virgin Reserve',
    note: 'Cold pressed from selected Tunisian olives with a clean, balanced finish.',
    tone: 'from-[var(--role-customer)] to-[var(--role-manager)]',
  },
  {
    name: 'Organic Heritage Blend',
    note: 'A softer profile shaped for everyday tables, hospitality, and retail shelves.',
    tone: 'from-[var(--color-warning)] to-[var(--role-admin)]',
  },
  {
    name: 'Factory Signature Edition',
    note: 'The flagship expression of our factory, prepared for export and gifting.',
    tone: 'from-[var(--role-manager)] to-[var(--foreground)]',
  },
];

const factorySteps = [
  {
    title: 'Harvest selection',
    text: 'Only well-timed olives enter the process, protecting aroma and freshness from the start.',
  },
  {
    title: 'Careful pressing',
    text: 'The factory keeps pressing conditions controlled so the oil stays bright, clean, and expressive.',
  },
  {
    title: 'Elegant packaging',
    text: 'Final presentation is kept refined and export-ready, with attention to every label and bottle.',
  },
];

const values = [
  'Tunisian olive heritage',
  'Consistent quality checks',
  'Careful storage and handling',
  'Export-ready presentation',
  'Sustainable operations',
  'A factory with a clear identity',
];

const contactReasonOptions = [
  'General inquiry',
  'Product information',
  'Visit the factory',
  'Wholesale request',
  'Other',
];

type ContactFormState = {
  email: string;
  phone: string;
  reason: string;
};

export function LandingPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormState>({
    email: '',
    phone: '',
    reason: 'General inquiry',
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (!showSuccessToast) return;

    const timeoutId = window.setTimeout(() => {
      setShowSuccessToast(false);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showSuccessToast]);

  function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsContactOpen(false);
    setContactForm({
      email: '',
      phone: '',
      reason: 'General inquiry',
    });
    setShowSuccessToast(true);
  }

  return (
    <main className="overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <section className="relative isolate min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(47,118,246,0.12),transparent_26%),radial-gradient(circle_at_85%_14%,rgba(88,129,87,0.10),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.6)_0%,rgba(244,246,248,0.96)_100%)]" />
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:84px_84px]" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[-12%] top-24 h-80 w-80 rounded-full bg-[var(--role-customer)]/12 blur-3xl" />
          <div className="absolute right-[-10%] top-40 h-96 w-96 rounded-full bg-[var(--color-warning)]/12 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 py-6 lg:px-10">
          <motion.header
            className="flex items-center justify-between rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--muted-foreground)]">WMS</p>
              <p className="text-sm font-medium text-[var(--foreground)]">Olive oil factory</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-full border border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]">
                Login
              </Link>
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="rounded-full border border-[var(--role-admin)]/30 bg-[var(--role-admin)] px-4 py-2 text-sm font-semibold text-black transition hover:opacity-95"
              >
                Contact us
              </button>
              <Link href="#story" className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)] transition hover:bg-[var(--secondary)]">
                Our story
              </Link>
            </div>
          </motion.header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
            <motion.div className="w-full text-left" variants={container} initial="hidden" animate="visible">
              <motion.span
                variants={item}
                className="inline-flex rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--muted-foreground)] backdrop-blur"
              >
                Tunisian heritage, crafted with care
              </motion.span>

              <motion.h1
                variants={item}
                className={`${archivoBlack.className} mt-6 max-w-4xl text-5xl leading-[0.96] tracking-tight text-[var(--foreground)] lg:text-7xl`}
              >
                A refined olive oil factory built on heritage, precision, and care.
              </motion.h1>

              <motion.p variants={item} className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted-foreground)]">
                We bring together carefully selected Tunisian olives, disciplined production, elegant packaging, and a clear commitment to quality. The result is a factory story that feels premium, honest, and easy to trust.
              </motion.p>

              <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="rounded-full border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] backdrop-blur transition hover:bg-[var(--secondary)]">
                  Login
                </Link>
                <button
                  type="button"
                  onClick={() => setIsContactOpen(true)}
                  className="rounded-full border border-[var(--role-admin)]/30 bg-[var(--role-admin)] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-95"
                >
                  Contact us
                </button>
                <Link href="#story" className="rounded-full border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] backdrop-blur transition hover:bg-[var(--secondary)]">
                  Learn about the factory
                </Link>
              </motion.div>

              <motion.div variants={item} className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 text-left shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                    <p className="text-3xl font-semibold text-[var(--role-admin)] [font-family:var(--font-display)]">{stat.value}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{stat.label}</p>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={item} className="mt-10 rounded-[2.2rem] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="grid gap-4 md:grid-cols-3">
                  {factorySteps.map((step, index) => (
                    <div key={step.title} className="rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(180deg,var(--secondary)_0%,var(--background)_100%)] p-5 text-left">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">0{index + 1}</p>
                      <h3 className={`${archivoBlack.className} mt-3 text-xl tracking-tight`}>{step.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{step.text}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.96, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15 }}
            >
              <div className="absolute inset-6 rounded-[36px] bg-[radial-gradient(circle_at_30%_30%,rgba(47,118,246,0.12),transparent_28%),radial-gradient(circle_at_65%_20%,rgba(88,129,87,0.12),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.26),rgba(255,255,255,0.10))] blur-2xl" />
              <div className="relative overflow-hidden rounded-[36px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl">
                <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--secondary)_0%,var(--background)_100%)] p-5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Factory at a glance</p>
                  <h2 className={`${archivoBlack.className} mt-3 text-3xl leading-tight text-[var(--foreground)] lg:text-5xl`}>
                    Quality you can see, heritage you can trust.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
                    From harvest selection to packaging, each step is handled with care so the factory presents a premium, trustworthy identity to every visitor.
                  </p>

                  <div className="mt-6 grid gap-4">
                    {[
                      'Authentic Tunisian sourcing',
                      'Controlled production and storage',
                      'Export-ready packaging and traceability',
                    ].map((point) => (
                      <div key={point} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Section id="story" title="The factory story" subtitle="Built around care, not noise">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ['Tunisian sourcing', 'We start with olives that reflect the character of the region and the rhythm of the harvest.'],
            ['Precision handling', 'Storage, movement, and packaging are handled with discipline to preserve quality end to end.'],
            ['A clear identity', 'Everything the visitor sees should feel calm, premium, and rooted in the factory itself.'],
          ].map(([title, text]) => (
            <motion.article key={title} variants={item} className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm">
              <div className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--role-manager)]">✦</div>
              <h3 className="text-xl font-semibold tracking-tight [font-family:var(--font-display)]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{text}</p>
            </motion.article>
          ))}
        </div>
      </Section>

      <Section id="products" title="Selected collections" subtitle="A calm showcase of the range">
        <div className="grid gap-5 md:grid-cols-3">
          {productCards.map((product) => (
            <motion.article
              key={product.name}
              variants={item}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-5 text-left shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all"
            >
              <div className={`h-64 rounded-[24px] bg-gradient-to-br ${product.tone} p-5 shadow-inner`}>
                <div className="flex h-full flex-col justify-between rounded-[22px] border border-white/15 bg-white/8 p-4 text-white backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">WMS</p>
                      <p className="mt-2 text-2xl font-semibold leading-tight [font-family:var(--font-display)]">{product.name}</p>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-end text-right text-sm text-white/76">
                    <span>250ml / 500ml / 1L · prepared with care</span>
                  </div>
                </div>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight [font-family:var(--font-display)]">{product.name}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{product.note}</p>
            </motion.article>
          ))}
        </div>
      </Section>

      <Section title="What defines us" subtitle="A premium public face">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {values.map((title) => (
            <motion.article key={title} variants={item} whileHover={{ y: -5 }} className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-[0_16px_35px_rgba(15,23,42,0.06)] transition">
              <div className="mx-auto mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--role-admin)]">●</div>
              <h3 className="text-xl font-semibold tracking-tight [font-family:var(--font-display)]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                Presented with a calm, modern visual language that keeps the factory front and center.
              </p>
            </motion.article>
          ))}
        </div>
      </Section>

      <Section title="Visit the factory" subtitle="A final invitation">
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.article variants={item} className="rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-8 text-left shadow-[0_16px_35px_rgba(15,23,42,0.06)]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">Factory presence</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight [font-family:var(--font-display)]">A cleaner, calmer, more credible first impression.</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--muted-foreground)]">
              This page is meant to welcome visitors, show the identity of the factory, and communicate quality without overwhelming them with internal application details.
            </p>
          </motion.article>

          <motion.article variants={item} className="rounded-[30px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--secondary)_0%,var(--muted)_100%)] p-8 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">Quick links</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="rounded-full border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-white"
              >
                Contact us
              </button>
            </div>
          </motion.article>
        </div>
      </Section>

      {isContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-xl rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_30px_90px_rgba(15,23,42,0.22)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Contact us</p>
                <h2 className={`${archivoBlack.className} mt-2 text-3xl text-[var(--foreground)]`}>Tell us what you need</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsContactOpen(false)}
                className="rounded-full px-3 py-2 text-lg leading-none text-[var(--muted-foreground)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                aria-label="Close contact form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-[var(--foreground)]">
                  E-mail
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
                    className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--ring)]"
                    placeholder="your@email.com"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-[var(--foreground)]">
                  Phone number
                  <input
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(event) => setContactForm((current) => ({ ...current, phone: event.target.value }))}
                    className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--ring)]"
                    placeholder="+216 ..."
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-[var(--foreground)]">
                Contact reason
                <select
                  value={contactForm.reason}
                  onChange={(event) => setContactForm((current) => ({ ...current, reason: event.target.value }))}
                  className="rounded-xl border border-[var(--input)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--ring)]"
                >
                  {contactReasonOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsContactOpen(false)}
                  className="rounded-full border border-[var(--border)] bg-[var(--secondary)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[var(--role-admin)] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-95"
                >
                  Send request
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">Request received</p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">We will contact you soon, thank you for your interest.</p>
        </div>
      )}

    </main>
  );
}

function Section({
  title,
  subtitle,
  children,
  id,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
      <motion.div
        className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] px-6 py-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-sm lg:px-8 lg:py-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">{subtitle}</p>
        <h2 className={`${archivoBlack.className} mt-3 text-3xl text-[var(--foreground)] lg:text-5xl`}>{title}</h2>
        <div className="mt-8">{children}</div>
      </motion.div>
    </section>
  );
}
