'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * ZZIK MAP - Landing Page V3
 * Design: Neo-Korean Modernism
 * i18n: Full internationalization support
 */

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

export default function Home() {
  const { t } = useTranslation();

  const stats = [
    { value: '12', labelKey: 'destinations' as const, color: 'text-white' },
    { value: '2.3K', labelKey: 'travelers' as const, color: 'text-[var(--electric-cyan)]' },
    { value: '17', labelKey: 'patterns' as const, color: 'text-[var(--zzik-coral)]' },
  ];

  const steps = [
    {
      step: '01',
      titleKey: 'step1' as const,
      color: 'var(--zzik-coral)',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      step: '02',
      titleKey: 'step2' as const,
      color: 'var(--electric-cyan)',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      step: '03',
      titleKey: 'step3' as const,
      color: '#A78BFA',
      icon: (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const journeyDemoData = [
    { name: '북촌한옥마을', en: 'Bukchon Hanok Village', count: 847, pct: 37.3 },
    { name: '인사동', en: 'Insadong', count: 623, pct: 27.4 },
    { name: '남산타워', en: 'N Seoul Tower', count: 412, pct: 18.1 },
  ];

  return (
    <main className="min-h-screen bg-[var(--deep-space)] overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Layered Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--deep-space)] via-[#0D1B2A] to-[var(--deep-space)]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[var(--zzik-coral)]/8 rounded-full blur-[120px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.3, ease: 'easeOut' }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[var(--electric-cyan)]/6 rounded-full blur-[100px]"
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--zzik-coral)]/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[var(--electric-cyan)]/20 to-transparent" />
        </div>

        {/* Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          {/* Pre-title badge */}
          <motion.div variants={fadeInUp} className="mb-8">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-[var(--zzik-coral)] animate-pulse" />
              {t('landing', 'badge')}
            </span>
          </motion.div>

          {/* Logo */}
          <motion.h1
            variants={fadeInUp}
            className="text-7xl md:text-9xl font-black tracking-tighter mb-6"
          >
            <span className="text-[var(--zzik-coral)] drop-shadow-[0_0_80px_rgba(255,90,95,0.3)]">
              ZZIK
            </span>
            <span className="text-white ml-2 md:ml-4">MAP</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-zinc-400 mb-6 font-light tracking-wide"
          >
            {t('landing', 'subtitle')}
          </motion.p>

          {/* Main value proposition - V7 Anchoring + Loss Aversion */}
          <motion.div variants={fadeInUp} className="mb-14">
            <p className="text-2xl md:text-4xl text-white font-medium leading-relaxed">
              {/* Anchoring Bias: 847 = Credibility Anchor */}
              <span className="relative inline-block">
                <span className="text-[var(--electric-cyan)] font-bold text-4xl md:text-6xl">
                  847
                </span>
                <span className="text-zinc-300 ml-3">travelers know.</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="absolute -bottom-2 left-0 w-full h-0.5 bg-gradient-to-r from-[var(--electric-cyan)] to-transparent origin-left"
                />
              </span>
              <br />
              {/* Loss Aversion: "You decide" + "where they went next" = FOMO */}
              <span className="text-white">You decide.</span>
              <br className="hidden sm:block" />
              <span className="text-[var(--zzik-coral)] font-semibold">
                See where they went next
              </span>
            </p>
          </motion.div>

          {/* CTA Buttons - V7 Enhanced with Trust Signals */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/journey"
              className="group relative px-10 py-5 bg-[var(--zzik-coral)] text-white text-lg font-semibold rounded-2xl overflow-hidden transition-transform hover:scale-105"
            >
              <span className="relative z-10">{t('landing', 'ctaUpload')}</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[var(--zzik-coral)] to-[#FF8A8D]"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 shadow-[0_0_40px_rgba(255,90,95,0.4)]" />
            </Link>
            <Link
              href="/explore"
              className="group px-10 py-5 bg-transparent text-white text-lg font-semibold rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all"
            >
              <span className="flex items-center gap-2">
                {t('landing', 'ctaExplore')}
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </motion.div>

          {/* V7: Trust Signals - Level 1 (First 10 seconds) */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex items-center justify-center gap-6 text-sm"
          >
            <span className="flex items-center gap-2 text-zinc-400">
              <svg className="w-4 h-4 text-[var(--zzik-coral)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Photos stay private
            </span>
            <span className="text-zinc-500">•</span>
            <span className="flex items-center gap-2 text-zinc-400">
              <svg className="w-4 h-4 text-[var(--electric-cyan)]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.256 4.477a.75.75 0 11-1.06-1.06l2.25 2.25a2.25 2.25 0 011.414.586l5.159-5.159a.75.75 0 10-1.06-1.06L9.926 4.977a2.25 2.25 0 01-.67.244l-1 1zm9.248 4.523a.75.75 0 01-1.06-1.061l-4.5 4.5a.75.75 0 11-1.06-1.06l4.5-4.5a.75.75 0 011.06 1.06zM3.25 7.25a2.25 2.25 0 113.75 1.803.75.75 0 01.75 1.299A3.75 3.75 0 113.25 7.25z" />
              </svg>
              Real travelers
            </span>
          </motion.div>

          {/* Stats - V7 Visual Hierarchy & Color Contrast Improved */}
          <motion.div
            variants={fadeInUp}
            className="mt-20 grid grid-cols-3 gap-6 max-w-xl mx-auto"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.labelKey}
                variants={scaleIn}
                whileHover={{ y: -4 }}
                className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
              >
                <p className={`text-3xl md:text-4xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                {/* V7: Contrast improved from text-zinc-500 to text-zinc-400 (5.7:1 ratio) */}
                <p className="text-zinc-400 text-sm mt-1">{t('landing', 'stats', stat.labelKey)}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-1.5 h-3 bg-white/40 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-32 px-6 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-[var(--zzik-coral)]/30 to-transparent" />

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0.8, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-[var(--zzik-coral)] text-sm font-medium tracking-widest uppercase mb-4 block">
              {t('landing', 'howItWorks', 'sectionLabel')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {t('landing', 'howItWorks', 'title')}
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              {t('landing', 'howItWorks', 'subtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0.8, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                {idx < 2 && (
                  <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-white/10 to-transparent" />
                )}

                <div className="relative p-8 bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl transition-all group-hover:border-white/20 group-hover:bg-white/[0.07]">
                  <span
                    className="absolute -top-4 right-8 text-6xl font-black opacity-5"
                    style={{ color: item.color }}
                  >
                    {item.step}
                  </span>

                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    {item.icon}
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {t('landing', 'howItWorks', item.titleKey, 'title')}
                  </h3>
                  <p className="text-zinc-400 leading-relaxed">
                    {t('landing', 'howItWorks', item.titleKey, 'description')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Intelligence Feature */}
      <section className="py-32 px-6 relative bg-gradient-to-b from-zinc-900/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0.8, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[var(--zzik-coral)] text-sm font-medium tracking-widest uppercase mb-4 block">
                {t('landing', 'journeySection', 'label')}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {t('landing', 'journeySection', 'title1')}
                <br />
                <span className="text-zinc-400">{t('landing', 'journeySection', 'title2')}</span>
              </h2>
              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                {t('landing', 'journeySection', 'description', { count: '847' })}
              </p>
              <Link
                href="/journey"
                className="inline-flex items-center gap-3 text-[var(--zzik-coral)] font-medium hover:gap-4 transition-all group"
              >
                {t('landing', 'journeySection', 'cta')}
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0.8, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-[var(--zzik-coral)]/20 to-[var(--electric-cyan)]/20 rounded-3xl blur-2xl opacity-50" />

              <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <p className="text-zinc-400 text-sm mb-2">{t('landing', 'journeySection', 'from')}</p>
                <p className="text-white font-bold text-2xl mb-1">경복궁</p>
                <p className="text-zinc-400 text-sm mb-8">Gyeongbokgung Palace</p>

                <p className="text-zinc-400 text-sm mb-4">
                  {t('landing', 'journeySection', 'whereDidGo', { count: '2,271' })}
                </p>

                <div className="space-y-3">
                  {journeyDemoData.map((dest, idx) => (
                    <motion.div
                      key={dest.name}
                      initial={{ opacity: 0.8, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                      className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span className="w-8 h-8 rounded-full bg-[var(--zzik-coral)]/20 flex items-center justify-center text-[var(--zzik-coral)] text-sm font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-grow">
                        <p className="text-white font-medium">{dest.name}</p>
                        <p className="text-zinc-400 text-xs">{dest.en}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--electric-cyan)] font-bold">{dest.count}</p>
                        <p className="text-zinc-400 text-xs">{dest.pct}%</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA - V7 Habit Formation Loop */}
      <section className="py-32 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[600px] h-[600px] bg-[var(--zzik-coral)]/5 rounded-full blur-[100px]" />
          </div>

          <motion.div
            initial={{ opacity: 0.8, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('landing', 'finalCta', 'title1')}
              <br />
              {t('landing', 'finalCta', 'title2')}
            </h2>
            <p className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto">
              {t('landing', 'finalCta', 'description')}
            </p>

            {/* V7: Habit Formation Benefits (Cue → Reward) */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mb-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-sm"
            >
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="font-semibold text-white mb-1">Daily Cue</div>
                <div className="text-zinc-400">Get inspired every day</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="font-semibold text-white mb-1">2-Tap Routine</div>
                <div className="text-zinc-400">Upload in seconds</div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="font-semibold text-white mb-1">Instant Reward</div>
                <div className="text-zinc-400">Discover amazing places</div>
              </div>
            </motion.div>

            <Link
              href="/journey"
              className="inline-flex items-center gap-3 px-12 py-6 bg-[var(--zzik-coral)] hover:bg-[var(--zzik-coral)]/90 text-white text-xl font-semibold rounded-2xl transition-all hover:scale-105 shadow-[0_0_60px_rgba(255,90,95,0.3)]"
            >
              {t('landing', 'finalCta', 'button')}
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black">
              <span className="text-[var(--zzik-coral)]">ZZIK</span>
              <span className="text-white"> MAP</span>
            </span>
            <span className="w-px h-5 bg-white/20" />
            <span className="text-zinc-400 text-sm">{t('landing', 'footer', 'tagline')}</span>
          </div>

          <div className="flex gap-8 text-zinc-400 text-sm">
            <Link href="/journey" className="hover:text-white transition-colors">{t('nav', 'journey')}</Link>
            <Link href="/explore" className="hover:text-white transition-colors">{t('nav', 'explore')}</Link>
          </div>

          <p className="text-zinc-500 text-sm">
            {t('landing', 'footer', 'poweredBy')}
          </p>
        </div>
      </footer>
    </main>
  );
}
