'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

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
  { value: 'AI', label: 'Operations support' },
];

const products = [
  {
    name: 'Extra Virgin Reserve',
    note: 'Cold pressed from selected Tunisian olives with export-grade bottling.',
    tone: 'from-[var(--role-customer)] to-[var(--role-manager)]',
  },
  {
    name: 'Organic Heritage Blend',
    note: 'Balanced aroma, premium packaging, and a refined golden finish.',
    tone: 'from-[var(--color-warning)] to-[var(--role-admin)]',
  },
  {
    name: 'Factory Signature Edition',
    note: 'Designed for hospitality, retail shelves, and international distribution.',
    tone: 'from-[var(--role-manager)] to-[var(--foreground)]',
  },
];

const chooseUs = [
  'Premium Olive Selection',
  'Smart Inventory Management',
  'Fast Delivery & Traceability',
  'Sustainable Production',
  'AI-powered Operations',
  'High Quality Standards',
];

export function LandingPage() {
  return (
    <main className="overflow-hidden bg-[linear-gradient(180deg,var(--background)_0%,var(--secondary)_30%,var(--muted)_100%)] text-[var(--foreground)]">
      <section className="relative isolate min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(94,117,53,0.20),_transparent_30%),radial-gradient(circle_at_85%_12%,_rgba(184,157,91,0.20),_transparent_22%),linear-gradient(135deg,_rgba(17,25,14,0.72)_0%,_rgba(17,25,14,0.35)_42%,_rgba(255,248,235,0.08)_100%)]" />
        <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-[var(--role-customer)]/25 blur-3xl" />
          <div className="absolute right-[-12%] top-40 h-96 w-96 rounded-full bg-[var(--color-warning)]/20 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 lg:px-10">
          <motion.header
            className="flex items-center justify-between rounded-full border border-white/18 bg-white/10 px-4 py-3 text-white shadow-[0_20px_50px_rgba(10,14,8,0.22)] backdrop-blur-xl"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-white/70">Cerebro Solutions</p>
              <p className="text-sm font-medium text-white/90">Premium Olive Oil Factory</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="#products" className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/16">
                Discover Products
              </Link>
              <Link href="/login" className="rounded-full border border-white/15 bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--tint-warning)]">
                Login
              </Link>
            </div>
          </motion.header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
            <motion.div className="max-w-3xl text-white" variants={container} initial="hidden" animate="visible">
                <motion.span
                variants={item}
                className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-1 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--muted-foreground)] backdrop-blur"
              >
                Tunisian olive excellence · intelligent operations
              </motion.span>

              <motion.h1 variants={item} className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-tight lg:text-7xl [font-family:var(--font-display)]">
                Premium Olive Oil Production Powered by Intelligent Warehouse Management
              </motion.h1>

              <motion.p variants={item} className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
                We combine high-quality olive selection, smart storage, shipment tracking, predictive analytics, and AI-powered inventory management to protect freshness, traceability, and export-grade quality from the grove to the bottle.
              </motion.p>

              <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
                <Link href="#products" className="rounded-full bg-[var(--secondary)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] shadow-[0_16px_40px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-white">
                  Discover Products
                </Link>
                <Link href="/login" className="rounded-full border border-white/18 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18">
                  Login
                </Link>
                <Link href="/register" className="rounded-full border border-[var(--color-warning)]/50 bg-[var(--color-warning)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:opacity-95">
                  Get Started
                </Link>
              </motion.div>

              <motion.div variants={item} className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/14 bg-white/10 p-4 shadow-[0_12px_30px_rgba(6,10,5,0.16)] backdrop-blur-xl">
                    <p className="text-3xl font-semibold text-[var(--tint-info)] [font-family:var(--font-display)]">{stat.value}</p>
                    <p className="mt-1 text-sm text-white/76">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15 }}
            >
              <div className="absolute inset-6 rounded-[36px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_65%_20%,rgba(201,176,109,0.18),transparent_24%),linear-gradient(135deg,rgba(62,72,26,0.35),rgba(19,23,13,0.18))] blur-2xl" />
              <div className="relative overflow-hidden rounded-[36px] border border-white/15 bg-white/12 p-5 shadow-[0_30px_80px_rgba(10,14,8,0.28)] backdrop-blur-2xl">
                <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(247,240,223,0.18),rgba(255,255,255,0.04))] p-4">
                  <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                    <div className="rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_35%),linear-gradient(180deg,var(--role-manager)_0%,var(--foreground)_100%)] p-5 text-white shadow-inner">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/64">Olive grove to bottle</p>
                      <div className="mt-6 flex items-end gap-3">
                        <div className="h-20 w-10 rounded-t-full bg-[var(--role-customer)] shadow-[0_0_0_1px_rgba(255,255,255,0.10)]" />
                        <div className="h-28 w-10 rounded-t-full bg-[var(--role-customer)]" />
                        <div className="h-24 w-10 rounded-t-full bg-[var(--role-customer)]" />
                        <div className="h-36 w-10 rounded-t-full bg-[var(--role-customer)]" />
                        <div className="h-18 w-10 rounded-t-full bg-[var(--role-customer)]" />
                      </div>
                      <div className="mt-6 rounded-3xl border border-white/12 bg-white/8 p-4">
                        <p className="text-sm font-medium">Freshness, authenticity, and traceability from harvest to shipment.</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--foreground)] shadow-sm">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">Factory commitment</p>
                        <p className="mt-3 text-2xl font-semibold leading-tight [font-family:var(--font-display)]">Premium Tunisian olive heritage, refined for international standards.</p>
                      </div>
                      <div className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,var(--secondary)_0%,var(--muted)_100%)] p-5 text-[var(--foreground)] shadow-sm">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">Traceability</p>
                        <p className="mt-3 text-sm leading-7">Smart warehouse control keeps every batch visible, every movement recorded, and every order ready for precise delivery.</p>
                      </div>
                      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-5 text-[var(--foreground)] shadow-sm">
                        <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">Innovation</p>
                        <p className="mt-3 text-sm leading-7">AI assistant support, predictive analytics, and intelligent inventory operations for a modern factory experience.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Section title="About the factory" subtitle="Premium production with modern operations">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ['Premium olive selection', 'We work with carefully selected Tunisian olives to preserve freshness, authenticity, and a rich aromatic profile.'],
            ['Quality control and traceability', 'Each batch follows strict quality checkpoints, packaging standards, and end-to-end traceability.'],
            ['Sustainable logistics', 'Modern storage and logistics reduce waste while keeping the factory aligned with long-term sustainability goals.'],
          ].map(([title, text]) => (
            <motion.article key={title} variants={item} className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_18px_40px_rgba(65,50,20,0.06)] backdrop-blur-sm">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--role-manager)]">✦</div>
              <h3 className="text-xl font-semibold tracking-tight [font-family:var(--font-display)]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">{text}</p>
            </motion.article>
          ))}
        </div>
      </Section>

      <Section id="products" title="Product showcase" subtitle="Export-quality olive oil products and premium packaging">
        <div className="grid gap-5 md:grid-cols-3">
          {products.map((product) => (
            <motion.article key={product.name} variants={item} whileHover={{ y: -6 }} className="group overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_16px_40px_rgba(70,50,20,0.07)] transition-all">
              <div className={`h-64 rounded-[24px] bg-gradient-to-br ${product.tone} p-5 shadow-inner`}>
                <div className="flex h-full flex-col justify-between rounded-[22px] border border-white/15 bg-white/8 p-4 text-white backdrop-blur-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-white/70">Cerebro Oil</p>
                      <p className="mt-2 text-2xl font-semibold leading-tight [font-family:var(--font-display)]">{product.name}</p>
                    </div>
                    <div className="rounded-full border border-white/20 px-3 py-1 text-[11px]">Premium</div>
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div className="h-24 w-20 rounded-[24px_24px_34px_34px] bg-[linear-gradient(180deg,var(--secondary)_0%,var(--color-warning)_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]" />
                    <div className="flex flex-col items-end gap-2 text-right text-sm text-white/76">
                      <span>250ml / 500ml / 1L</span>
                      <span>Export ready</span>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="mt-5 text-xl font-semibold tracking-tight [font-family:var(--font-display)]">{product.name}</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">{product.note}</p>
            </motion.article>
          ))}
        </div>
      </Section>

      <Section title="Why choose us" subtitle="Built for premium product confidence">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {chooseUs.map((title) => (
            <motion.article key={title} variants={item} whileHover={{ y: -5 }} className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_35px_rgba(70,50,20,0.06)] transition">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--role-admin)]">●</div>
              <h3 className="text-xl font-semibold tracking-tight [font-family:var(--font-display)]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-foreground)]">
                Designed to present a premium, professional brand while keeping the platform intelligent, traceable, and easy to trust.
              </p>
            </motion.article>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.94fr_1.06fr]">
          <motion.article variants={item} className="rounded-[30px] border border-[var(--border)] bg-[var(--secondary)] p-6 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">Trust indicators</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                ['Tunisian heritage', 'Authentic sourcing and local expertise'],
                ['Export quality', 'Elegant packaging and standards'],
                ['Sustainability', 'Efficient production and less waste'],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl bg-white/70 p-4">
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{text}</p>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article variants={item} className="rounded-[30px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_16px_35px_rgba(70,50,20,0.06)]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--muted-foreground)]">Testimonials</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                '“A polished brand experience that feels premium and credible.”',
                '“The traceability and quality story are clear and convincing.”',
              ].map((quote) => (
                <div key={quote} className="rounded-2xl border border-[var(--border)] bg-[var(--secondary)] p-4 text-sm leading-7 text-[var(--muted-foreground)]">
                  {quote}
                </div>
              ))}
            </div>
          </motion.article>
        </div>
      </Section>

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
    <section id={id} className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55 }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--muted-foreground)]">{subtitle}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] lg:text-5xl [font-family:var(--font-display)]">{title}</h2>
        <div className="mt-8">{children}</div>
      </motion.div>
    </section>
  );
}